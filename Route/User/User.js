const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");

const ChannelController = require("../../Controller/Channel");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");

ROUTER.get("/channels", JWT.verify, async (req, res, next) => {
	try {
		let { serviceId, userId } = req;
		const CHANNELS = await ChannelController.getChannelsByUser(serviceId, userId);

		res.status(HttpStatusCode.Ok).json({ channels: CHANNELS });

		let channelIdArray = CHANNELS.map((channel) => channel.id);
		WS.subscribeChannelArray(serviceId, userId, channelIdArray);
	} catch (err) {
		next(err);
	}
});

module.exports = ROUTER;
