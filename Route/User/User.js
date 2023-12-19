const express = require("express");
const ROUTER = express.Router();

const JWT = require("../../Utils/JWT");
const bcrypt = require("bcrypt");
const SALT_ROUND = 7;

const prisma = require("../../Utils/Prisma");

const { HttpStatusCode } = require("axios");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 로그인 및 유저 정보
 */

ROUTER.post("/register", async (req, res) => {
	try {
		const { serviceId, id, password, name, role, profileUserImageUrl } = req.body;

		let USER = await prisma.user.findMany({
			where: {
				serviceId: serviceId,
				id: id,
			},
			select: { password: false },
		});

		if (USER) {
			res.status(HttpStatusCode.Conflict).json({
				error: true,
				message: "중복된 아이디 입니다.",
			});

			return;
		}

		const HASH_PW = bcrypt.hash(password, SALT_ROUND, (err, hash) => {
			if (err) throw err;
			return hash;
		});

		await prisma.user.create({
			data: {
				serviceId: serviceId,
				id: id,
				password: HASH_PW,
				name: name,
				role: role,
				profileUserImageUrl: profileUserImageUrl,
			},
		});

		res.status(HttpStatusCode.Created).json({
			message: "사용자가 성공적으로 생성되었습니다.",
			user: USER,
		});
	} catch (err) {
		res.status(HttpStatusCode.InternalServerError).json(err);
	} finally {
		prisma.$disconnect();
	}
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
		let serviceId = req.body.serviceId;
		let user = req.body.user;

		const USER = await prisma.user.findUniqueOrThrow({
			where: { serviceId: serviceId, id: user.id },
		});

		res.status(HttpStatusCode.Ok).send({ user: user, token: JWT.generate(USER) });
	} catch (err) {
		if (err.code == "P2020" && err.meta.target === "User") {
			res.status(HttpStatusCode.NotFound).send(err.message);
		} else {
			console.log(err);
			res.status(HttpStatusCode.InternalServerError).send(err);
		}
	} finally {
		await prisma.$disconnect();
	}
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
ROUTER.get("/:userId/channels", JWT.verify, async (req, res) => {
	try {
		let serviceId = req.query.serviceId;

		let channels = await prisma.channel.findMany({
			where: prisma.user.findUniqueOrThrow({
				where: { serviceId: serviceId, id: req.userData.id },
			}),
		});

		res.status(HttpStatusCode.Ok).json({ channels: channels });
	} catch (error) {
		console.log(err);
		res.status(HttpStatusCode.InternalServerError).send(err);
	} finally {
		await prisma.$disconnect();
	}
});

module.exports = ROUTER;
