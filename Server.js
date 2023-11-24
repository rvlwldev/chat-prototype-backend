const express = require("express");
const APP = express();

const cors = require("cors");
const path = require("path");

APP.locals.adminID = "47e2beb243c5bb9c";

const dynamicCors = (origin, callback) => {
	const allowedOrigins = [
		"http://211.234.123.19/", // CUG
		"http://192.168.2.65:8081",
		"http://172.18.96.1:8081",
		"http://127.0.0.1:8081",
		"http://localhost:8081",
		"http://localhost",
		"ELECTRON",
	];

	if (allowedOrigins.includes(origin)) callback(null, true);
	else callback(new Error("Not allowed by CORS"));
};

APP.use(
	cors({
		origin: dynamicCors,
		optionsSuccessStatus: 200,
	})
);

APP.use(express.urlencoded());
APP.use(express.static(path.join(__dirname, "File", "Asset")));

APP.get("/asset/img/no_picture_user.png", (req, res) =>
	res.sendFile(path.join(__dirname, "File", "Asset", "img", "no_picture_user.png"))
);

APP.get("/File/message/:channelId/:fileName", (req, res) =>
	res.sendFile(path.join(__dirname, "File", "message", req.params.channelId, req.params.fileName))
);

const UserRouter = require("./Route/User/User");
APP.use("/", UserRouter);

const ChannelRouter = require("./Route/Chat/Channel");
const MessageRouter = require("./Route/Chat/Message");
APP.use("/channels", ChannelRouter);
APP.use("/channels", MessageRouter);

APP.get("/", (req, res) => res.send({ connect: true, time: new Date() })); // ping test

const port = process.env.PORT || 3000;

APP.listen(port, () => console.log(`서버가 http://localhost:${port} 포트에서 실행 중입니다.`));
