const { HttpStatusCode } = require("axios");

const MESSAGES = {
	NOT_FOUND: "채널을 찾을 수 없습니다.",
	NOT_ALLOWED: "권한이 없습니다.",
	DUPLICATED_ID: "이미 존재하는 채널입니다.",
	PUBLIC_CHANNEL_NAME_REQUIRE: "공개채널은 채널이름이 필수 입니다.",
};

const ChannelException = {
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
			this.message = message || MESSAGES.DUPLICATED_ID;
		}
	},

	NotAllowed: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.Forbidden;
			this.message = message || MESSAGES.NOT_ALLOWED;
		}
	},

	NameRequired: class extends Error {
		constructor(message) {
			super();
			this.httpStatusCode = HttpStatusCode.BadRequest;
			this.message = message || MESSAGES.PUBLIC_CHANNEL_NAME_REQUIRE;
		}
	},
};

module.exports = ChannelException;
