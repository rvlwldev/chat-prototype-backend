const messageQuery = require("../../Database/Query/MessageQuery");

const FILE_HANDLER = require("../../Util/FileHandler");
const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

// TODO : channelId 없으면 예외처리
// TODO : 잘못된 메세지 아이디 들어오면 예외처리
// TODO : 메세지 반환 시 자체 limit 제한
const MessageService = {
	getMessages: async (channelId) => {
		return await messageQuery.select(channelId);
		// return parser.toDTObyQueryResults(await messageQuery.select(channelId));
	},

	getMessagesWithLastMessageId: async (channelId, lastMessageId) => {
		/** @type Array */
		let lastMessage = await messageQuery.selectById(channelId, lastMessageId);

		/** @type Array */
		let DBmessages = [];
		if (lastMessage.length > 0) {
			let lastCreatedAt = lastMessage[0].createdAt;
			DBmessages = await messageQuery.selectAfterCreatedAt(channelId, lastCreatedAt);
			DBmessages = parser.toDTObyQueryResults(DBmessages);
		}

		return DBmessages;
	},

	sendTextMessage: async (channelId, senderId, text) => {
		let result = false;

		await exAPI
			.post("channels/" + channelId + "/messages/send", {
				senderId: senderId,
				text: text,
				type: "text",
				data: { type: "text" },
			})
			.then(async (response) => await messageQuery.insert(response.message))
			.then(() => (result = true))
			.catch((err) => console.error(err));

		return result;
	},

	sendFileMessage: async (channelId, request) => {
		const fileSaveResult = await FILE_HANDLER.saveFile(channelId, request);

		let body = {
			senderId: request.body.senderId,
			type: "text",
			data: {
				type: request.body.type,
				fileName: fileSaveResult.file.fileName,
				filePath: fileSaveResult.file.filePath,
				fileSize: request.body.fileSize,
			},
		};

		if (fileSaveResult) {
			return await exAPI
				.post("channels/" + channelId + "/messages/send", body)
				.then(async (response) => {
					await messageQuery.insert(response.message);
					return response.message;
				})
				.catch((err) => {
					console.log("FILE MESSAGE ERROR");
					console.error(err);
				});
		}
		return false;
	},
};

const parser = {
	toDTObyQueryResults: (/** @type Array */ queryResults) => {
		return queryResults.map((row) => {
			return {
				id: row.id,
				channelId: row.channelId,
				userId: row.userId,
				username: row.username,
				profileImageUrl: row.profileImageUrl,
				text: row.text,
				createdAt: row.createdAt,
				test: row.test,
				data: {
					type: row.type,
					filePath: row.filePath,
					fileName: row.fileName,
					fileSize: row.fileSize,
				},
			};
		});
	},
};

module.exports = MessageService;
