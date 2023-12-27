const { HttpStatusCode } = require("axios");
const JSON_WEB_TOKEN = require("jsonwebtoken");

const JWT = {
	generate: (SERVICE, USER) => {
		const payload = { service: SERVICE, user: USER };
		const secretKey = process.env.JWT_KEY;
		const options = { expiresIn: "1h" };

		return JSON_WEB_TOKEN.sign(payload, secretKey, options);
	},

	verify: async (req, res, next) => {
		const token = req.headers.authorization;
		const secretKey = process.env.JWT_KEY;

		JSON_WEB_TOKEN.verify(token, secretKey, (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError")
					return res
						.status(HttpStatusCode.Unauthorized)
						.json({ error: "토큰이 만료되었습니다." });
				else
					return res
						.status(HttpStatusCode.Unauthorized)
						.json({ error: "올바르지 않은 토큰입니다." });
			}

			req.USER = decoded.user;
			req.SERVICE = decoded.service;

			next();
		});
	},
};

module.exports = JWT;
