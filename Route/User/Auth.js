const ROUTER = require("express").Router();

const ServiceController = require("../../Controller/Service");
const ChannelController = require("../../Controller/Channel");
const UserController = require("../../Controller/User");

const { HttpStatusCode } = require("axios");
const Exception = require("../../Exception/Exception");

ROUTER.post("/register", async (req, res) => {
	try {
		const { serviceId, id, password, name, role } = req.body;

		const SERVICE = await ServiceController.getServiceById(serviceId);
		const USER = await UserController.createUser(SERVICE, id, password, name, role);

		const PUBLIC_CHANNELS = await ChannelController.getChannelsByTypeCode(req.SERVICE, 50);
		await ChannelController.saveUserChannelsWithChannels(SERVICE, USER, PUBLIC_CHANNELS);

		res.status(HttpStatusCode.Created).json({ service: SERVICE, user: USER });
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
		const SERVICE = await ServiceController.getServiceById(req.body.serviceId);
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
