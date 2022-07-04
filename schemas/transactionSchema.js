import joi from 'joi';

const transactionSchema = joi.object({
  money: joi.string().required(),
  description: joi.string().required()
});

export default transactionSchema;