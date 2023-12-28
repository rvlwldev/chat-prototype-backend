const express = require("express");
const ROUTER = express.Router();

const JWT = require("../../Utils/JWT");

const ServiceController = require("../../Controller/Service");
const UserController = require("../../Controller/User");

const { HttpStatusCode } = require("axios");

ROUTER.post("/", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		const SERVICE = await ServiceController.saveService(req.USER, req.body.name, req.body.id);
		res.status(HttpStatusCode.Created).json(SERVICE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		res.status(HttpStatusCode.Ok).json(await ServiceController.getAllService());
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/:serviceId", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		const SERVICE = await ServiceController.getServiceById(req.params.serviceId);
		res.status(HttpStatusCode.Ok).json(SERVICE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/:serviceId/users", JWT.verify, ServiceController.authenticate, async (req, res) => {
	try {
		const SERVICE = await ServiceController.getServiceById(req.params.serviceId);
		const USERS = await UserController.getUsersByService(SERVICE);

		res.status(HttpStatusCode.Ok).json(USERS);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

module.exports = ROUTER;
