import { StatusCodes } from 'http-status-codes';
import * as Service from '../service/index.js';
import * as Response from '../shared/api-response.js';

export const fetchContractById = async (req, res) => {
  const { profile } = req;
  const response = await Service.fetchContractById(
    req,
    profile,
  );
  if (!response) {
    return Response.error(
      res,
      { message: 'No contract found for this profile' },
      StatusCodes.NOT_FOUND,
    );
  }
  return Response.success(
    res,
    'Successfully fetched profile contract',
    StatusCodes.OK,
    response,
  );
};

export const fetchUserContracts = async (req, res) => {
  const { id, type } = req.profile;
  const response = await Service.fetchUserContracts(
    req,
    { id, type },
  );
  return Response.success(
    res,
    'Successfully fetched user active contracts',
    StatusCodes.OK,
    response
  );
};

export const fetchUserJobs = async (req, res) => {
  const { id, type } = req.profile;
  const response = await Service.fetchUserJobs(
    req,
    { id, type },
  );
  return Response.success(
    res,
    'Successfully fetched user jobs',
    StatusCodes.OK,
    response
  );
};

export const jobPayment = async (req, res) => {
  const { profile } = req;
  const { job_id } = req.params;
  const response = await Service.jobPayment(req, profile, job_id);
  const { status } = response;
  if (!status) {
    return Response.error(res, response, StatusCodes.BAD_REQUEST);
  }
  return Response.success(
    res,
    'Job payment successful',
    StatusCodes.OK,
  );
};

export const balanceDeposit = async (req, res) => {
  const { profile } = req;
  const { userId } = req.params;
  const response = await Service.balanceDeposit(req, profile, userId);
  const { status } = response;
  if (!status) {
    return Response.error(res, response, StatusCodes.BAD_REQUEST);
  }
  return Response.success(
    res,
    'Balance deposit successful',
    StatusCodes.OK,
    response
  );
};

export const mostEarnedProfession = async (req, res) => {
  const { start, end } = req.query;
  const response = await Service.mostEarnedProfession(req, { start, end });
  return Response.success(
    res,
    'Profession report',
    StatusCodes.OK,
    response
  );
};

export const topPayingClients = async (req, res) => {
  const { start, end } = req.query;
  const response = await Service.topPayingClient(req, { start, end });
  return Response.success(
    res,
    'Profession report',
    StatusCodes.OK,
    response
  );
};
