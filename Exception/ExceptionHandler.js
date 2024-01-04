const Exception = require("./Exception");
const { HttpStatusCode } = require("axios");

module.exports = exceptionHandler = (err, req, res, next) => {
	if (err instanceof Exception) {
		res.status(err.httpStatusCode).json(err);
	} else {
		// TODO : 알 수 없는 에러는? ( 로그 남기기? )
		res.status(HttpStatusCode.InternalServerError).json(err);
	}
};
