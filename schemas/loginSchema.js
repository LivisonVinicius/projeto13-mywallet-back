import joi from 'joi';

const loginSchema = joi.object({
  email: joi.string().email().required(),
  pwd: joi.string().required()
});

export default loginSchema;