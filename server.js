import express from "express";
import endpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notfoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import productsRouter from "./products/index.js";

const server = express();

server.use(express.static("public"));
server.use(express.json());

server.use("/products", productsRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

server.listen(1412, () => {
  console.table(endpoints(server));
});
