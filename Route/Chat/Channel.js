const express = require("express");
const ROUTER = express.Router();

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = require("../../Service/Chat/Channel");

const { HttpStatusCode } = require("axios");

ROUTER.get("/:userId", async (req, res) => {
	let channelArray = await ChannelService.getUserChannelsByUserId(req.params.userId);
	res.status(HttpStatusCode.Ok).send(channelArray);
});

ROUTER.get("/:channelId/info", async (req, res) => {
	console.log(`ROUTER.get("/:channelId", ... `);

	let info = await ChannelService.getChannelInfo(req.params.channelId);

	console.log(info);

	res.status(HttpStatusCode.Ok).send(info);
});

// ROUTER.get("/:channelId/members", async (req, res) => {
// 	let channels = await ChannelService.getUserChannelsByUserId(req.params.userId);
// 	res.status(HttpStatusCode.Ok).send(channels);
// });

ROUTER.post("/:channelId/members/add", async (req, res) => {
	const channelId = req.params.channelId;
	let members = req.body.members;
	if (!members instanceof Array) members = [members];

	let body = { members: members };

	await exAPI
		.post(`channels/${channelId}/members/add`, body)
		.then((response) => res.status(HttpStatusCode.Created).send(response))
		.catch((err) => {
			if (err.code == "2003" || err.code == "3003")
				res.status(HttpStatusCode.NotFound).send(err);
			else res.status(HttpStatusCode.BadRequest).send(err);
		});
});

module.exports = ROUTER;
