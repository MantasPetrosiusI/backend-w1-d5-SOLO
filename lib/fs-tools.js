import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

const JSONDataFolder = join(dirname(fileURLToPath(import.meta.url)), "../data");
const productsJSON = join(JSONDataFolder, "products.json");
const reviewsJSON = join(JSONDataFolder, "reviews.json");
const productImagesFolder = join(process.cwd(), "./public/img/products");

export const getProducts = () => readJSON(productsJSON);
export const writeProducts = (productsArray) =>
  writeJSON(productsJSON, productsArray);

export const getReviews = () => readJSON(reviewsJSON);
export const writeReviews = (reviewsArray) =>
  writeJSON(reviewsJSON, reviewsArray);

export const saveProductImage = (fileName, fileContentAsBuffer) =>
  writeFile(join(productImagesFolder, fileName), fileContentAsBuffer);
