const prisma = require("../Utils/Prisma");

const ChannelController = require("./Channel");

const MessageException = require("../Exception/Chat/MessageException");
const ChannelException = require("../Exception/Chat/ChannelException");

// TODO : prisma 에러 코드 상수화 및 구현
// TODO : MessageException 구현

const MessageController = {
	getMessageById: async (SERVICE, channelId, messageId) =>
		await prisma.message
			.findUnique({
				where: {
					service: SERVICE,
					channel: await ChannelController.getChannelById(SERVICE, channelId),
					id: messageId,
				},
				select: {
					id: true,
					userId: true,
					channel: true,
					type: true,
					text: true,
					createdAt: true,
					filePath: type == "text",
					fileName: type == "text",
					fileSize: type == "text",
				},
			})
			.catch((err) => {
				if (err.code == "P2001") throw new MessageException.NotFound();
			}),

	getMessages: async (SERVICE, channelId, lastMessageId, order = "asc", limit = 100) => {
		let where = {
			service: SERVICE,
			channel: await ChannelController.getChannelById(channelId),
		};

		if (!lastMessageId) {
			let lastMessage = await MessageController.getMessageById(
				SERVICE,
				channelId,
				lastMessageId
			);

			where.createdAt = {
				[order === "asc" ? "gt" : "lt"]: lastMessage.createdAt,
			};
		}

		return await prisma.message.findMany({
			where: where,
			select: {
				id: true,
				channel: true,
				type: true,
				text: true,
				filePath: true,
				fileName: true,
				fileSize: true,
				createdAt: true,
			},
			take: limit,
			orderBy: { createdAt: order },
		});
	},

	saveMessage: async (SERVICE, channelId, text) =>
		await prisma.message
			.create({
				data: {
					service: SERVICE,
					channelId: channelId,
					type: "text",
					text: text,
				},
				select: {
					id: true,
					userId: true,
					channel: true,
					type: true,
					text: true,
					createdAt: true,
				},
			})
			.catch((err) => {
				if (err.code == "P2002") throw new Error();
				else throw err;
			}),

	saveMessage: async (SERVICE, channelId, text, parentId) =>
		await prisma.message
			.create({
				data: {
					service: SERVICE,
					channelId: channelId,
					type: "text",
					text: text,
					parent: await MessageController.getMessageById(SERVICE, channelId, parentId),
				},
				select: {
					parent: true,
					id: true,
					userId: true,
					channel: true,
					type: true,
					text: true,
					createdAt: true,
				},
			})
			.catch((err) => {
				if (err.code == "P2002") throw new Error();
				else throw err;
			}),

	// TODO : 파일 저장
	saveFileMessage: async (SERVICE, channelId, text, file) => {
		const CHANNEL = await prisma.channel
			.findUnique({
				where: { service: SERVICE, id: channelId },
			})
			.catch((err) => {
				if (err.code == "P2001") throw new ChannelException.NotFound();
			});
	},

	updateMessage: async (SERVICE, channelId, messageId, text) =>
		await prisma.message.update({
			where: {
				service: SERVICE,
				channelId: channelId,
				id: messageId,
			},
			data: {
				text: text,
				updatedYn: true,
			},
		}),

	deleteMessage: async (SERVICE, channelId, messageId) =>
		await prisma.message.update({
			where: {
				service: SERVICE,
				channelId: channelId,
				id: messageId,
			},
			data: {
				type: "deleted",
				filePath: null,
				fileName: null,
				fileSize: null,
				text: null,
				deletedYn: true,
			},
		}),
};

module.exports = MessageController;
