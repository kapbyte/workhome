import { StatusCodes } from 'http-status-codes';
import * as Response from '../shared/api-response.js';

export const getProfile = async (req, res, next) => {
  const { profile_id } = req.headers;
  const { Profile } = req.app.get('models');
  const profile = await Profile.findOne({ where: { id: profile_id } });
  if (!profile) {
    return Response.error(
      res,
      { message: 'No profile found' },
      StatusCodes.UNAUTHORIZED,
    );
  }
  req.profile = profile;
  next();
};
