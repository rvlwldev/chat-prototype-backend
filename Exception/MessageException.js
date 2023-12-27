const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "해당 메세지를 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	NOT_CHANNEL_USER: "채널에 소속된 유저가 아닙니다.",
	INVALID_PARAMETERS: "필수 값이 입력되지 않았습니다.",
	DUPLICATED_REQUEST: "이미 처리된 요청입니다.",
};

const MessageException = {
	NotFound: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.NotFound;
			this.message = message || MESSAGES.NOT_FOUND;
		}
	},

	NotAllowed: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Forbidden;
			this.message = message || MESSAGES.NOT_ALLOWED;
		}
	},

	ChannelAccessDenied: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Forbidden;
			this.message = message || MESSAGES.NOT_CHANNEL_USER;
		}
	},

	MissingRequiredValues: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.BadRequest;
			this.message = message || MESSAGES.INVALID_PARAMETERS;
		}
	},

	DuplicatedRequest: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Conflict;
			this.message = message || MESSAGES.DUPLICATED_REQUEST;
		}
	},
};

module.exports = MessageException;
