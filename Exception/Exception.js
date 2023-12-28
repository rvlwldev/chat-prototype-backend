const { HttpStatusCode } = require("axios");

class Exception extends Error {
	constructor(message, code) {
		super(message);

		this.code = code in HttpStatusCode ? code : 500;
		this.error = true;
	}
}

module.exports = Exception;
