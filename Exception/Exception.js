const { HttpStatusCode } = require("axios");

class Exception extends Error {
	constructor(message, code) {
		super();
		this.error = true;
		this.httpStatusCode = code in HttpStatusCode ? code : 500;
		this.message = message;
	}
}

module.exports = Exception;
