const express = require("express");
const ROUTER = express.Router();

const ExternalAPI = require("../../Util/ExternalAPI");
const { HttpStatusCode } = require("axios");
const exAPI = new ExternalAPI();

const UserValidator = require("../../Service/User/Validator");
const UserNotFoundException = require("../../Exception/User/UserNotFound");

const UserService = require("../../Service/User/User");
const ChannelService = require("../../Service/Chat/Channel");
const { APP } = require("../../_Global/Constant/API");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 로그인 및 유저 정보
 */

/** 시연용 임시코드 회원가입 */
ROUTER.post("/register", async (req, res) => {
	console.log("REGISTER !");

	let id = req.body.id;
	let pw = req.body.pw;
	let name = req.body.name;

	let userInfo = await UserService.createUser(id, name, null, 1, pw).then((res) => res);

	if (userInfo) {
		await exAPI
			.post("users/create", { userId: id, password: id, username: name })
			.then(() => res.status(HttpStatusCode.Created).send(true))
			.catch(() => res.status(HttpStatusCode.FailedDependency).send("SDK ERROR"));
	} else res.status(HttpStatusCode.InternalServerError).end();
});

/** 시연용 중복 체크 */
ROUTER.post("/check", async (req, res) => {
	try {
		let userinfo = await UserService.getUserById(req.body.id);
		await UserValidator.validate(userinfo.id, userinfo.name);
		res.status(HttpStatusCode.Conflict).send(false);
	} catch (err) {
		if (err instanceof UserNotFoundException) res.status(HttpStatusCode.Ok).send(true);
		else {
			console.log(err);
			res.status(HttpStatusCode.InternalServerError).send(false);
		}
	}
});

ROUTER.get("/appid", (req, res) => {
	res.status(HttpStatusCode.Ok).send(APP.TALK_PLUS.ID);
});

ROUTER.post("/token", async (req, res) => {
	let body = { userId: req.body.userId, password: req.body.userId };
	res.status(HttpStatusCode.Ok).send(
		await exAPI.post("users/login", body).then((res) => {
			res.AppID = APP.TALK_PLUS.ID;
			return res;
		})
	);
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: 로그인, 정합성 검사
 *     description: |
 *       인트라넷에서 채팅 로그인 처리 (POST: chatapi/login) 이후 반환된 암호화된 값을 ID로 사용 (임시)
 *       _세션 또는 헤더 토큰 기반으로 변경 예정_
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 유저 ID
 *               username:
 *                 type: string
 *                 description: 유저 이름
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       404:
 *         description: 유저 정보를 찾을 수 없거나, 인트라넷에서 **가입승인이** 안된 상태
 *         content:
 *           String:
 *              example: 확인할 수 없는 유저 ID입니다.
 */
ROUTER.post("/login", async (req, res) => {
	try {
		const userid = req.body.id;
		const userpw = req.body.pw;

		await UserService.getUserById(userid).then(async (data) => {
			if (data.temp_pw != userpw) res.status(HttpStatusCode.BadRequest).send("비밀번호 오류");
			else {
				UserValidator.checkUserOnPublicChannels(userid);
				// await UserValidator.validate(userinfo.id, userinfo.name);
				res.status(HttpStatusCode.Ok).send(data);
			}
		});
	} catch (err) {
		if (err instanceof UserNotFoundException)
			res.status(HttpStatusCode.NotFound).send("ID 찾을 수 없음");
		else res.status(HttpStatusCode.InternalServerError).send(err);
	}
});

ROUTER.post("/login-backup", async (req, res) => {
	const userid = req.body.id;
	const userpw = req.body.pw;
	if (!userid || !userpw) res.status(HttpStatusCode.BadRequest).end();

	const userinfo = await UserService.getUserById(userid)
		.then((data) => {
			console.log(data);
			return data;
		})
		.catch((err) => {
			if (err instanceof UserNotFoundException)
				res.status(HttpStatusCode.NotFound).send(err.message);
			else res.status(HttpStatusCode.InternalServerError).send(err);
		});

	await UserValidator.validate(userid, userinfo.name)
		.then(() => res.status(200).end())
		.catch((err) => {
			console.log("validate 에러");
			console.log(err);
		});
});

/**
 * @swagger
 * /users/{userId}/channels:
 *   get:
 *     summary: 유저의 채널 목록 조회
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: 유저 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 채널 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               - id: "FIRST_TEST_OPEN_CHAT_CHANNEL01"
 *                 name: "테스트 전체 공개 채팅방01"
 *                 type: "super_public"
 *               - id: "userId1_userId2"
 *                 name: null
 *                 type: "private"
 */
ROUTER.get("/:userId/channels", async (req, res) => {
	let channelArray = await ChannelService.getChannelsByUserId(req.params.userId);
	res.status(HttpStatusCode.Ok).send(channelArray);
});

module.exports = ROUTER;
