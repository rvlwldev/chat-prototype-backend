const ROUTER = require("express").Router();

const MessageService = require("../../Service/Chat/Message");

const { HttpStatusCode } = require("axios");

ROUTER.get("/:channelId/messages", async (req, res) => {
	let messages = await MessageService.getMessages(req.params.channelId);
	res.status(HttpStatusCode.Ok).send({ messages: messages, hasHistory: false });
});

ROUTER.get("/:channelId/messages/:lastMessageId", async (req, res) => {
	const channelId = req.params.channelId;
	const lastMessageId = req.params.lastMessageId;

	let messages = await MessageService.getMessagesWithLastMessageId(channelId, lastMessageId);

	res.status(HttpStatusCode.Ok).send(messages);
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
