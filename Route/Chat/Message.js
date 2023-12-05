const ROUTER = require("express").Router();

const MessageService = require("../../Service/Chat/Message");

const { HttpStatusCode } = require("axios");

ROUTER.get("/:channelId/messages", async (req, res) => {
	let messages = await MessageService.getMessages(req.params.channelId, req.query.lastMessageId);
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
		sendFileMessage(req, res); // 파일 전송
	else sendTextMesasge(req, res); // 헤더가 없으면 일반 메세지로 간주
});

async function sendFileMessage(req, res) {
	const channelId = req.params.channelId;

	let result = await MessageService.sendFileMessage(channelId, req);

	if (result) res.status(HttpStatusCode.Created).end();
	else res.status(HttpStatusCode.InternalServerError).end();
}

async function sendTextMesasge(req, res) {
	const channelId = req.params.channelId;
	const senderId = req.body.senderId;
	const text = req.body.text;

	let result = await MessageService.sendTextMessage(channelId, senderId, text);

	if (result) res.status(HttpStatusCode.Created).end();
	else res.status(HttpStatusCode.InternalServerError).end();
}

module.exports = ROUTER;
