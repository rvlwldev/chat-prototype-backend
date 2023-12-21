const ROUTER = require("express").Router();
const path = require("path");

const JWT = require("../../Utils/JWT");

const { HttpStatusCode } = require("axios");

// TODO : WS 처리, 댓글처리
ROUTER.post("/:channelId/messages", JWT.verify, async (req, res) => {});

async function sendFileMessage(req, res) {
	const channelId = req.params.channelId;

	let result = await MessageService.addFileMessage(channelId, req);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}

async function sendTextMesasge(req, res) {
	const channelId = req.params.channelId;
	const senderId = req.body.senderId;
	const text = req.body.text;

	let result = await MessageService.addTextMessage(channelId, senderId, text);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}
ROUTER.get("/:channelId/messages", JWT.verify, async (req, res) => {
	const channelId = req.params.channelId;
	const lastMessageId = req.query.lastMessageId;
	const order = req.query.order;

	const messages = await MessageService.getMessages(channelId, lastMessageId, order);
	res.status(HttpStatusCode.Ok).send(messages);
});

// TODO : 읽음 처리
ROUTER.get("/:channelId/messages/:messageId", JWT.verify, async (req, res) => {
	const channelId = req.params.channelId;
	const messageId = req.params.messageId;

	const message = await MessageService.getMessagebyIds(channelId, messageId);
	res.status(HttpStatusCode.Ok).send(message);
});

ROUTER.get("/:channelId/files/:fileName", JWT.verify, (req, res) => {
	let filePath = path.join(
		__dirname,
		"../..",
		"File",
		"message",
		req.params.channelId,
		req.params.fileName
	);

	res.sendFile(filePath);
});

module.exports = ROUTER;
