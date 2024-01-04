const ROUTER = require("express").Router();
const Validator = require("../../Exception/Validator");

const ServiceController = require("../../Controller/Service");
const ChannelController = require("../../Controller/Channel");
const UserController = require("../../Controller/User");

const { HttpStatusCode } = require("axios");
const Exception = require("../../Exception/Exception");

ROUTER.post("/register", Validator.body.serviceId, async (req, res, next) => {
	try {
		const { serviceId, id: userId, password, name, roleCode } = req.body;

		const USER = await UserController.createUser(serviceId, userId, password, name, roleCode);
		const PUBLIC_CHANNELS = await ChannelController.getChannelsByTypeCode(serviceId, 50);

		await ChannelController.saveUserChannelsWithChannels(serviceId, userId, PUBLIC_CHANNELS);

		res.status(HttpStatusCode.Created).json({
			service: await ServiceController.getServiceById(serviceId),
			user: USER,
			channels: PUBLIC_CHANNELS,
		});
	} catch (err) {
		next(err);
	}
});

ROUTER.post("/login", Validator.body.serviceId, Validator.body.userId, async (req, res) => {
	try {
		const { serviceId, userId, password } = req.body;

		res.status(HttpStatusCode.Ok).json({
			service: await ServiceController.getServiceById(serviceId),
			user: await UserController.getUser(serviceId, userId),
			token: await UserController.getToken(serviceId, userId, password),
		});
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
