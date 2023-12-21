const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "찾을 수 없는 유저 아이디입니다.",
	INVALID_PASSWORD: "잘못된 비밀번호입니다.",
	DUPLICATED_ID: "이미 존재하는 아이디입니다.",
	INVALID_REGISTER: "해당 계정은 생성할 수 없습니다.",
};

const UserExceptions = {
	isInstanceOf: (err) => {
		const types = Object.values(UserExceptions).filter((e) => e.prototype instanceof Error);
		for (const type of types) if (err instanceof type) return true;
		return false;
	},

	NotFound: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.NotFound;
			this.message = message || MESSAGES.NOT_FOUND;
		}
	},

	InvalidPassword: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Unauthorized;
			this.message = message || MESSAGES.INVALID_PASSWORD;
		}
	},

	Duplicated: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Conflict;
			this.message = message || MESSAGES.DUPLICATED_ID;
		}
	},

	InvalidRegister: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.BadRequest;
			this.message = message || MESSAGES.INVALID_REGISTER;
		}
	},
};

module.exports = UserExceptions;
