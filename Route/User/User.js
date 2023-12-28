const express = require("express");
const ROUTER = express.Router();
const JWT = require("../../Utils/JWT");

const ChannelController = require("../../Controller/Channel");

const { HttpStatusCode } = require("axios");
const { WS } = require("../../Utils/WebSocket");
const Exception = require("../../Exception/Exception");

ROUTER.get("/:userId/channels", JWT.verify, async (req, res) => {
	try {
		const CHANNELS = await ChannelController.getChannelsByUser(req.SERVICE, req.USER);
		let idArray = CHANNELS.map((CHANNEL) => CHANNEL.id);

		WS.subscribeAll(req.SERVICE.id, req.USER.id, idArray);
		res.status(HttpStatusCode.Ok).json({ channels: CHANNELS });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

module.exports = ROUTER;
