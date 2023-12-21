const express = require("express");
const ROUTER = express.Router();

const JWT = require("../../Utils/JWT");

const { HttpStatusCode } = require("axios");
const prisma = require("../../Utils/Prisma");

const { v4: uuidv4 } = require("uuid");

// TODO : 채널 생성
ROUTER.post("/", JWT.verify, async (req, res) => {
	const { name: channelName, type } = req.body;
	const { serviceId, id: userId, name, role } = req.userData;

	const channelId = uuidv4();

	try {
		// 채널 생성
		const createdChannel = await prisma.channel.create({
			data: {
				serviceId,
				id: channelId,
				name: channelName,
				type,
				userChannels: {
					create: { serviceId, channelId, userId },
				},
			},
		});

		res.status(HttpStatusCode.Created).json(createdChannel);
	} catch (error) {
		console.error("채널 생성 중 오류:", error);
		res.status(HttpStatusCode.InternalServerError).json({
			message: "채널 생성 중 오류가 발생했습니다.",
		});
	} finally {
		await prisma.$disconnect();
	}
});

// TODO: : 채널 접속
ROUTER.post("/:channelId/", JWT.verify, async (req, res) => {});

// TODO : 채널에 유저 초대
ROUTER.post("/:channelId/users", JWT.verify, async (req, res) => {});

// TODO : 채널 상세정보 조회
ROUTER.get("/:channelId", JWT.verify, async (req, res) => {});

// TODO : 채널 유저 목록 조회
ROUTER.get("/:channelId/users", JWT.verify, async (req, res) => {});

// TODO : 채널명 수정 (전체 공개 채널만, 권한확인필요)
ROUTER.put("/:channelId/", JWT.verify, async (req, res) => {});

// TODO : 채널 삭제
// 개인채널 - 그냥 삭제
// 공개채널 - 삭제 여부만 변경?
ROUTER.delete("/:channelId/", JWT.verify, async (req, res) => {});

module.exports = ROUTER;
