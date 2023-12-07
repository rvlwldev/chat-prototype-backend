const express = require("express");
const ROUTER = express.Router();

const path = require("path");

ROUTER.get("/", (req, res) => res.send({ connect: true, time: new Date() }));

ROUTER.get("/asset/img/:fileName", (req, res) =>
	res.sendFile(path.join(__dirname, "..", "File", "Asset", "img", req.params.fileName))
);

ROUTER.get("/File/message/:channelId/:fileName", (req, res) => {
	let filePath = path.join(
		__dirname,
		"..",
		"File",
		"message",
		req.params.channelId,
		req.params.fileName
	);

	res.sendFile(filePath);
});

ROUTER.get("/channels/:channelId/messages/file/:fileName", (req, res) => {
	let filePath = path.join(
		__dirname,
		"..",
		"File",
		"message",
		req.params.channelId,
		req.params.fileName
	);

	res.sendFile(filePath);
});

module.exports = ROUTER;
