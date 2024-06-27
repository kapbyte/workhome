import Joi from 'joi';

export const fetchContractValidator = Joi.object().keys({
  id: Joi.number().required(),
});
