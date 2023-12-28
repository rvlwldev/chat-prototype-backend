const Exception = require("../Exception");
const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "찾을 수 없는 유저 아이디입니다.",
	INVALID_PASSWORD: "잘못된 비밀번호입니다.",
	DUPLICATED_ID: "이미 존재하는 아이디입니다.",
	INVALID_REGISTER: "해당 계정은 직접 생성할 수 없습니다.",
};

const UserExceptions = {
	NotFound: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_FOUND, HttpStatusCode.NotFound);
		}
	},

	Duplicated: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.DUPLICATED_ID, HttpStatusCode.Conflict);
		}
	},

	InvalidPassword: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.INVALID_PASSWORD, HttpStatusCode.Unauthorized);
		}
	},

	InvalidRole: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.INVALID_REGISTER, HttpStatusCode.BadRequest);
		}
	},
};

module.exports = UserExceptions;
