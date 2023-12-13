const messageQuery = require("../../Database/Query/MessageQuery");

const FILE_HANDLER = require("../../Util/FileHandler");
const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const MESSAGE_LOAD_LIMIT_COUNT = 50;

// TODO : channelId 없으면 예외처리
// TODO : 잘못된 메세지 아이디 들어오면 예외처리
// TODO : 메세지 검색기능
const MessageService = {
	// TODO : 간혈적으로 insert되기 전에 클라이언트가 이벤트 받고 조회요청 받는 경우 생김 (await 해도...)
	// 일단은 재귀처리했음
	addTextMessage: async (channelId, senderId, text, parentMessageId = null) => {
		const exAPIresult = await MessageService.EX_API.addTextMessage(channelId, senderId)
			.then((message) => message)
			.catch((err) => console.log(err)); // TODO : 톡플러스 텍스트 메세지 전송 예외처리

		console.log(exAPIresult);

		let params = {
			id: exAPIresult.message.id,
			parentMessageId: parentMessageId,
			channelId,
			userId: senderId,
			text,
			type: "text",
			createdAt: exAPIresult.message.createdAt,
		};

		return await messageQuery
			.insert(params)
			.then(async () => {
				return await messageQuery
					.selectByIds(channelId, exAPIresult.message.id)
					.then((result) => result[0]);
			})
			.catch((err) => {
				throw new Error("messageQuery.insert error", err);
			});
	},

	addFileMessage: async (channelId, request) => {
		const FILE = await FILE_HANDLER.saveFile(channelId, request)
			.then((res) => res)
			.catch((err) => console.log(err)); // TODO : 파일 업로드 예외처리

		if (!FILE.isUploaded) {
		}

		const { type, name, path, size } = FILE;

		let senderId = request.body.senderId;
		const exAPIresult = await MessageService.EX_API.addFileMessage(channelId, senderId, type)
			.then((res) => res)
			.catch((err) => console.log(err)); // TODO : 톡플러스 파일 메세지 전송 예외처리

		let params = {
			id: exAPIresult.message.id,
			parentMessageId: null,
			channelId,
			userId: request.body.senderId,
			text: null,
			type: type,
			fileName: name,
			filePath: path,
			fileSize: size,
			createdAt: exAPIresult.message.createdAt,
		};

		return await messageQuery
			.insert(params)
			.then(async () => {
				return await messageQuery
					.selectByIds(channelId, exAPIresult.message.id)
					.then((result) => result[0]);
			})
			.catch((err) => {
				throw new Error("messageQuery.insert (file) error", err);
			}); // TODO : 파일메세지 저장 예외처리
	},

	getMessages: async (channelId, lastMessageId = null, order = "oldest") => {
		if (lastMessageId)
			return MessageService.getMessagesWithLastMessageId(channelId, lastMessageId, order);

		let messages = await messageQuery.select(channelId, MESSAGE_LOAD_LIMIT_COUNT);
		let count = await messageQuery.selectCount(channelId);

		return { messages: messages, hasHistory: messages.length < count };
	},

	getMessagesWithLastMessageId: async (channelId, lastMessageId, order = "oldest") => {
		/** @type Array */
		const lastMessage = await messageQuery.selectByIds(channelId, lastMessageId);

		// TODO : 아이디값 잘못 입력 Exception
		if (lastMessage.length < 1) {
		}

		let lastCreatedAt = lastMessage[0].createdAt;

		let count = await messageQuery.selectCountBeforeCreatedAt(channelId, lastCreatedAt, order);
		const messages = await messageQuery.selectByCreatedAt(
			channelId,
			lastCreatedAt,
			order,
			MESSAGE_LOAD_LIMIT_COUNT
		);

		return { messages: messages, hasHistory: messages.length < count };
	},

	getMessagebyIds: async (channelId, messageId) => {
		const message = await messageQuery
			.selectByIds(channelId, messageId)
			.then((rows) => rows[0]);

		return { message: message };
	},

	EX_API: {
		addTextMessage: async (channelId, senderId) => {
			let body = { senderId: senderId, type: "text", data: { type: "text" } };
			return exAPI.post(`channels/${channelId}/messages/send`, body);
		},

		addFileMessage: async (channelId, senderId, fileType) => {
			let body = { senderId: senderId, type: "text", data: { type: fileType } };
			return exAPI.post(`channels/${channelId}/messages/send`, body);
		},
	},
};

module.exports = MessageService;
