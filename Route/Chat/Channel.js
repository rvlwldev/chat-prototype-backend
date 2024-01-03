const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");

const UserController = require("../../Controller/User");
const ChannelController = require("../../Controller/Channel");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");
const Exception = require("../../Exception/Exception");

// TODO : 채널 접속자만 채널에 대한 요청 처리 가능하게
// TODO : :channelId URL에 채널ID 요청 validator 로 빼기
// TODO : 높은 권한은 모두 요청 가능하게?
ROUTER.post("/", JWT.verify, async (req, res) => {
	try {
		const { serviceId, userId } = req;
		const { typeCode, name } = req.body;

		const CHANNEL = await ChannelController.saveChannel(serviceId, userId, typeCode, name);
		await ChannelController.saveUserChannel(serviceId, userId, CHANNEL.id);

		res.status(HttpStatusCode.Created).json({ channel: CHANNEL });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 채널 접속
ROUTER.post("/:channelId/", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.serviceId, req.params.channelId);
		await ChannelController.saveUserChannel(req.serviceId, req.userId, CHANNEL.id);

		res.status(HttpStatusCode.Ok).json({ channel: CHANNEL });

		WS.publishToChannel(req.serviceId, CHANNEL.id, WS.event.USER_IN, req.userId);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 채널에 유저 초대
ROUTER.post("/:channelId/users", JWT.verify, async (req, res) => {
	try {
		let channelId = req.params.channelId;
		let users = req.body.users;
		users = typeof users == "string" ? [users] : users;
		users = Array.from(new Set(users));

		const CHANNEL = await ChannelController.getChannelById(req.serviceId, channelId);
		await ChannelController.getUserChannel(req.serviceId, req.userId, CHANNEL.id);

		const USERS = await UserController.getUsers(req.serviceId, users);
		await ChannelController.saveUserChannelsWithUsers(req.serviceId, channelId, USERS);

		res.status(HttpStatusCode.Created).json({ channel: CHANNEL, users: USERS });

		WS.publishToChannel(req.serviceId.id, CHANNEL.id, WS.event.USER_IN, USERS);
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 채널 조회
ROUTER.get("/:channelId", JWT.verify, async (req, res) => {
	try {
		const CHANNEL = await ChannelController.getChannelById(req.serviceId, req.params.channelId);
		res.status(HttpStatusCode.Ok).json({ channel: CHANNEL });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 채널 유저 목록 조회
ROUTER.get("/:channelId/users", JWT.verify, async (req, res) => {
	try {
		const USERS = await UserController.getUsersByChannelId(req.serviceId, req.params.channelId);

		res.status(HttpStatusCode.Ok).json({ users: USERS });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 채널명 수정
ROUTER.put("/:channelId/", JWT.verify, async (req, res) => {
	try {
		let { serviceId, userId } = req;
		let channelId = req.params.channelId;

		const USER_CHANNEL = await ChannelController.getUserChannel(serviceId, userId, channelId);
		const UPDATED_CHANNEL = await ChannelController.updateUserChannelName(
			serviceId,
			userId,
			channelId,
			req.body.name
		);

		res.status(HttpStatusCode.Accepted).json({ channel: UPDATED_CHANNEL });
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 메세지 읽음 처리
ROUTER.patch("/:channelId/read", JWT.verify, async (req, res) => {
	try {
		let { serviceId, userId } = req;
		let channelId = req.params.channelId;

		const CHANNEL = await ChannelController.getChannelById(serviceId, channelId);
		await ChannelController.updateUserChannelReadAt(serviceId, userId, channelId);

		res.status(HttpStatusCode.NoContent).end();

		WS.publishToChannel(serviceId, channelId, WS.event.MESSAGE_READ, {
			channelId: channelId,
			userId: userId,
		});
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

// 개인채널참가 - 삭제
// 채널 - 삭제 여부 변경
ROUTER.delete("/:channelId/", JWT.verify, async (req, res) => {
	try {
		let { serviceId, userId } = req;
		let channelId = req.params.channelId;

		const CHANNEL = await ChannelController.getChannelById(serviceId, channelId);

		await ChannelController.deleteUserChannel(serviceId, userId, channelId);

		res.status(HttpStatusCode.NoContent).end();

		WS.publishToChannel(serviceId, channelId, WS.event.CHANNEL_DELETE, {
			channelId: channelId,
			userId: userId,
		});
	} catch (err) {
		if (err instanceof Exception) res.status(err.httpStatusCode).json(err);
		else {
			res.status(HttpStatusCode.InternalServerError).json(err);
			console.log(err);
		}
	}
});

module.exports = ROUTER;
