require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const admin = require("firebase-admin");
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
const productRoute = require("./src/routes/product");
const userRoute = require("./src/routes/user");
const feedsRoute = require("./src/routes/feeds");
const reviewRoute = require("./src/routes/review");
const analyticRoute = require("./src/routes/analytic");
const chatRoute = require("./src/routes/chat");
const subscriptionRoute = require("./src/routes/subscription");
const userAccessRoute = require("./src/routes/userAccess");
const { serviceAccount } = require("./src/config/firebase");
const { app, server } = require("./src/socket"); //! Import server and io from socket file
const paymentRoute = require("./src/routes/payments");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;

//* Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL,
});

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

//* Start the cron job
require("./src/jobs");

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
app.use(`${BASE_PATH}/promotion`, promotionRoute);
app.use(`${BASE_PATH}/notification`, notificationRoute);
app.use(`${BASE_PATH}/report`, reportRoute);
app.use(`${BASE_PATH}/hierarchy`, hierarchyRoute);
app.use(`${BASE_PATH}/feeds`, feedsRoute);
app.use(`${BASE_PATH}/product`, productRoute);
app.use(`${BASE_PATH}/user`, userRoute);
app.use(`${BASE_PATH}/review`, reviewRoute);
app.use(`${BASE_PATH}/analytic`, analyticRoute);
app.use(`${BASE_PATH}/chat`, chatRoute);
app.use(`${BASE_PATH}/subscription`, subscriptionRoute);
app.use(`${BASE_PATH}/useraccess`, userAccessRoute);
app.use(`${BASE_PATH}/payment`, paymentRoute);

app.post(`${BASE_PATH}/upload`, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    await upload.done();

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    return responseHandler(res, 200, "Upload successful", fileUrl);
  } catch (error) {
    return responseHandler(res, 500, `Upload Failed ${error.message}`);
  }
});

app.all("*", (req, res) => {
  return responseHandler(res, 404, "No API Found..!");
});

//! Start the server and listen on the specified port from environment variable
server.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});