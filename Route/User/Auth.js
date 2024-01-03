const ROUTER = require("express").Router();

const ServiceController = require("../../Controller/Service");
const ChannelController = require("../../Controller/Channel");
const UserController = require("../../Controller/User");

const { HttpStatusCode } = require("axios");
const Exception = require("../../Exception/Exception");

ROUTER.post("/register", async (req, res) => {
	try {
		const { serviceId, id, password, name, roleCode } = req.body;

		const SERVICE = await ServiceController.getServiceById(serviceId);
		const USER = await UserController.createUser(serviceId, id, password, name, roleCode);

		const PUBLIC_CHANNELS = await ChannelController.getChannelsByTypeCode(req.SERVICE, 50);
		await ChannelController.saveUserChannelsWithChannels(serviceId, id, PUBLIC_CHANNELS);

		res.status(HttpStatusCode.Created).json({
			service: SERVICE,
			user: USER,
			channels: PUBLIC_CHANNELS,
		});
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.post("/login", async (req, res) => {
	try {
		let { serviceId, user } = req.body;
		let { id: userId, password } = user;

		const SERVICE = await ServiceController.getServiceById(serviceId);
		const USER = await UserController.getUser(serviceId, userId);
		const TOKEN = await UserController.getToken(serviceId, userId, password);

		res.status(HttpStatusCode.Ok).json({ service: SERVICE, user: USER, token: TOKEN });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 전체 관리자 로그인 (serviceId 없는 유저)
ROUTER.post("/admin/login", async (req, res) => {});

module.exports = ROUTER;
