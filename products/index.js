import express from "express";
import createError from "http-errors";
import {
  getProducts,
  writeProducts,
  saveProductImage,
} from "../lib/fs-tools.js";
import ProductsModel from "./productsModel.js";
import multer from "multer";
import { extname } from "path";

const productsRouter = express.Router();
////////////////////////////////////////////////////////////////////////////////
{
  /*Products Section*/
}
////////////////////////////////////////////////////////////////////////////////
productsRouter.get("/", async (req, res, next) => {
  const perPage = req.query.limit;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;

  try {
    const products = await ProductsModel.find()
      .sort(req.query.sort)
      .skip(skip)
      .limit(perPage)
      .populate({
        path: "reviews",
        select: "comment rate",
        options: { _id: 0 },
      });
    const userQuery = Object.keys(req.query)[0];
    if (userQuery === "category") {
      if (req.query && req.query.category) {
        const foundProducts = products.filter(
          (product) => product.category === req.query.category
        );
        res.send(foundProducts);
      }
    } else if (userQuery === "price") {
      if (req.query && req.query.price) {
        const foundProducts = products.filter(
          (product) => product.price === req.query.price
        );
        res.send(foundProducts);
      }
    } else {
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const products = await ProductsModel.findById(
      req.params.productId
    ).populate({
      path: "reviews",
      select: { _id: 0, comment: 1, rate: 1 },
    });
    if (!products) {
      next(
        createError(
          404,
          `Product with id ${req.params.productId} was not found!`
        )
      );
    }
    res.send(products);
  } catch (error) {
    next(error);
  }
});
productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body);
    const { _id } = await newProduct.save();
    if (!newProduct) {
      res.send(`Problems creating new product!`);
    }
    res.status(201).send(newProduct);
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(
        createError(
          404,
          `Product with id ${req.params.productId} was not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByIdAndDelete(req.params.productId);
    if (product) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Product with id ${req.params.productId} was not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

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
            updatedAt: new Date(),
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
