import moment from 'moment';
import { Op } from 'sequelize';
import { sequelize } from '../model/model.js';

export const fetchContractById = async (req, profile) => {
  const { id } = req.params;
  const { type } = profile;
  const { Contract } = await req.app.get('models');

  const condition = { id };
  if (type === 'client') {
    condition.ClientId = profile.id;
  } else {
    condition.ContractorId = profile.id;
  }

  return await Contract.findOne({
    where: condition
  });
};

export const fetchUserContracts = async (req, payload) => {
  const { id, type } = payload;
  const { Contract } = await req.app.get('models');

  const whereClause = {
    status: ['in_progress', 'new']
  };
  if (type === 'client') {
    whereClause.ClientId = id;
  } else {
    whereClause.ContractorId = id;
  }

  return await Contract.findAll({
    where: whereClause
  });
};

export const fetchUserJobs = async (req, payload) => {
  const { id, type } = payload;
  const { Contract, Job } = await req.app.get('models');

  const condition = {
    status: ['in_progress', 'new'],
  };
  if (type === 'client') {
    condition.ClientId = id;
  } else {
    condition.ContractorId = id;
  }

  // Fetch contracts using the constructed condition and include related Job model
  const contracts = await Contract.findAll({
    where: condition,
    include: [{
      model: Job,
      where: {
        paid: false,
      },
      required: true,
    }],
  });

  // Extract jobs from contracts
  const jobs = contracts.flatMap(contract => contract.Jobs);
  return jobs;
};

export const jobPayment = async (req, payload, job_id) => {
  const { type } = payload;
  if (type !== 'client') { // Only a client can pay for a job
    return {
      status: false,
      message: 'Only client can pay for a job',
    };
  }

  const { Contract, Job, Profile } = await req.app.get('models');
  const job = await Job.findOne({
    where: {
      ContractId: job_id,
      paid: false,
    }
  });
  if (!job) {
    return {
      status: false,
      message: 'Job already paid or not found',
    };
  }

  const { balance } = payload;
  const { price, ContractId } = job;
  if (balance < price) {
    return {
      status: false,
      message: 'Not enough money to pay for job',
    };
  };
  const unpaid_job = await Job.findOne({
    where: { id: ContractId },
  });

  const contract = await Contract.findOne({
    where: {
      id: unpaid_job.ContractId,
      status: ['in_progress', 'new']
    },
  });
  if (!contract) {
    return {
      status: false,
      message: 'Contract terminated or not found',
    };
  }
  // return { status: true };
  try {
    await sequelize.transaction(async (_t) => {
      // Debit client
      await Profile.update(
        { balance: sequelize.literal(`balance - ${price}`) },
        {
          where: { id: contract.ClientId }
        }
      );

      // Credit contractor
      await Profile.update(
        { balance: sequelize.literal(`balance + ${price}`) },
        {
          where: { id: contract.ContractorId }
        }
      );

      // update that job to be paid
      await Job.update({ paid: true }, {
        where: {
          ContractId: job_id,
        }
      });
    });
    // If the execution reaches this line, the transaction has been committed successfully
    return {
      status: true,
    }
  } catch (error) {
    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
    return {
      status: true,
      message: error,
    }
  }
};

export const balanceDeposit = async (req, profile, userId) => {
  const { type } = profile;
  if (type !== 'client') {
    return {
      status: false,
      message: 'Only client can perform balance deposit',
    };
  }

  const { Contract, Profile, Job } = await req.app.get('models');
  const condition = {
    ClientId: userId,
    status: ['in_progress', 'new'],
  };

  const job_condition = {
    paid: false,
  };

  // Fetch contracts and associated jobs
  const contracts = await Contract.findAll({
    where: condition,
    include: [{
      model: Job,
      required: true, // Ensures only contracts with jobs are included
      where: job_condition,
    }]
  });

  // Extract jobs from contracts
  const jobs = contracts.flatMap(contract => contract.Jobs);
  const job_prices = jobs
    .map(job => job.price)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Calculate 25% of job_prices
  const job_prices_25_percent = job_prices * 0.25;
  const acc_update = await Profile.update(
    { balance: sequelize.literal(`balance + ${job_prices_25_percent}`) },
    {
      where: { id: userId }
    }
  );
  return {
    status: true,
    data: job_prices_25_percent,
  }
};

export const mostEarnedProfession = async (req, payload) => {
  const { start, end } = payload;
  const { Contract, Job, Profile } = await req.app.get('models');

  const contracts = await Contract.findAll({
    include: [{
      model: Job,
      required: true,
      where: {
        paymentDate: {
          [Op.between]: [moment(start).toDate(), moment(end).toDate()]
        },
        paid: true
      }
    }]
  });

  // Calculate earnings per profession
  const professionEarnings = {};
  for (const contract of contracts) {
    const contractor = await Profile.findOne({ where: { id: contract.ContractorId } });
    if (contractor) {
      const { profession } = contractor;
      const jobEarnings = contract.Jobs
        .filter(job => job.paid)
        .reduce((sum, job) => sum + parseFloat(job.price), 0);

      if (!professionEarnings[profession]) {
        professionEarnings[profession] = 0;
      }
      professionEarnings[profession] += jobEarnings;
    }
  }

  let maxEarnings = 0;
  let topProfession = null;
  for (const [profession, earnings] of Object.entries(professionEarnings)) {
    if (earnings > maxEarnings) {
      maxEarnings = earnings;
      topProfession = profession;
    }
  }
  return {
    status: true,
    topProfession, // Return the top earning profession
  };
};

export const topPayingClient = async (req, start, end, limit = 2) => {
  const { Contract, Profile, Job } = await req.app.get('models');

  // Fetch contracts and associated jobs within the date range
  const contracts = await Contract.findAll({
    include: [{
      model: Job,
      required: true, // Ensures only contracts with jobs are included
      where: {
        paymentDate: {
          [Op.between]: [moment(start).toDate(), moment(end).toDate()]
        },
        paid: true // Ensure only paid jobs are considered
      }
    }]
  });

  // Extract jobs from contracts
  const jobs = contracts.flatMap(contract => contract.Jobs);

  // Calculate total job prices
  const job_prices = jobs
    .map(job => job.price) // Map to get prices
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Sum up prices

  // Calculate 25% of job_prices
  const job_prices_25_percent = job_prices * 0.25;

  // Calculate total amount paid by each client
  const clientEarnings = {};
  for (const contract of contracts) {
    const clientId = contract.ClientId;
    const jobEarnings = contract.Jobs
      .filter(job => job.paid)
      .reduce((sum, job) => sum + parseFloat(job.price), 0);

    if (!clientEarnings[clientId]) {
      clientEarnings[clientId] = 0;
    }
    clientEarnings[clientId] += jobEarnings;
  }

  // Convert clientEarnings to an array and sort by earnings in descending order
  const sortedClients = Object.entries(clientEarnings)
    .map(([clientId, earnings]) => ({ clientId, earnings }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, limit); // Apply limit


  // Fetch client profiles for the top clients
  const topClients = await Promise.all(sortedClients.map(async client => {
    const clientProfile = await Profile.findOne({ where: { id: client.clientId } });
    return {
      ...client,
      clientProfile
    };
  }));

  return {
    status: true,
    jobs,
    job_prices,
    job_prices_25_percent, // Return 25% of job prices if needed
    topClients // Return the top clients who paid the most
  };
};

