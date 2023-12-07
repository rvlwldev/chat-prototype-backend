const ROUTER = require("express").Router();

const MessageService = require("../../Service/Chat/Message");

const { HttpStatusCode } = require("axios");

ROUTER.get("/:channelId/messages", async (req, res) => {
	const channelId = req.params.channelId;
	const lastMessageId = req.query.lastMessageId;
	const order = req.query.order;

	let messages = await MessageService.getMessages(channelId, lastMessageId, order);
	res.status(HttpStatusCode.Ok).send(messages);
});

ROUTER.get("/:channelId/messages/:messageId", async (req, res) => {
	const channelId = req.params.channelId;
	const messageId = req.params.messageId;

	const message = await MessageService.getMessagebyIds(channelId, messageId);

	res.status(HttpStatusCode.Ok).send(message);
});

ROUTER.post("/:channelId/messages", async (req, res) => {
	if (
		req.headers["content-type"].toLowerCase().includes("multipart/form-data") &&
		req.params.type !== "text"
	)
		sendFileMessage(req, res);
	else sendTextMesasge(req, res);
});

async function sendFileMessage(req, res) {
	const channelId = req.params.channelId;

	let result = await MessageService.sendFileMessage(channelId, req);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}

async function sendTextMesasge(req, res) {
	const channelId = req.params.channelId;
	const senderId = req.body.senderId;
	const text = req.body.text;

	let result = await MessageService.sendTextMessage(channelId, senderId, text);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}

module.exports = ROUTER;
