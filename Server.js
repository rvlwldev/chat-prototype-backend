const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const cors = require("cors");
const path = require("path");

const APP = express();

const ChannelValidator = require("./Service/Chat/ChannelValidator");

const sessionStore = new MySQLStore({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "1234",
	database: "chat",
	clearExpired: true,
	checkExpirationInterval: 600000,
	expiration: 3600000,
});

APP.use(
	session({
		secret: "secret-key",
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: {
			secure: false,
			httpOnly: false,
			maxAge: 3600000,
		},
		name: "chat-sid",
	})
);

const dynamicCORS = (origin, callback) => {
	const allowedOrigins = [
		// CUG
		"http://211.234.123.19",

		// locals
		"http://192.168.2.65:8081",
		"http://172.18.96.1:8081",
		"http://127.0.0.1:8081",
		"http://localhost:8081",
		"http://localhost",

		// nativeApp
		"ELECTRON",

		// 임시
		undefined,
	];

	if (allowedOrigins.includes(origin)) callback(null, true);
	else callback(new Error("Not allowed by CORS : " + origin));
};

APP.use(cors({ origin: dynamicCORS, optionsSuccessStatus: 200 }));
APP.use(express.urlencoded());
APP.use(express.static(path.join(__dirname, "File", "Asset")));

const common = require("./Route/Common");
APP.use("/", common);

const user = require("./Route/User/User");
APP.use("/users", user);

const channel = require("./Route/Chat/Channel");
APP.use("/channels", channel);

const message = require("./Route/Chat/Message");
APP.use("/channels", message);

const port = process.env.PORT || 3000;
APP.listen(port, async () => {
	await ChannelValidator.validatePublicChannelAdminId();
	await ChannelValidator.validatePublicChannels();

	console.log(`서버가 http://localhost:${port} 포트에서 실행 중입니다.`);
});
