const express = require("express");
const ROUTER = express.Router();

const path = require("path");

ROUTER.get("/", (req, res) => res.send({ connect: true, time: new Date() }));

ROUTER.get("/asset/img/no_picture_user.png", (req, res) =>
	res.sendFile(path.join(__dirname, "..", "File", "Asset", "img", "no_picture_user.png"))
);

ROUTER.get("/File/message/:channelId/:fileName", (req, res) =>
	res.sendFile(
		path.join(__dirname, "..", "File", "message", req.params.channelId, req.params.fileName)
	)
);

ROUTER.get("/channels/:channelId/messages/file/:fileName", (req, res) =>
	res.sendFile(
		path.join(__dirname, "..", "File", "message", req.params.channelId, req.params.fileName)
	)
);

module.exports = ROUTER;
