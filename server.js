import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import endpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notfoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import productsRouter from "./products/index.js";
import reviewsRouter from "./reviews/index.js";

const server = express();
const port = process.env.PORT || 3024;
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(400, `Origin ${currentOrigin} is not whitelisted.`)
        );
      }
    },
  })
);

server.use(express.static("public"));
server.use(express.json());

server.use("/products", productsRouter);
server.use("/products", reviewsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected!");
  server.listen(port, () => {
    console.table(endpoints(server));
    console.log(port);
  });
});
