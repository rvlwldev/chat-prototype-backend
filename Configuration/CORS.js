const cors = require("cors");

const options = (origin, callback) => {
	const allowedOrigins = [
		process.env.ORIGIN_CHAT_LOCAL1,
		process.env.ORIGIN_CHAT_LOCAL2,
		process.env.ORIGIN_ELECTRON,

		"http://127.0.0.1:5500", // live server

		undefined
	];

	console.log("origin : " + origin + " " + allowedOrigins.includes(origin));

	if (allowedOrigins.includes(origin)) callback(null, true);
	else callback(new Error("Not allowed by CORS : " + origin));
};

const CORS = cors({ origin: options, optionsSuccessStatus: 200 });
module.exports = CORS;
