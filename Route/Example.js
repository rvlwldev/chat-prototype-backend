const ROUTER = require("express").Router();
const DATABASE = require("../Util/Database");
const AXIOS = require("axios");
const FILE_HANDLER = require("../Util/FileHandler");

ROUTER.get("/:channelId/messages", async (req, res) => {
	const channelId = req.params.channelId;
	const query1 = "SELECT 1";
	const query2 = "SELECT 2";

	let result = {
		ts: channelId,
		result: "메세지 라우터2",
	};

	try {
		// 쿼리1 실행
		const [results1] = await DATABASE.local.promise().query(query1);
		console.log(results1);
		result.r1 = results1;

		// 쿼리2 실행
		const [results2] = await DATABASE.local.promise().query(query2);
		console.log(results2);
		result.r2 = results2;

		// axios를 사용하여 외부 API 요청
		const axiosResult = await AXIOS.get("https://jsonplaceholder.typicode.com/todos/1");
		console.log(axiosResult.data);
		result.axiosData = axiosResult.data;

		// 최종 결과 반환
		res.json(result);
	} catch (err) {
		console.error("MySQL query or Axios request error:", err);
		res.status(500).send("Internal Server Error");
	}
});

ROUTER.post("/:channelId/messages", async (req, res) => {
	let result = {};
	const REQUEST_TYPE = req.headers["content-type"].toLowerCase();

	if (REQUEST_TYPE.includes("multipart/form-data")) {
		result = await FILE_HANDLER.saveFile(req.params.channelId, req);
	} else if (REQUEST_TYPE.includes("application/json")) {
		result.channelId = req.params.channelId;
		result.test = req.body.text;
	}

	res.json(result);
});
