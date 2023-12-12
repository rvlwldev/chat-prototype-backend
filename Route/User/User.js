const express = require("express");
const ROUTER = express.Router();

const { HttpStatusCode } = require("axios");

const UserService = require("../../Service/User/Validator");
const UserNotFoundException = require("../../Exception/User/UserNotFound");

ROUTER.post("/login", async (req, res) => {
	const userId = req.body.userId;
	const username = req.body.username;

	try {
		await UserService.validate(userId, username);

		req.session.userId = userId;
		req.session.isLoggedIn = true;

		req.session.save((err) => {
			if (err) {
				console.log(err);
				res.status(HttpStatusCode.InternalServerError).send(err);
			} else res.status(HttpStatusCode.Ok).end();
		});
	} catch (err) {
		console.log(err);

		if (err instanceof UserNotFoundException)
			res.status(HttpStatusCode.NotFound).send(err.message + " : " + userId);
	}
});

ROUTER.get("/:userId/channels", async (req, res) => {
	let channelArray = await ChannelService.getAllUserChannels(req.params.userId);
	res.status(HttpStatusCode.Ok).send(channelArray);
});

module.exports = ROUTER;
