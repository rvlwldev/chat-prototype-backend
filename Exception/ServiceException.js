const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_ALLOWED: "권한이 없습니다.",
	NOT_FOUND: "해당 서비스를 찾을 수 없습니다.",
	DUPLICATED_ID: "이미 존재하는 서비스ID 입니다.",
	INVALID_PARAMETERS: "필수 값이 입력되지 않았습니다.",
};

const ServiceException = {
	isInstanceOf: (err) => {
		const types = Object.values(ServiceException).filter((e) => e.prototype instanceof Error);
		for (const type of types) if (err instanceof type) return true;
		return false;
	},

	AccessDenied: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Forbidden;
			this.message = message || MESSAGES.NOT_ALLOWED;
		}
	},

	NotFound: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.NotFound;
			this.message = message || MESSAGES.NOT_FOUND;
		}
	},

	Duplicated: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Conflict;
			this.message = message || MESSAGES.NOT_FOUND;
		}
	},

	MissingRequiredValues: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.BadRequest;
			this.message = message || MESSAGES.INVALID_PARAMETERS;
		}
	},
};

module.exports = ServiceException;
