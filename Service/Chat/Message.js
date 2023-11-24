const messageQuery = require("../../Database/Query/MessageQuery");

const FILE_HANDLER = require("../../Util/FileHandler");
const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const MessageService = {
	// TODO : channelId 없으면 예외처리
	getMessages: async (channelId) => {
		/** @type Array */
		let DBmessages = parser.toDTObyQueryResults(await messageQuery.select(channelId));

		let queryString = `?limit=${50}`;
		if (DBmessages.length > 0)
			queryString += `&lastMessageId=${DBmessages[DBmessages.length - 1].id}`;

		let hasNext = false;
		let APImessages = await exAPI
			.get(`channels/${channelId}/messages` + queryString)
			.then((response) => {
				hasNext = response.hasNext;
				return response.messages;
			});

		messageQuery.insertAll(APImessages);

		return { messages: DBmessages.concat(APImessages), hasNext: hasNext };
	},

	// TODO : 잘못된 아이디 들어오면 예외처리
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

		let queryString = `?limit=${50}&lastMessageId=${lastMessageId}`;

		let hasNext = false;
		let APImessages = await exAPI
			.get(`channels/${channelId}/messages` + queryString)
			.then((response) => {
				hasNext = response.hasNext;
				return response.messages;
			});

		messageQuery.insertAll(APImessages);

		return { messages: DBmessages.concat(APImessages), hasNext: hasNext };
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
