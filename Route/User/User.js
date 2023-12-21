const express = require("express");
const ROUTER = express.Router();
const JWT = require("../../Utils/JWT");

const ServiceController = require("../../Controller/Service");
const UserController = require("../../Controller/User");
const ChannelController = require("../../Controller/Channel");

const UserExceptions = require("../../Exception/UserException");

const { HttpStatusCode } = require("axios");
const { WS } = require("../../Utils/WebSocket");

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

		const LOGIN_INFO = await UserController.getToken(SERVICE, USER, req.body.user.password);

		res.status(HttpStatusCode.Ok).json(LOGIN_INFO);
	} catch (err) {
		if (UserExceptions.isInstanceOf(err)) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 전체 관리자 로그인 (serviceId 없음)
ROUTER.post("/admin/login", async (req, res) => {});

ROUTER.get("/:userId/channels", JWT.verify, async (req, res) => {
	try {
		const serviceId = req.userData.serviceId;
		const userId = req.userData.id;

		const channels = await ChannelController.getChannelsByUserId(serviceId, userId);

		for (const channel of channels) WS.subscribe(serviceId, userId, channel.id);

		res.status(HttpStatusCode.Ok).json({ channels: channels });
	} catch (err) {
		if (err instanceof UserNotFoundException)
			res.status(HttpStatusCode.NotFound).send(err.message);
		else res.status(HttpStatusCode.InternalServerError).send(err);
	}
});

module.exports = ROUTER;
