const { HttpStatusCode } = require("axios");
const JSON_WEB_TOKEN = require("jsonwebtoken");

const ServiceController = require("../Controller/Service");
const UserController = require("../Controller/User");

const JWT = {
	generate: (serviceId, userId) => {
		const payload = { serviceId: serviceId, userId: userId };
		const secretKey = process.env.JWT_KEY;
		const options = { expiresIn: "1h" };

		return JSON_WEB_TOKEN.sign(payload, secretKey, options);
	},

	verify: async (req, res, next) => {
		const token = req.headers.authorization;
		const secretKey = process.env.JWT_KEY;

		JSON_WEB_TOKEN.verify(token, secretKey, async (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					err.message = "토큰이 만료되었습니다.";
					return res.status(HttpStatusCode.Unauthorized).json(err);
				}

				err.message = "올바르지 않은 토큰입니다.";
				return res.status(HttpStatusCode.Unauthorized).json(err);
			}

			let { serviceId, userId } = decoded;

			try {
				req.service = await ServiceController.getServiceById(serviceId);
				req.user = await UserController.getUser(serviceId, userId);

				req.serviceId = serviceId;
				req.userId = userId;
				next();
			} catch (err) {
				next(err);
			}
		});
	},
};

module.exports = JWT;
