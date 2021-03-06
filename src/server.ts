import mongoose from "mongoose";
import bodyParser from "body-parser";
import express from "express";
import * as core from "express-serve-static-core";

import { logger } from "./logging";

// creation of models
import "./api/priceModel";
// creation of the price fetcher
import "./api/priceFetcher";
import routes  from "./api/routes";

// starting of express
const app = express();
const PORT = process.env.PORT || 3003;

// mongo db client connection
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.VPT_MONGODB_URL || "mongodb://localhost/prices",
  { useNewUrlParser: true }
);

const allowCrossDomain = (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

// middleware to parse input
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app as unknown as core.Express);

/**
 * Handler for everything that didn't found any route
 */
/*app.use(function(req, res) {
  logger.warn(`Requested URL was not available: ${req.originalUrl}`);
  res.status(404).send({ url: req.originalUrl + " not found" });
});*/

// start server on Port XYZ
app.listen(PORT);

logger.info(`Pricelist RESTful API server started on port: ${PORT}`);
