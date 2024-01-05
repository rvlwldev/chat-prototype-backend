const ROUTER = require("express").Router();
const JWT = require("../../Utils/JWT");
const Validator = require("../../Exception/Validator");

const UserController = require("../../Controller/User");
const ChannelController = require("../../Controller/Channel");

const WS = require("../../Utils/WebSocket");
const { HttpStatusCode } = require("axios");

const UserException = require("../../Exception/User/UserException");

// TODO : 높은 권한은 모두 요청 가능하게?

// 일반유저의 채널 생성 (무조껀 private 채널)
ROUTER.post("/", JWT.verify, async (req, res, next) => {
	try {
		const serviceId = req.service.id;
		const userId = req.user.id;

		const CHANNEL = await ChannelController.saveChannel(serviceId, userId);
		await ChannelController.saveUserChannel(serviceId, userId, CHANNEL.id);

		res.status(HttpStatusCode.Created).json({ channel: CHANNEL });
	} catch (err) {
		next(err);
	}
});

// 채널 접속
ROUTER.post("/:channelId/", JWT.verify, Validator.params.channelId, async (req, res, next) => {
	try {
		const serviceId = req.service.id;
		const userId = req.user.id;
		const channelId = req.params.channelId;

		await ChannelController.saveUserChannel(serviceId, userId, channelId).then(
			async (userChannel) => {
				res.status(HttpStatusCode.Ok).json({ channel: userChannel.channel });
				WS.publishToChannel(serviceId, channelId, WS.event.USER_IN, userChannel);
			}
		);
	} catch (err) {
		next(err);
	}
});

// 채널에 유저 초대
// TODO : 중복된 초대 처리?
ROUTER.post(
	"/:channelId/users",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.userChannelId,
	async (req, res, next) => {
		try {
			const serviceId = req.service.id;
			const channelId = req.params.channelId;

			let users = req.body.users;
			users = typeof users == "string" ? [users] : users;
			users = Array.from(new Set(users));

			const USERS = await UserController.getUsers(serviceId, users);
			if (users.length != USERS.length) throw new UserException.InvalidUserInfo();

			const CHANNEL = await ChannelController.getChannelById(serviceId, channelId);

			await ChannelController.saveUserChannelsWithUsers(serviceId, channelId, USERS);

			res.status(HttpStatusCode.Created).json({ channel: CHANNEL, users: USERS });

			WS.publishToChannel(serviceId, CHANNEL.id, WS.event.USER_IN, USERS);
		} catch (err) {
			next(err);
		}
	}
);

// 채널 조회
ROUTER.get("/:channelId", JWT.verify, Validator.params.channelId, async (req, res, next) => {
	try {
		res.status(HttpStatusCode.Ok).json({
			channel: await ChannelController.getChannelById(req.service.id, req.params.channelId),
		});
	} catch (err) {
		next(err);
	}
});

// 채널 유저 목록 조회
ROUTER.get(
	"/:channelId/users",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.userChannelId,
	async (req, res, next) => {
		try {
			const USERS = await UserController.getUsersByChannelId(
				req.service.id,
				req.params.channelId
			);

			res.status(HttpStatusCode.Ok).json({ users: USERS });
		} catch (err) {
			next();
		}
	}
);

// 채널명 수정
ROUTER.patch(
	"/:channelId/",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.userChannelId,
	async (req, res, next) => {
		try {
			const serviceId = req.service.id;
			const userId = req.user.id;
			const channelId = req.params.channelId;

			const UPDATED_CHANNEL = await ChannelController.updateUserChannelName(
				serviceId,
				userId,
				channelId,
				req.body.name
			);

			res.status(HttpStatusCode.Accepted).json({ channel: UPDATED_CHANNEL });
		} catch (err) {
			next(err);
		}
	}
);

// 메세지 읽음 처리
ROUTER.patch(
	"/:channelId/read",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.userChannelId,
	async (req, res, next) => {
		try {
			const serviceId = req.service.id;
			const userId = req.user.id;
			const channelId = req.params.channelId;

			await ChannelController.updateUserChannelReadAt(serviceId, userId, channelId);

			res.status(HttpStatusCode.NoContent).end();

			WS.publishToChannel(serviceId, channelId, WS.event.MESSAGE_READ, {
				channelId: channelId,
				userId: userId,
			});
		} catch (err) {
			next(err);
		}
	}
);

// 개인채널(typeCode : 10) - 나가기(userChannel 삭제) - 1명도 없으면 채널 자체를 삭제
// 공개채널(typeCode : 50) - 나가기(userChannel 삭제) - 1명도 없으면 삭제여부 변경
ROUTER.delete(
	"/:channelId/",
	JWT.verify,
	Validator.params.channelId,
	Validator.params.userChannelId,
	async (req, res, next) => {
		try {
			const serviceId = req.service.id;
			const userId = req.user.id;
			const channelId = req.params.channelId;

			await ChannelController.deleteUserChannel(serviceId, userId, channelId).then(() => {
				res.status(HttpStatusCode.NoContent).end();

				WS.publishToChannel(serviceId, channelId, WS.event.USER_OUT, {
					channelId: channelId,
					userId: userId,
				});
			});

			ChannelController.getUsersByChannelId(serviceId, channelId).then((userChannel) => {
				if (userChannel.users.length == 0) {
					let channel = ChannelController.getChannelById(serviceId, channelId);

					if (channel.typeCode == 50)
						ChannelController.updateChannelDeleteYn(serviceId, channelId);
					else ChannelController.deleteChannel(serviceId, channelId);
				}
			});
		} catch (err) {
			next(err);
		}
	}
);

module.exports = ROUTER;
