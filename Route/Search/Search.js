const express = require("express");
const ROUTER = express.Router();

const SearchService = require("../../Service/Search/Search");

ROUTER.get("/users/:userId/:text", async (req, res) => {
	let result = await SearchService.findAllUserByName(req.params.userId, req.params.text);
	res.send(result);
});

ROUTER.get("/channels/:userId/:text", async (req, res) => {
	let result = await SearchService.findAllChannelsByName(req.params.userId, req.params.text);
	res.send(result);
});

ROUTER.get("/messages/:userId/:text", async (req, res) => {
	let result = await SearchService.findAllMessagesByText(req.params.userId, req.params.text);
	res.send(result);
});

module.exports = ROUTER;
