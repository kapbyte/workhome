import appVersion1 from './v1.js';

const router = (app) => {
  app.use('/api/v1', appVersion1);
};

export default router;
