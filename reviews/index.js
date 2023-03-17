import express from "express";
import ReviewsModel from "./reviewsModel.js";
import ProductsModel from "../products/productsModel.js";
import createHttpError from "http-errors";

const reviewsRouter = express.Router();

reviewsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const foundProduct = ProductsModel.findById(req.params.productId);
    if (foundProduct) {
      const newReview = new ReviewsModel(req.body);
      const { _id } = await newReview.save();
      const updteProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        { $push: { reviews: _id } },
        { new: true, runValidators: true }
      );

      res.status(201).send({ updtedProduct: updteProduct });
    } else {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} was not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});
reviewsRouter.get("/:productId/reviews/", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId);
    if (!product) {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} was not found!`
        )
      );
    }
    res.send(product.reviews);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findById(req.params.productId);
    if (product) {
      const comment = product.reviews.find(
        (comment) => comment._id.toString() === req.params.reviewId
      );
      if (comment) {
        res.send(comment);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} was not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product Post with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
reviewsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const review = await ReviewsModel.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      { new: true, runValidators: true }
    );
    if (review) {
      res.status(200).send(review);
    } else {
      createHttpError(
        404,
        `Review with the id ${req.params.reviewId} was not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const review = await ReviewsModel.findByIdAndDelete(req.params.reviewId);
      await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: req.params.reviewId } },
        { new: true, runValidators: true }
      );
      if (review) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;
