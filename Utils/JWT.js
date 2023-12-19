const { HttpStatusCode } = require("axios");
const JWT = require("jsonwebtoken");

const token = {
	generate: (user) => {
		const payload = { id: user.id, name: user.name, role: user.role };
		const secretKey = process.env.JWT_KEY;
		const options = { expiresIn: "1h" };

		return JWT.sign(payload, secretKey, options);
	},

	verify: (req, res, next) => {
		const token = req.headers.authorization;
		const secretKey = process.env.JWT_KEY;

		JWT.verify(token, secretKey, (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError")
					return res
						.status(HttpStatusCode.Unauthorized)
						.json({ message: "토큰이 만료되었습니다." });
				else
					return res
						.status(HttpStatusCode.Unauthorized)
						.json({ message: "올바르지 않은 토큰입니다." });
			}

			req.userData = decoded;
			next();
		});
	},
};

module.exports = token;
