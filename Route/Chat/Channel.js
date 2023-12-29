const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");

const ChannelController = require("../../Controller/Channel");
const UserController = require("../../Controller/User");

const ChannelException = require("../../Exception/Chat/ChannelException");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");

ROUTER.post("/", JWT.verify, async (req, res) => {
	try {
		const { name, type } = req.body;
		const CHANNEL = await ChannelController.saveChannel(req.SERVICE, req.USER, type, name);

		res.status(HttpStatusCode.Created).json({ channel: CHANNEL });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.post("/:channelId/", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		await ChannelController.saveUserChannel(req.SERVICE, req.USER, CHANNEL);

		res.status(HttpStatusCode.Ok).json(CHANNEL);

		WS.publishToChannel(req.SERVICE.id, CHANNEL.id, WS.event.CHANNEL_CREATE, MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.post("/:channelId/users", JWT.verify, async (req, res) => {
	try {
		let users = req.body.users;
		users = !users instanceof Array ?? [users];

		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		const USERS = await UserController.getUsers(req.body.users);

		await ChannelController.saveUserChannels(req.SERVICE, USERS, CHANNEL);

		res.status(HttpStatusCode.Created).json(USERS);

		WS.publishToChannel(req.SERVICE.id, CHANNEL.id, WS.event.USER_IN, USERS);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/:channelId", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		res.status(HttpStatusCode.Ok).json(CHANNEL);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

ROUTER.get("/:channelId/users", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		const USERS = await UserController.getUsersByChannel(req.SERVICE, CHANNEL);

		res.status(HttpStatusCode.Ok).json(USERS);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 채널명 수정 (전체 공개 채널만? 개인 채널도? 그럼 UserChannels에서 name 필드 관리?)
ROUTER.patch("/:channelId/", JWT.verify, async (req, res) => {
	try {
		if (req.USER.role.id < 9) throw new ChannelException.NotAllowed();
		if (!req.body.name) throw new ChannelException.NameRequired();

		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		const UPDATED_CHANNEL = await ChannelController.updateChannelName(
			req.SERVICE,
			CHANNEL,
			req.body.name
		);

		res.status(HttpStatusCode.Accepted).json(UPDATED_CHANNEL);

		WS.publishToChannel(req.SERVICE.id, CHANNEL.id, WS.event.CHANNEL_UPDATE, MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 메세지 읽음 처리
ROUTER.patch("/:channelId/read", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.SERVICE, req.params.channelId);
		await ChannelController.updateUserChannel(req.SERVICE, CHANNEL, { readAt: new Date() });

		res.status(HttpStatusCode.NoContent).end();

		WS.publishToChannel(req.SERVICE.id, CHANNEL.id, WS.event.MESSAGE_READ, MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// TODO : 채널 삭제할때...
// 개인채널 - 그냥 삭제하기?
// 공개채널 - 삭제 여부만 변경?
ROUTER.delete("/:channelId/", JWT.verify, async (req, res) => {
	try {
		await ChannelController.deleteChannel(req.SERVICE, req.USER, req.params.channelId);

		res.status(HttpStatusCode.NoContent).end();

		WS.publishToChannel(req.SERVICE.id, CHANNEL.id, WS.event.CHANNEL_DELETE, MESSAGE);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

module.exports = ROUTER;
