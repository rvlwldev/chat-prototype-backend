const express = require("express");
const ROUTER = express.Router();

const path = require("path");

/**
 * @swagger
 * tags:
 *   name: Common
 *   description: 공통/전역적으로 사용되는 데이터 조회(+연결 확인)
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: 접속 테스트
 *     tags: [Common]
 *     responses:
 *       200:
 *         description: 접속 성공
 *         content:
 *           application/json:
 *             example:
 *               connect: true
 *               time: '2023-10-10T09:00:00.693Z'
 */
ROUTER.get("", (req, res) => res.send({ connect: true, time: new Date() }));

/**
 * @swagger
 * /asset/img/{fileName}:
 *   get:
 *     summary: 기본 이미지 파일 조회
 *     description: |
 *       유저 또는 채널의 프로필사진이 등록되지 않았을 때 기본 이미지 파일 조회
 *       - download_black.png: 다운로드버튼 이미지파일
 *       - download_white.png: 다운로드버튼 이미지파일
 *       - no_picture_user.png: 기본 프로필 이미지파일
 *     tags: [Common]
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         description: 조회할 이미지 파일명
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 이미지 파일 조회 성공
 *         content:
 *           image/png:
 *             example: BinaryImageData
 */
ROUTER.get("/asset/img/:fileName", (req, res) =>
	res.sendFile(path.join(__dirname, "..", "File", "Asset", "img", req.params.fileName))
);

// TODO : 위치 옮기기
// 위치 옮기면서 디렉토리도 수정되어야함
ROUTER.get("/File/message/:channelId/:fileName", (req, res) => {
	let filePath = path.join(
		__dirname,
		"..",
		"File",
		"message",
		req.params.channelId,
		req.params.fileName
	);

	res.sendFile(filePath);
});

module.exports = ROUTER;
