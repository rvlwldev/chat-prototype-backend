const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");

const ChannelController = require("../../Controller/Channel");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");

ROUTER.get("/channels", JWT.verify, async (req, res, next) => {
	try {
		const { serviceId, userId } = req;
		const channels = await ChannelController.getChannelsByUser(serviceId, userId);

		const channelIdArray = channels.map((channel) => channel.id);
		WS.subscribeChannelArray(serviceId, userId, channelIdArray);

		res.status(HttpStatusCode.Ok).json({ channels: channels });
	} catch (err) {
		next(err);
	}
});

module.exports = ROUTER;
