import Joi from "joi";

const reviewsSchema = Joi.object({
  _id: Joi.string(),
  comment: Joi.string().required(),
  rate: Joi.number().min(0).max(5).required(),
  productId: Joi.string(),
  createdAt: Joi.date(),
});
export default reviewsSchema;
