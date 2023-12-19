const express = require("express");
const ROUTER = express.Router();

const swaggerUi = require("swagger-ui-express");

ROUTER.use("", swaggerUi.serve, swaggerUi.setup(require("./docs.json")));

module.exports = ROUTER;
