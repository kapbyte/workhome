import Sequelize from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/config/database/database.sqlite3'
});

class Profile extends Sequelize.Model { }
Profile.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  profession: {
    type: Sequelize.STRING,
    allowNull: false
  },
  balance: {
    type: Sequelize.DECIMAL(12, 2)
  },
  type: {
    type: Sequelize.ENUM('client', 'contractor')
  }
}, {
  sequelize,
  modelName: 'Profile'
});

class Contract extends Sequelize.Model { }
Contract.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  terms: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('new', 'in_progress', 'terminated')
  },
  ClientId: {
    type: Sequelize.INTEGER,
    references: {
      model: Profile,
      key: 'id'
    }
  },
  ContractorId: {
    type: Sequelize.INTEGER,
    references: {
      model: Profile,
      key: 'id'
    }
  },
}, {
  sequelize,
  modelName: 'Contract'
});

class Job extends Sequelize.Model { }
Job.init({
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  price: {
    type: Sequelize.DECIMAL(12, 2),
    allowNull: false
  },
  paid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  paymentDate: {
    type: Sequelize.DATE
  },
  ContractId: {
    type: Sequelize.INTEGER,
    references: {
      model: Contract,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Job'
});

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
// Job.belongsTo(Contract);
// Contract.hasMany(Job, { foreignKey: 'ContractId' });
Job.belongsTo(Contract, { foreignKey: 'ContractId' });

sequelize.sync();

export { sequelize, Profile, Contract, Job };
