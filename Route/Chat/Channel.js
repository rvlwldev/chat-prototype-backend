const express = require("express");
const ROUTER = express.Router();

const { HttpStatusCode } = require("axios");

/**
 * @swagger
 * tags:
 *   name: Channel
 *   description: 채널(채팅방)
 */

ROUTER.post("/", async (req, res) => {}); // TODO : 채널 생성

/**
 * @swagger
 * /channels/{channelId}/users:
 *   post:
 *     summary: 채널에 유저 추가
 *     tags: [Channel]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
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
ROUTER.post("/:channelId/users", async (req, res) => {});

/**
 * @swagger
 * /channels/{channelId}:
 *   get:
 *     summary: 채널 조회
 *     tags: [Channel]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 채널 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               id: "FIRST_TEST_OPEN_CHAT_CHANNEL01"
 *               name: "테스트 전체 공개 채팅방01"
 *               type: "super_public"
 */
ROUTER.get("/:channelId", async (req, res) => {});

/**
 * @swagger
 * /channels/{channelId}/users:
 *   get:
 *     summary: (미구현) 채널의 유저 목록 조회
 *     tags: [Channel]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         description: 채널 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 채널 유저 목록 조회 성공
 *         content:
 *           application/json:
 *             example:
 *               - id: "userId01"
 *                 name: "유저이름1"
 *               - id: "userId02"
 *                 name: "유저이름2"
 */
ROUTER.get("/:channelId/users", async (req, res) => {});

module.exports = ROUTER;
