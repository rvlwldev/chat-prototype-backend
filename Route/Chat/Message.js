const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");
const Validator = require("../../Exception/Validator");

const MessageController = require("../../Controller/Message");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");

// TODO : 메세지 권한 확인

ROUTER.post(
	"/:channelId/message",
	JWT.verify,
	Validator.params.channelId,
	Validator.body.messageText,
	async (req, res, next) => {
		try {
			let serviceId = req.service.id;
			let userId = req.user.id;
			let channelId = req.params.channelId;
			let parentId = req.body.parentId;
			let text = req.body.text;

			await MessageController.saveTextMessage(
				serviceId,
				userId,
				channelId,
				text,
				parentId
			).then((message) => {
				res.status(HttpStatusCode.Created).json(message);
				WS.publishToChannel(serviceId, channelId, WS.event.MESSAGE_SEND, {
					message: message,
				});
			});
		} catch (err) {
			next(err);
		}
	}
);

// TODO : 파일 메세지 전송 (+댓글)
ROUTER.post(
	"/:channelId/file/message",
	JWT.verify,
	Validator.params.channelId,
	async (req, res, next) => {
		try {
		} catch (err) {
			next(err);
		}
	}
);

ROUTER.get(
	"/:channelId/message/:messageId",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.messageId,
	async (req, res, next) => {
		try {
			res.status(HttpStatusCode.Ok).json(
				await MessageController.getMessageById(
					req.service.id,
					req.params.channelId,
					req.params.messageId
				)
			);
		} catch (err) {
			next(err);
		}
	}
);

ROUTER.get(
	"/:channelId/messages",
	JWT.verify,
	Validator.params.channelId,
	async (req, res, next) => {
		try {
			await MessageController.getMessages(
				req.service.id,
				req.params.channelId,
				req.query.lastMessageId,
				req.query.order || undefined,
				req.query.limit || undefined
			).then((messages) => res.status(HttpStatusCode.Ok).json({ messages: messages }));
		} catch (err) {
			next(err);
		}
	}
);

ROUTER.patch(
	"/:channelId/message",
	JWT.verify,
	Validator.params.channelId,
	Validator.body.messageId,
	Validator.body.messageText,
	async (req, res, next) => {
		try {
			let serviceId = req.service.id;
			let channelId = req.body.channelId;
			let messageId = req.body.messageId;
			let text = req.body.text;

			await MessageController.updateMessage(serviceId, channelId, messageId, text).then(
				(message) => {
					WS.publishToChannel(serviceId, channelId, WS.event.MESSAGE_UPDATE, {
						message: message,
					});
					res.status(HttpStatusCode.Ok).json(message);
				}
			);
		} catch (err) {
			next(err);
		}
	}
);

// TODO : 메세지 삭제
ROUTER.delete(
	"/:channelId/message",
	JWT.verify,
	Validator.params.channelId,
	Validator.body.messageId,
	async (req, res, next) => {
		try {
			let serviceId = req.service.id;
			let channelId = req.params.channelId;
			let messageId = req.body.messageId;

			await MessageController.deleteMessage(serviceId, channelId, messageId).then(() => {
				WS.publishToChannel(serviceId, channelId, WS.event.MESSAGE_DELETE, {
					messageId: messageId,
				});

				res.status(HttpStatusCode.NoContent).end();
			});
		} catch (err) {
			next(err);
		}
	}
);

// TODO: 메세지 검색
ROUTER.get("/:channelId/message", JWT.verify, async (req, res, next) => {});

module.exports = ROUTER;
