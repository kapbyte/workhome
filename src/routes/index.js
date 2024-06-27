import { Router } from 'express';
import { getProfile } from '../middleware/getProfile.js';
import validateData from '../middleware/request-validator.js';
import * as contractController from '../controller/index.js';
import {
  fetchContractValidator,
} from '../validator/index.js'

const router = Router();

router.get(
  '/contracts/:id',
  validateData(fetchContractValidator, 'params'),
  getProfile,
  contractController.fetchContractById
);

router.get(
  '/contracts',
  getProfile,
  contractController.fetchUserContracts
);

router.get(
  '/jobs/unpaid',
  getProfile,
  contractController.fetchUserJobs
);

router.post(
  '/jobs/:job_id/pay',
  getProfile,
  contractController.jobPayment
);

router.post(
  '/balances/deposit/:userId',
  getProfile,
  contractController.balanceDeposit
);

router.get(
  '/admin/best-profession',
  getProfile,
  contractController.mostEarnedProfession
);

router.get(
  '/admin/best-clients',
  getProfile,
  contractController.topPayingClients
);

export default router;
