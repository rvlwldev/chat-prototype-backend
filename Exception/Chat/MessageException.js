const Exception = require("../Exception");
const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "해당 메세지를 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	DELETED_MESSAGE: "이미 삭제된 메세지입니다.",
	NOT_CHANNEL_USER: "채널에 소속된 유저가 아닙니다.",
	INVALID_PARAMETERS: "필수 값이 입력되지 않았습니다.",
	DUPLICATED_REQUEST: "이미 처리된 요청입니다.",
};

const MessageException = {
	NotFound: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_FOUND, HttpStatusCode.NotFound);
		}
	},

	NotAllowed: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_ALLOWED, HttpStatusCode.Forbidden);
		}
	},

	Deleted: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.DELETED_MESSAGE, HttpStatusCode.NotFound);
		}
	},

	ChannelAccessDenied: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_CHANNEL_USER, HttpStatusCode.Forbidden);
		}
	},

	MissingRequiredValues: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.INVALID_PARAMETERS, HttpStatusCode.BadRequest);
		}
	},

	DuplicatedRequest: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.DUPLICATED_REQUEST, HttpStatusCode.Conflict);
		}
	},
};

module.exports = MessageException;
