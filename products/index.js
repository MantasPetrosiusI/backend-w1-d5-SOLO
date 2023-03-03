import express from "express";
import uniqid from "uniqid";
import createError from "http-errors";
import {
  getProducts,
  getReviews,
  writeProducts,
  writeReviews,
  saveProductImage,
} from "../lib/fs-tools.js";
import productsSchema from "./productsSchema.js";
import reviewsSchema from "./reviewsSchema.js";
import multer from "multer";
import { extname } from "path";

const productsRouter = express.Router();
////////////////////////////////////////////////////////////////////////////////
{
  /*Products Section*/
}
////////////////////////////////////////////////////////////////////////////////
productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();

    const product = products.find(
      (singleProduct) => singleProduct._id === req.params.productId
    );
    if (product) {
      res.send(product);
    } else {
      next(
        createError(
          404,
          `Product with this id does not exist! (${req.params.productId})`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.post("/", async (req, res, next) => {
  try {
    const { error } = productsSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const newProduct = {
      _id: uniqid(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const products = await getProducts();
    products.push(newProduct);
    await writeProducts(products);

    res.status(201).send({ id: newProduct._id });
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();

    const index = products.findIndex(
      (product) => product._id === req.params.productId
    );
    if (index !== -1) {
      const preEdit = products[index];
      const afterEdit = { ...preEdit, ...req.body, updatedAt: new Date() };
      products[index] = afterEdit;
      await writeProducts(products);
      res.send(afterEdit);
    } else {
      next(
        createError(
          404,
          `Product with this id does not exist! (${req.params.productId})`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const products = await getProducts();
    const remainingProducts = products.filter(
      (product) => product._id !== req.params.productId
    );

    if (products.length !== remainingProducts.length) {
      await writeProducts(remainingProducts);
      res.status(204).send(`Product deleted!`);
    } else {
      next(
        createError(
          404,
          `Product with this id does not exist! (${req.params.productId})`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    if (req.query && req.query.category) {
      const foundProducts = products.filter(
        (product) => product.category === req.query.category
      );
      res.send(foundProducts);
    } else {
      res.send(`No products found in ${req.query.category} category`);
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});
////////////////////////////////////////////////////////////////////////////////
{
  /*Reviews Section*/
}
////////////////////////////////////////////////////////////////////////////////
productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const { error } = reviewsSchema.validate(req.body);
    if (error) {
      next(createError(400));
    }
    const newReview = {
      _id: uniqid(),
      ...req.body,
      productId: req.params.productId,
      createdAt: new Date(),
    };
    const reviews = await getReviews();
    reviews.push(newReview);
    await writeReviews(reviews);

    res.status(201).send({ id: newReview._id });
  } catch (error) {
    next(error);
  }
});
productsRouter.get("/:productId/reviews/", async (req, res, next) => {
  try {
    const reviews = await getReviews();
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviews = await getReviews();

    const review = reviews.find(
      (singleReview) => singleReview._id === req.params.reviewId
    );
    if (review) {
      res.send(review);
    } else {
      next(
        createError(
          404,
          `Product with this id does not exist! (${req.params.reviewId})`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const reviews = await getReviews();

    const index = reviews.findIndex(
      (review) => review._id === req.params.reviewId
    );
    if (index !== -1) {
      const preEdit = reviews[index];
      const afterEdit = { ...preEdit, ...req.body, updatedAt: new Date() };
      reviews[index] = afterEdit;
      await writeReviews(reviews);
      res.send(afterEdit);
    } else {
      next(
        createError(
          404,
          `Product with this id does not exist! (${req.params.reviewId})`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const reviews = await getReviews();
      const remainingReviews = reviews.filter(
        (review) => review._id !== req.params.reviewId
      );

      if (reviews.length !== remainingReviews.length) {
        await writeReviews(remainingReviews);
        res.status(204).send(`Product deleted!`);
      } else {
        next(
          createError(
            404,
            `Product with this id does not exist! (${req.params.reviewId})`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
////////////////////////////////////////////////////////////////////////////////
{
  /*Image Section*/
}
////////////////////////////////////////////////////////////////////////////////
productsRouter.post(
  "/:productId/upload",
  multer().single("productImg"),
  async (req, res, next) => {
    try {
      if (req.file) {
        const fileExtension = extname(req.file.originalname);
        const fileName = req.params.productId + fileExtension;
        console.log(req.file);
        await saveProductImage(fileName, req.file.buffer);

        const products = await getProducts();
        const index = products.findIndex(
          (product) => product._id === req.params.productId
        );
        if (index !== -1) {
          const preEdit = products[index];
          const afterEdit = {
            ...preEdit,
            imageUrl: `http://localhost:3000/images/products/${fileName}`,
          };
          products[index] = afterEdit;

          await writeProducts(products);
          res.send({ message: "Image uploaded" });
        } else {
          next(
            createError(404, {
              message: `Product with id ${req.params.productId} does not exist!`,
            })
          );
        }
      } else {
        next(createError(400, { message: `Upload an image!` }));
      }
    } catch (error) {
      next(error);
    }
  }
);
export default productsRouter;
