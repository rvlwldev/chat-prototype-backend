const messageQuery = require("../../Database/Query/MessageQuery");

const FILE_HANDLER = require("../../Util/FileHandler");
const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const MESSAGE_LOAD_LIMIT_COUNT = 50;

// TODO : channelId 없으면 예외처리
// TODO : 잘못된 메세지 아이디 들어오면 예외처리
const MessageService = {
	getMessages: async (channelId, lastMessageId = null, order) => {
		if (lastMessageId)
			return MessageService.getMessagesWithLastMessageId(channelId, lastMessageId, order);

		let messages = await messageQuery.select(channelId, MESSAGE_LOAD_LIMIT_COUNT);
		let count = await messageQuery.selectCount(channelId);

		return { messages: messages, hasHistory: messages.length < count };
	},

	getMessagebyIds: async (channelId, messageIds) => {
		const message = await messageQuery
			.selectByIds(channelId, messageIds)
			.then((rows) => rows[0]);

		return { message: message };
	},

	getMessagesWithLastMessageId: async (channelId, lastMessageId, order) => {
		/** @type Array */
		const lastMessage = await messageQuery.selectByIds(channelId, lastMessageId);

		// TODO : 아이디값 잘못 입력 Exception
		if (lastMessage.length < 1) {
		}

		let lastCreatedAt = lastMessage[0].createdAt;

		let count = await messageQuery.selectCountBeforeCreatedAt(channelId, lastCreatedAt, order);
		const messages = await messageQuery.selecByCreatedAt(
			channelId,
			lastCreatedAt,
			order,
			MESSAGE_LOAD_LIMIT_COUNT
		);

		return { messages: messages, hasHistory: messages.length < count };
	},

	// TODO : 간혈적으로 insert되기 전에 클라이언트가 이벤트 받고 조회하면 없는 경우 생김 (await 해도... ㅠ)
	sendTextMessage: async (channelId, senderId, text, parentMessageId = null) => {
		let sdkResult = await exAPI
			.post("channels/" + channelId + "/messages/send", {
				senderId: senderId,
				type: "text",
				data: { type: "text" },
			})
			.then((res) => res);

		let dbResult = await messageQuery.insert({
			id: sdkResult.message.id,
			parentMessageId: parentMessageId,
			channelId,
			userId: senderId,
			text: text,
			type: "text",
			createdAt: sdkResult.message.createdAt,
		});

		if (!dbResult) throw new Error("messageQuery.insert error");

		return await messageQuery
			.selectByIds(channelId, sdkResult.message.id)
			.then((result) => result[0]);
	},

	sendFileMessage: async (channelId, request) => {
		const { file } = await FILE_HANDLER.saveFile(channelId, request);
		const { fileType, fileName, filePath, fileSize } = file;

		let exAPIbody = {
			senderId: request.body.senderId,
			type: "text",
			data: { type: fileType },
		};

		let sdkResult;

		if (file.isUploaded) {
			sdkResult = await exAPI
				.post("channels/" + channelId + "/messages/send", exAPIbody)
				.then((res) => res);

			let dbResult = await messageQuery.insert({
				id: sdkResult.message.id,
				parentMessageId: null,
				channelId,
				userId: request.body.senderId,
				text: null,
				type: fileType,
				fileName: fileName,
				filePath: filePath,
				fileSize: fileSize,
				createdAt: sdkResult.message.createdAt,
			});

			if (!dbResult) throw new Error("messageQuery.insert (file) error");
			if (!sdkResult.message.id) throw new Error("SDK file message send Error");
		}

		return await messageQuery
			.selectByIds(channelId, sdkResult.message.id)
			.then((result) => result[0]);
	},
};

module.exports = MessageService;
