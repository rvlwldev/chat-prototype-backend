const ROUTER = require("express").Router();

const JWT = require("../../Utils/JWT");

const MessageController = require("../../Controller/Message");

const { WS } = require("../../Utils/WebSocket");

const { HttpStatusCode } = require("axios");

// TODO : 메세지 예외처리

ROUTER.post("/:channelId/message", JWT.verify, async (req, res) => {
	try {
		let channelId = req.params.channelId;
		let text = req.body.text;
		let parentId = req.body.parentId;

		var MESSAGE;
		if (parentId) {
			MESSAGE = await MessageController.saveMessage(req.SERVICE, channelId, text, parentId);
		} else {
			MESSAGE = await MessageController.saveMessage(req.SERVICE, channelId, text);
		}

		WS.publish(req.SERVICE.id, channelId, MESSAGE);

		res.status(HttpStatusCode.Created).json(MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 파일 메세지 전송 (+댓글)
ROUTER.post("/:channelId/file/message", JWT.verify, async (req, res) => {});

ROUTER.get("/:channelId/:messageId", JWT.verify, async (req, res) => {
	try {
		const MESSAGE = await MessageController.getMessageById(
			req.SERVICE,
			req.params.channelId,
			req.params.messageId
		);

		res.status(HttpStatusCode.Ok).json(MESSAGE);
	} catch (error) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/:channelId/messages", JWT.verify, async (req, res) => {
	try {
		const MESSAGES = await MessageController.getMessages(
			req.SERVICE,
			req.body.channelId,
			req.body.lastMessageId,
			req.body.order,
			req.body.limit
		);

		res.status(HttpStatusCode.Ok).json(MESSAGES);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 메세지 읽음 처리
ROUTER.patch("/:channelId/read", JWT.verify, async (req, res) => {});

ROUTER.put("/:channelId/message", JWT.verify, async (req, res) => {
	try {
		const MESSAGE = await MessageController.updateMessage(
			req.SERVICE,
			req.body.channelId,
			req.body.messageId,
			req.body.text
		);

		res.status(HttpStatusCode.Ok).json(MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 메세지 삭제
ROUTER.delete("/:channelId/message", JWT.verify, async (req, res) => {
	try {
		await MessageController.deleteMessage(req.SERVICE, req.body.channelId, req.body.messageId);
		res.status(HttpStatusCode.NoContent).end();
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO: 메세지 검색
ROUTER.get("/:channelId/message", JWT.verify, async (req, res) => {});

module.exports = ROUTER;
