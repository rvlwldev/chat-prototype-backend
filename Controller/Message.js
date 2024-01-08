const prisma = require("../Utils/Prisma");

const { v4: UUID4 } = require("uuid");

const MessageException = require("../Exception/Chat/MessageException");
const ChannelException = require("../Exception/Chat/ChannelException");
const Exception = require("../Exception/Exception");

const DEFAULT_SELECT = {
	message: {
		id: true,
		userId: true,
		channelId: true,
		type: true,
		text: true,
		filePath: true,
		fileName: true,
		fileSize: true,
		createdAt: true,
		deletedAt: true,
	},
};

function toDTO(message) {
	if (message instanceof Array) return message.map((msg) => toDTO(msg));

	delete message.deletedAt;
	message.filePath || delete message.filePath;
	message.fileName || delete message.fileName;
	message.fileSize || delete message.fileSize;

	if (message.type) message.type = message.type.name;
	if (message.parent) message.parent = toDTO(message.parent);
	else delete message.parent;

	return message;
}

const MessageController = {
	getMessageById: async (serviceId, channelId, messageId) =>
		await prisma.message
			.findUniqueOrThrow({
				where: { serviceId: serviceId, channelId: channelId, id: messageId },
				select: { ...DEFAULT_SELECT.message, parent: true },
			})
			.then((message) => toDTO(message)),

	// TODO : 잘못된파라미터 입력 예외 추가
	getMessages: async (serviceId, channelId, lastMessageId, order = "asc", limit = 100) => {
		order = order.toLowerCase();
		if ((order != "asc" && order != "desc") || isNaN(limit)) throw new Error();
		limit = parseInt(limit);

		return await MessageController.getMessageById(serviceId, channelId, lastMessageId).then(
			async (lastMessage) =>
				await prisma.message
					.findMany({
						where: {
							serviceId: serviceId,
							channelId: channelId,
							createdAt: { [order === "asc" ? "gt" : "lt"]: lastMessage.createdAt },
						},
						select: {
							...DEFAULT_SELECT.message,
							parent: { select: DEFAULT_SELECT.message },
						},
						take: limit,
						orderBy: { createdAt: order },
					})
					.then((messages) => toDTO(messages))
		);
	},

	saveTextMessage: async (serviceId, userId, channelId, text, parentId = null) => {
		return await prisma.message
			.create({
				data: {
					service: { connect: { id: serviceId } },
					user: { connect: { id: userId } },
					channel: { connect: { ChannelPK: { serviceId: serviceId, id: channelId } } },
					text: text,
					id: UUID4().substring(0, 32),
					type: { connect: { code: 10 } },
					...(!!parentId && { parent: { connect: { id: parentId } } }),
				},
				select: {
					...DEFAULT_SELECT.message,
					...(!!parentId && { parent: { select: { ...DEFAULT_SELECT.message } } }),
				},
			})
			.then((message) => toDTO(message));
	},

	// TODO : 파일 저장
	saveFileMessage: async (serviceId, channelId, text, file) => {
		const CHANNEL = await prisma.channel
			.findUnique({ where: { serviceId: serviceId, id: channelId } })
			.catch((err) => {
				if (err.code == "P2001") throw new ChannelException.NotFound();
			});
	},

	updateMessage: async (serviceId, channelId, messageId, text) =>
		await prisma.message.update({
			where: { serviceId: serviceId, channelId: channelId, id: messageId },
			data: { text: text, updatedAt: new Date() },
			select: DEFAULT_SELECT.message,
		}),

	// TODO : 특정 짧은 시간이 지나기 전에 삭제하면 그냥 삭제?
	// 특정 시간이 지나면 삭제여부만 변경?
	deleteMessage: async (serviceId, channelId, messageId) =>
		await prisma.message.update({
			where: { serviceId: serviceId, channelId: channelId, id: messageId },
			data: { deletedAt: new Date() },
		}),
};

module.exports = MessageController;
