import Joi from "joi";

const productsSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  imageUrl: Joi.string(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});
export default productsSchema;
