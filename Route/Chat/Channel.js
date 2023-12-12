const express = require("express");
const ROUTER = express.Router();

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = require("../../Service/Chat/Channel");

const { HttpStatusCode } = require("axios");

ROUTER.post("/", async (req, res) => {});

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

ROUTER.get("/:channelId", async (req, res) => {
	let channel = await ChannelService.getChannelById(req.params.channelId);
	res.status(HttpStatusCode.Ok).send(channel);
});

ROUTER.get("/:channelId/members", async (req, res) => {});

module.exports = ROUTER;
