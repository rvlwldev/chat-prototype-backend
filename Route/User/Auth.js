const express = require("express");
const ROUTER = express.Router();

const ServiceController = require("../../Controller/Service");
const UserController = require("../../Controller/User");

const UserExceptions = require("../../Exception/User/UserException");

const { HttpStatusCode } = require("axios");

ROUTER.post("/register", async (req, res) => {
	try {
		const { serviceId, id, password, name, role } = req.body;

		const SERVICE = await ServiceController.getService(serviceId);
		const USER = await UserController.createUser(SERVICE, id, password, name, role);

		res.status(HttpStatusCode.Created).json({ service: SERVICE, user: USER });
	} catch (err) {
		if (UserExceptions.isInstanceOf(err)) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.post("/login", async (req, res) => {
	try {
		const SERVICE = await ServiceController.getService(req.body.serviceId);
		const USER = await UserController.getUser(SERVICE, req.body.user.id);
		const TOKEN = await UserController.getToken(SERVICE, USER, req.body.user.password);

		res.status(HttpStatusCode.Ok).json({ service: SERVICE, user: USER, token: TOKEN });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 전체 관리자 로그인 (serviceId 없음)
ROUTER.post("/admin/login", async (req, res) => {});

module.exports = ROUTER;
