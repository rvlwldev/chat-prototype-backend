const express = require("express");
const ROUTER = express.Router();

const JWT = require("../../Utils/JWT");

const ServiceController = require("../../Controller/Service");
const ServiceException = require("../../Exception/ServiceException");

const { HttpStatusCode } = require("axios");

ROUTER.post("/", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		const SERVICE = await ServiceController.saveService(req.USER, req.body.name, req.body.id);
		res.status(HttpStatusCode.Created).json(SERVICE);
	} catch (err) {
		if (ServiceException.isInstanceOf(err)) res.status(err.httpStatusCode).json(err);
	}
});

ROUTER.get("/:serviceId", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		const SERVICE = await ServiceController.getService(req.params.serviceId);
		res.status(HttpStatusCode.Ok).json(SERVICE);
	} catch (err) {
		if (ServiceException.isInstanceOf(err)) res.status(err.httpStatusCode).json(err);
	}
});

ROUTER.get("/", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		res.status(HttpStatusCode.Ok).json(await ServiceController.getAllService());
	} catch (err) {
		if (ServiceException.isInstanceOf(err)) res.status(err.httpStatusCode).json(err);
	}
});

module.exports = ROUTER;
