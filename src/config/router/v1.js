import { Router } from 'express';
import route from '../../routes/index.js';

const api = Router();

api.use(route);

export default api;
