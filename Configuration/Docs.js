const express = require("express");
const ROUTER = express.Router();

const swaggerUi = require("swagger-ui-express");

const DocumentationOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "[테스트] 채팅 서버",
			version: "0.0.1",
			description: `|-
			현재 개발중 ...`,
		},
	},
	apis: ["./Route/**/*.js"],
};

ROUTER.use("", swaggerUi.serve, swaggerUi.setup(DocumentationOptions));

module.exports = ROUTER;
