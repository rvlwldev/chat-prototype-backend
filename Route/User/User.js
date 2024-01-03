const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");

const ChannelController = require("../../Controller/Channel");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");
const Exception = require("../../Exception/Exception");

ROUTER.get("/:userId/channels", JWT.verify, async (req, res) => {
	try {
		let { serviceId, userId } = req;
		const CHANNELS = await ChannelController.getChannelsByUser(serviceId, userId);

		res.status(HttpStatusCode.Ok).json({ channels: CHANNELS });

		let channelIdArray = CHANNELS.map((channel) => channel.id);
		WS.subscribeChannelArray(serviceId, userId, channelIdArray);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

module.exports = ROUTER;
