require("dotenv").config();

const PORT = process.env.PORT || 3000;

const express = require("express");
const APP = express();

const bodyParser = require("body-parser");
// JSON으로 요청 수신
APP.use(bodyParser.json());

// FORM DATA 수신
APP.use(express.urlencoded());

// CORS
APP.use(require("./Configuration/CORS"));

// SWAGGER
// TODO : API 명세 작성
const swaggerRouter = require("./Configuration/Documentation/DocumentationRouter");
APP.use("/docs", swaggerRouter);

APP.get("/", (req, res) => res.send({ connect: true, time: new Date() }));

const user = require("./Route/User/User");
APP.use("/users", user);

const channel = require("./Route/Chat/Channel");
const message = require("./Route/Chat/Message");
APP.use("/channels", channel, message);

const server = APP.listen(PORT, async () => {
	const initializeData = require("./Configuration/Prisma/Seed");
	await initializeData(false).catch((e) => console.log(e));
	console.log(`서버가 ${PORT}번 포트에서 실행중`);
});

const { openSocketWithServer } = require("./Utils/WebSocket");
openSocketWithServer(server);
