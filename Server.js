require("dotenv").config();

const PORT = process.env.PORT || 3000;

const express = require("express");
const APP = express();
const { initializeWebSocket } = require("./Utils/WebSocket");

// FORM DATA 수신
APP.use(express.urlencoded());

// CORS
APP.use(require("./Configuration/CORS"));

// SWAGGER
const docs = require("./Configuration/Docs");
APP.use("/docs", docs);

APP.get("/", (req, res) => res.send({ connect: true, time: new Date() }));

const user = require("./Route/User/User");
APP.use("/users", user);

const channel = require("./Route/Chat/Channel");
const message = require("./Route/Chat/Message");
APP.use("/channels", channel, message);

const server = APP.listen(PORT, async () => {
	const initializeData = require("./Configuration/Prisma/Seed");
	await initializeData(true).catch((e) => console.log(e));
	console.log(`서버가 포트:${PORT} 에서 실행중`);
});

initializeWebSocket(server);
