const ROUTER = require("express").Router();
const path = require("path");

const MessageService = require("../../Service/Chat/Message");

const { HttpStatusCode } = require("axios");

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: 채팅 메세지
 */

/**
 * @swagger
 * /channels/{channelId}/messages:
 *   post:
 *     summary: 메시지 전송
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       description: 메시지 전송 데이터
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: 발신 유저 ID
 *               text:
 *                 type: string
 *                 description: 텍스트 내용
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 메시지 타입 (image, video, file)
 *               senderId:
 *                 type: string
 *                 description: 발신 유저 ID
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 파일 데이터
 *     responses:
 *       201:
 *         description: 메시지 전송 성공
 *       500:
 *         description: 내부 서버 오류
 */
ROUTER.post("/:channelId/messages", async (req, res) => {
	let contentType = req.headers["content-type"].toLowerCase();

	if (contentType.includes("multipart/form-data") && req.params.type !== "text") {
		sendFileMessage(req, res);
	} else {
		sendTextMesasge(req, res);
	}
});

async function sendFileMessage(req, res) {
	const channelId = req.params.channelId;

	let result = await MessageService.addFileMessage(channelId, req);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}

async function sendTextMesasge(req, res) {
	const channelId = req.params.channelId;
	const senderId = req.body.senderId;
	const text = req.body.text;

	let result = await MessageService.addTextMessage(channelId, senderId, text);

	if (result) res.status(HttpStatusCode.Created).send(result);
	else res.status(HttpStatusCode.InternalServerError).end();
}

/**
 * @swagger
 * /channels/{channelId}/messages:
 *   get:
 *     summary: 채널의 메시지 목록 조회
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastMessageId
 *         required: false
 *         description: 마지막 메시지의 ID (optional)
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         required: false
 *         description: 정렬 순서 (optional, 'oldest'(기본값) 또는 'lastest')
 *         schema:
 *           type: string
 *           enum: [oldest, lastest]
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               - id: "messageId1"
 *                 parentMessageId: "parentMessageId1"
 *                 channelId: "channelId1"
 *                 userId: "userId1"
 *                 username: "username1"
 *                 profileUserImageUrl: "profileImageUrl1"
 *                 text: "Message text 1"
 *                 type: "text"
 *                 filePath: null
 *                 fileName: null
 *                 fileSize: null
 *                 createdAt: "1702356103701"
 *               - id: "messageId2"
 *                 parentMessageId: "parentMessageId2"
 *                 channelId: "channelId2"
 *                 userId: "userId2"
 *                 username: "username2"
 *                 profileUserImageUrl: "profileImageUrl2"
 *                 text: null
 *                 type: "image"
 *                 filePath: "filePath2"
 *                 fileName: "fileName2"
 *                 fileSize: 2048
 *                 createdAt: "1702357343409"
 *       500:
 *         description: 서버 오류
 */

ROUTER.get("/:channelId/messages", async (req, res) => {
	const channelId = req.params.channelId;
	const lastMessageId = req.query.lastMessageId;
	const order = req.query.order;

	const messages = await MessageService.getMessages(channelId, lastMessageId, order);
	res.status(HttpStatusCode.Ok).send(messages);
});

/**
 * @swagger
 * /channels/{channelId}/messages/{messageId}:
 *   get:
 *     summary: 채널의 특정 메시지 조회
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: 메시지 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             examples:
 *               example(텍스트메세지):
 *                 value:
 *                   id: "messageId1"
 *                   parentMessageId: "parentMessageId1"
 *                   channelId: "channelId1"
 *                   userId: "userId1"
 *                   username: "username1"
 *                   profileUserImageUrl: "profileImageUrl1"
 *                   text: "Message text 1"
 *                   type: "text"
 *                   filePath: null
 *                   fileName: null
 *                   fileSize: null
 *                   createdAt: "1702355845111"
 *               example(파일메세지):
 *                 value:
 *                   id: "messageId2"
 *                   parentMessageId: "parentMessageId2"
 *                   channelId: "channelId2"
 *                   userId: "userId2"
 *                   username: "username2"
 *                   profileUserImageUrl: "profileImageUrl2"
 *                   text: null
 *                   type: "image"
 *                   filePath: "filePath2"
 *                   fileName: "fileName2"
 *                   fileSize: 2048
 *                   createdAt: "1702355845222"
 */
ROUTER.get("/:channelId/messages/:messageId", async (req, res) => {
	const channelId = req.params.channelId;
	const messageId = req.params.messageId;

	const message = await MessageService.getMessagebyIds(channelId, messageId);
	res.status(HttpStatusCode.Ok).send(message);
});

/**
 * @swagger
 * /channels/{channelId}/files/{fileName}:
 *   get:
 *     summary: 메세지 파일 조회
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileName
 *         required: true
 *         description: 메세지에 포함된 파일경로
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             examples:
 *               example(텍스트메세지):
 *                 value:
 *                   id: "messageId1"
 *                   parentMessageId: "parentMessageId1"
 *                   channelId: "channelId1"
 *                   userId: "userId1"
 *                   username: "username1"
 *                   profileUserImageUrl: "profileImageUrl1"
 *                   text: "Message text 1"
 *                   type: "text"
 *                   filePath: null
 *                   fileName: null
 *                   fileSize: null
 *                   createdAt: "1702355845111"
 *               example(파일메세지):
 *                 value:
 *                   id: "messageId2"
 *                   parentMessageId: "parentMessageId2"
 *                   channelId: "channelId2"
 *                   userId: "userId2"
 *                   username: "username2"
 *                   profileUserImageUrl: "profileImageUrl2"
 *                   text: null
 *                   type: "image"
 *                   filePath: "filePath2"
 *                   fileName: "fileName2"
 *                   fileSize: 2048
 *                   createdAt: "1702355845222"
 */
ROUTER.get("/:channelId/files/:fileName", (req, res) => {
	let filePath = path.join(
		__dirname,
		"../..",
		"File",
		"message",
		req.params.channelId,
		req.params.fileName
	);

	res.sendFile(filePath);
});

module.exports = ROUTER;
