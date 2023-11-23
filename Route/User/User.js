const express = require("express");
const ROUTER = express.Router();

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const UserValidateService = require("../../Service/User/UserValidator");

const { HttpStatusCode } = require("axios");

ROUTER.post("/init/:userId", async (req, res) => {
	const USER_ID = req.params.userId;

	let userCheckResult = await UserValidateService.checkUserInfo(USER_ID);
	let channelCheckResult = await UserValidateService.checkPublicChannels(USER_ID);

	if (!userCheckResult) {
		res.status(HttpStatusCode.NotFound).send("NOT FOUND USER");
	} else if (!channelCheckResult) {
		res.status(HttpStatusCode.NotFound).send("FAIL TO INITIALIZE PUBLIC CHANNEL");
	} else res.status(HttpStatusCode.Ok).end();
});

ROUTER.get("/channels/:channelId/members", async (req, res) => {
	const channelId = req.params.channelId;

	let query = `?limit=${4500}`;

	await exAPI
		.get(`channels/${channelId}/members${query}`)
		.then((response) => res.status(HttpStatusCode.Ok).send(response))
		.catch((err) => res.status(HttpStatusCode.BadRequest).send(err));
});

ROUTER.post("/channels/:channelId/members/add", async (req, res) => {
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
