const messageQuery = require("../../Database/Query/MessageQuery");

const FILE_HANDLER = require("../../Util/FileHandler");
const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const MESSAGE_LOAD_LIMIT_COUNT = 100;

// TODO : channelId 없으면 예외처리
// TODO : 잘못된 메세지 아이디 들어오면 예외처리
const MessageService = {
	getMessages: async (channelId, lastMessageId = null) => {
		let messages;
		let count;

		if (lastMessageId) {
			let lastMessage = await messageQuery.selectByIds(channelId, lastMessageId);
			let lastCreatedAt = lastMessage[0].createdAt;

			messages = await messageQuery.selectAfterCreatedAt(
				channelId,
				lastCreatedAt,
				MESSAGE_LOAD_LIMIT_COUNT
			);

			count = await messageQuery.selectCountAfterCreatedAt(channelId, lastCreatedAt);
		} else {
			messages = await messageQuery.select(channelId, MESSAGE_LOAD_LIMIT_COUNT);
			count = await messageQuery.selectCount(channelId);
		}

		return { messages: messages, hasHistory: messages.length < count };
	},

	getMessagebyIds: async (channelId, messageIds) => {
		const message = await messageQuery
			.selectByIds(channelId, messageIds)
			.then((rows) => rows[0]);

		return { message: message };
	},

	getMessagesWithLastMessageId: async (channelId, lastMessageId) => {
		/** @type Array */
		const lastMessage = await messageQuery.selectByIds(channelId, lastMessageId);

		// TODO : 아아디값들 잘못 입력 Exception
		if (lastMessage.length < 1) {
		}

		const lastCreatedAt = lastMessage[0].createdAt;

		const messages = await messageQuery.selectAfterCreatedAt(
			channelId,
			lastCreatedAt,
			MESSAGE_LOAD_LIMIT_COUNT
		);

		let count = await messageQuery.selectCountAfterCreatedAt(channelId, lastCreatedAt);

		return { messages: messages, hasHistory: messages.length < count };
	},

	sendTextMessage: async (channelId, senderId, text, parentMessageId = null) => {
		let result = false;

		await exAPI
			.post("channels/" + channelId + "/messages/send", {
				senderId: senderId,
				type: "text",
				data: { type: "text" },
			})
			.then(async (response) => {
				await messageQuery.insert({
					id: response.message.id,
					parentMessageId: parentMessageId,
					channelId,
					userId: senderId,
					text: text,
					type: "text",
					createdAt: response.message.createdAt,
				});
			})
			.then(() => (result = true))
			.catch((err) => console.error(err));

		return result;
	},

	sendFileMessage: async (channelId, request) => {
		const { file } = await FILE_HANDLER.saveFile(channelId, request);
		const { fileType, fileName, filePath, fileSize } = file;

		let data = {
			type: fileType,
			fileName: fileName,
			filePath: filePath,
			fileSize: String(fileSize),
		};

		let exAPIbody = {
			senderId: request.body.senderId,
			type: "text",
			data: data,
		};

		if (file.isUploaded) {
			return await exAPI
				.post("channels/" + channelId + "/messages/send", exAPIbody)
				.then(async (response) => {
					await messageQuery.insert({
						id: response.message.id,
						parentMessageId: null,
						channelId,
						userId: request.body.senderId,
						text: null,
						type: fileType,
						fileName: fileName,
						filePath: filePath,
						fileSize: fileSize,
						createdAt: response.message.createdAt,
					});

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

// const parser = {
// 	toDTObyQueryResults: (/** @type Array */ queryResults) => {
// 		return queryResults.map((row) => {
// 			return {
// 				id: row.id,
// 				channelId: row.channelId,
// 				userId: row.userId,
// 				username: row.username,
// 				profileImageUrl: row.profileImageUrl,
// 				text: row.text,
// 				createdAt: row.createdAt,
// 				test: row.test,
// 				data: {
// 					type: row.type,
// 					filePath: row.filePath,
// 					fileName: row.fileName,
// 					fileSize: row.fileSize,
// 				},
// 			};
// 		});
// 	},
// };

module.exports = MessageService;
