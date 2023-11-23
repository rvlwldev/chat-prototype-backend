const express = require("express");
const ROUTER = express.Router();

const ChannelService = require("../../Service/Chat/Channel");

const { HttpStatusCode } = require("axios");

ROUTER.get("/", async (req, res) => {
	const USER_ID = req.query.userId;
	let channelArray = await ChannelService.getUserChannelIdArray(USER_ID);

	res.status(HttpStatusCode.Ok).send(channelArray);
});

module.exports = ROUTER;
