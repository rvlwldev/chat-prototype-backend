const express = require("express");
const ROUTER = express.Router();
const JWT = require("../../Utils/JWT");

const ServiceController = require("../../Controller/Service");
const UserController = require("../../Controller/User");
const ChannelController = require("../../Controller/Channel");

const UserNotFoundException = require("../../Exception/User/UserNotFound");

const { HttpStatusCode } = require("axios");

// TODO : 에러처리
ROUTER.post("/register", async (req, res) => {
	try {
		const { serviceId, id, password, name, role } = req.body;

		const SERVICE = await ServiceController.getService(serviceId);
		const USER = await UserController.createUser(serviceId, id, password, name, role);

		res.status(HttpStatusCode.Created).json({ service: SERVICE, user: USER });
	} catch (err) {
		console.log(err);
		res.status(HttpStatusCode.InternalServerError).json(err);
	}
});

ROUTER.post("/login", async (req, res) => {
	try {
		let serviceId = req.body.serviceId;
		let userId = req.body.user.id;
		let password = req.body.user.password;

		const result = await UserController.getToken(serviceId, userId, password);
		res.status(HttpStatusCode.Ok).json(result);
	} catch (err) {
		// TODO : 비밀번호 틀림 Exception 만들기 (Unauthorized)
		console.log(err);
		console.log(err.message);
		if (err instanceof UserNotFoundException) res.status(HttpStatusCode.NotFound).json(err);
		else {
			console.log(err);
			res.status(HttpStatusCode.InternalServerError).json(err);
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
		res.status(HttpStatusCode.Ok).json({ channels: channels });
	} catch (err) {
		if (err instanceof UserNotFoundException)
			res.status(HttpStatusCode.NotFound).send(err.message);
		else {
			console.log(err);
			res.status(HttpStatusCode.InternalServerError).send(err);
		}
	}
});

module.exports = ROUTER;
