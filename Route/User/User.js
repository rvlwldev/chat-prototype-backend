const express = require("express");
const ROUTER = express.Router();

const { HttpStatusCode } = require("axios");

const UserService = require("../../Service/User/UserValidator");

ROUTER.post("/login", async (req, res) => {
	const userId = req.body.userId;

	try {
		await UserService.validateUserById(userId);
		req.session.userId = userId;
		req.session.isLoggedIn = true;
		req.session.save((err) => {
			if (err) {
				console.log(err);
				res.status(HttpStatusCode.InternalServerError).end();
			} else res.status(HttpStatusCode.Ok).end();
		});
	} catch (err) {
		console.log(err);
		req.session.save(() => res.status(HttpStatusCode.NotFound).send(err.message));
	}
});

module.exports = ROUTER;
