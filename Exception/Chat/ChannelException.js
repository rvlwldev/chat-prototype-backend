const Exception = require("../Exception");
const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "채널을 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	DUPLICATED_ID: "이미 존재하는 채널입니다.",
	PUBLIC_CHANNEL_NAME_REQUIRE: "공개채널은 채널이름이 필수 입니다.",
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
};

module.exports = ChannelException;
