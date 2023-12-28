const Exception = require("../Exception");
const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "해당 서비스를 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	DUPLICATED_ID: "이미 존재하는 서비스ID 입니다.",
	INVALID_PARAMETERS: "필수 값이 입력되지 않았습니다.",
};

const ServiceException = {
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

	AccessDenied: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_ALLOWED, HttpStatusCode.Forbidden);
		}
	},

	MissingRequiredValues: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.INVALID_PARAMETERS, HttpStatusCode.BadRequest);
		}
	},
};

module.exports = ServiceException;
