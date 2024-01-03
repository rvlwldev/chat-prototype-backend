const Exception = require("../Exception");
const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "채널을 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	DUPLICATED_ID: "이미 존재하는 채널입니다.",
	PUBLIC_CHANNEL_NAME_REQUIRE: "공개채널은 채널이름이 필수 입니다.",
	INVALID_PARAMETERS: "필수 값이 입력되지 않았습니다.",
	NOT_CHANNEL_USER: "해당 채널의 소속한 유저가 아닙니다.",
	ALREADY_CHANNEL_USER: "이미 채널에 소속된 유저입니다.",
};

const ChannelException = {
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

	NotAllowed: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_ALLOWED, HttpStatusCode.Forbidden);
		}
	},

	NameRequired: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.PUBLIC_CHANNEL_NAME_REQUIRE, HttpStatusCode.BadRequest);
		}
	},

	MissingRequiredValues: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.INVALID_PARAMETERS, HttpStatusCode.BadRequest);
		}
	},

	NotChannelUser: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.NOT_CHANNEL_USER, HttpStatusCode.Unauthorized);
		}
	},

	ExistChannelUser: class extends Exception {
		constructor(message) {
			super(message || MESSAGES.ALREADY_CHANNEL_USER, HttpStatusCode.Conflict);
		}
	},
};

module.exports = ChannelException;
