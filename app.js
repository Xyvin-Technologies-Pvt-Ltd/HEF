require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const responseHandler = require("./src/helpers/responseHandler");
const {
  swaggerUi,
  swaggerSpec,
  swaggerOptions,
} = require("./src/swagger/swagger");
const eventRoute = require("./src/routes/event");
const newsRoute = require("./src/routes/news");
const adminRoute = require("./src/routes/admin");
const roleRoute = require("./src/routes/role");
const promotionRoute = require("./src/routes/promotion");
const notificationRoute = require("./src/routes/notification");
const reportRoute = require("./src/routes/report");
const hierarchyRoute = require("./src/routes/hierarchy");

const productRoute = require ("./src/routes/product")
const userRoute = require ("./src/routes/user")
const feedsRoute = require("./src/routes/feeds");

//! Create an instance of the Express application
const app = express();

//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
//* Use volleyball for request logging
app.use(volleyball);
//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());
//* Parse JSON request bodies
app.use(express.json());
//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;
//* Import database connection module
require("./src/helpers/connection");

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?"
  );
});

//* Swagger setup
app.use(
  `${BASE_PATH}/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerOptions)
);

//* Configure routes for user API
app.use(`${BASE_PATH}/event`, eventRoute);
app.use(`${BASE_PATH}/news`, newsRoute);
app.use(`${BASE_PATH}/admin`, adminRoute);
app.use(`${BASE_PATH}/role`, roleRoute);
app.use(`${BASE_PATH}/promotion`,promotionRoute)
app.use(`${BASE_PATH}/Notification`,notificationRoute)
app.use(`${BASE_PATH}/report`,reportRoute)
app.use(`${BASE_PATH}/hierarchy`,hierarchyRoute)
app.use(`${BASE_PATH}/feeds`, feedsRoute);
app.use(`${BASE_PATH}/product`, productRoute);
app.use(`${BASE_PATH}/user`, userRoute);

//* Handle all unmatched routes with a 404 error
app.all("*", (req, res) => {
  return responseHandler(res, 404, "No API Found..!");
});

//! Start the server and listen on the specified port from environment variable
app.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});
