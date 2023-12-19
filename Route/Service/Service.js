const express = require("express");
const ROUTER = express.Router();

const prisma = require("../../Utils/Prisma");
const JWT = require("../../Utils/JWT");

const { HttpStatusCode } = require("axios");

ROUTER.post("", JWT.verify, async (req, res) => {
	try {
		if (req.userData.userRole != 99) {
			res.status(HttpStatusCode.Forbidden).json({ message: "권한이 없습니다." });
			return;
		}

		let serviceId = req.body.serviceId;
		let serviceName = req.body.serviceName;

		if (!serviceId || !serviceName) {
			res.status(HttpStatusCode.BadRequest).json({ message: "Invalid Parameters" });
			return;
		}

		let count = await prisma.service.count({ where: { id: serviceId } });

		if (count > 0) {
			res.status(HttpStatusCode.Conflict).json({ message: "중복된 서비스 아이디입니다." });
			return;
		}
	} catch (err) {
		console.error("에러 발생:", err);
		res.status(500).json({ message: "서버 에러" });
	} finally {
		await prisma.$disconnect();
	}
});

ROUTER.get("", JWT.verify, async (req, res) => {
	try {
		if (req.userData.userRole != 99) {
			res.status(HttpStatusCode.Forbidden).json({ message: "권한이 없습니다." });
			return;
		}

		const Service = await prisma.service.findMany();
		res.status(HttpStatusCode.Ok).json(Service);
	} catch (err) {
		console.error("에러 발생:", err);
		res.status(500).json({ message: "서버 에러" });
	} finally {
		await prisma.$disconnect();
	}
});

module.exports = ROUTER;
