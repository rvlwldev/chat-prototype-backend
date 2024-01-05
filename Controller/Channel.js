const prisma = require("../Utils/Prisma");

const ChannelException = require("../Exception/Chat/ChannelException");

const { v4: UUID4 } = require("uuid");
const UserController = require("./User");

// TODO : SELECT 상수화
const DEFAULT_SELECT = {
	user: {
		id: true,
		name: true,
		role: true,
		lastloggedInAt: true,
		profileUserImageUrl: true,
	},

	channel: {
		id: true,
		name: true,
		type: true,
	},

	userChannel: {
		userId: true,
		channel: true,
		name: true,
		joinAt: true,
		readAt: true,
	},

	parseToChannel: (userChannel) => {
		return {
			id: userChannel.channel.id,
			name: userChannel.name,
			joinAt: userChannel.joinAt,
			readAt: userChannel.readAt,
		};
	},
};

// TODO : 모든경로에서 serviceId, channelId 모두 파라미터로 받기, 메소드 재사용/상수화 -> 코드 줄이기
const ChannelController = {
	getChannelById: async (serviceId, channelId) =>
		await prisma.channel
			.findUnique({
				where: { ChannelPK: { serviceId: serviceId, id: channelId } },
				select: DEFAULT_SELECT.channel,
			})
			.then((channel) => {
				if (!channel) throw new ChannelException.NotFound();
				return channel;
			})
			.finally(() => prisma.$disconnect()),

	getChannelsByUser: async (serviceId, userId) =>
		await prisma.userChannel
			.findMany({
				where: { serviceId: serviceId, userId: userId },
				select: { channel: { select: DEFAULT_SELECT.channel } },
			})
			.then((userChannels) => {
				return userChannels
					.map((userChannel) => userChannel.channel)
					.sort((a, b) => b.typeCode - a.typeCode);
			})
			.finally(() => prisma.$disconnect()),

	getChannelsByTypeCode: async (serviceId, typeCode) =>
		await prisma.channel.findMany({ where: { serviceId: serviceId, typeCode: typeCode } }),

	getUserChannel: async (serviceId, userId, channelId) =>
		await prisma.userChannel
			.findUnique({
				where: {
					UserChannelPK: {
						serviceId: serviceId,
						userId: userId,
						channelId: channelId,
					},
				},
				select: {
					user: { select: DEFAULT_SELECT.user },
					channel: { select: DEFAULT_SELECT.channel },
				},
			})
			.then((userChannel) => {
				if (!!!userChannel) throw new ChannelException.NotChannelUser();
				return userChannel;
			}),

	getUsersByChannelId: async (serviceId, channelId) =>
		await prisma.userChannel
			.findMany({
				where: { serviceId: serviceId, channelId: channelId },
				select: {
					channel: { select: DEFAULT_SELECT.channel },
					user: { select: DEFAULT_SELECT.user },
				},
			})
			.then((userChannels) => {
				return {
					channel: userChannels[0]?.channel,
					users: userChannels.map((userChannel) => userChannel.user),
				};
			}),

	saveChannel: async (serviceId, userId, name = null, typeCode = 10) => {
		if (!!!typeCode) throw new ChannelException.MissingRequiredValues();

		if (typeCode >= 50) {
			if (!name) throw new ChannelException.NameRequired();

			await UserController.getUser(serviceId, userId).then((USER) => {
				if (USER.roleCode < 9) throw new ChannelException.NotAllowed();
			});

			await prisma.channel
				.findUnique({ where: { serviceId: serviceId, typeCode: typeCode, name: name } })
				.then((channel) => {
					if (channel) throw new ChannelException.Duplicated();
				});
		}

		return await prisma.channel.create({
			data: {
				serviceId: serviceId,
				id: UUID4().substring(0, 32),
				name: name,
				typeCode: typeCode,
			},
			select: DEFAULT_SELECT.channel,
		});
	},

	saveUserChannel: async (serviceId, userId, channelId) => {
		await ChannelController.getUserChannel(serviceId, userId, channelId)
			.then((userChannel) => {
				if (userChannel) throw new ChannelException.ExistChannelUser();
			})
			.catch((err) => {
				if (err instanceof ChannelException.NotChannelUser) return;
				else throw err;
			});

		return await prisma.userChannel.create({
			data: {
				serviceId: serviceId,
				userId: userId,
				channelId: channelId,
			},
			select: {
				channel: { select: DEFAULT_SELECT.channel },
				user: { select: DEFAULT_SELECT.user },
			},
		});
	},

	saveUserChannelsWithUsers: async (serviceId, channelId, USERS) => {
		let existUserIds = await prisma.userChannel.findMany({
			where: {
				serviceId: serviceId,
				channelId: channelId,
				userId: { in: USERS.map((user) => user.id) },
			},
			select: { userId: true },
		});

		if (existUserIds.length > 0) throw new ChannelException.ExistChannelUser();

		return await prisma.userChannel
			.createMany({
				data: USERS.map((user) => {
					return {
						serviceId: serviceId,
						channelId: channelId,
						userId: user.id,
					};
				}),
			})
			.finally(() => prisma.$disconnect());
	},

	saveUserChannelsWithChannels: async (serviceId, userId, CHANNELS) => {
		return await prisma.userChannel
			.createMany({
				data: CHANNELS.map((channel) => {
					return {
						serviceId: serviceId,
						userId: userId,
						channelId: channel.id,
					};
				}),
			})
			.finally(() => prisma.$disconnect());
	},

	updateUserChannelName: async (serviceId, userId, channelId, name) =>
		await prisma.userChannel
			.update({
				where: {
					UserChannelPK: {
						serviceId: serviceId,
						userId: userId,
						channelId: channelId,
					},
				},
				data: { name: name || null },
				select: DEFAULT_SELECT.userChannel,
			})
			.then((userChannel) => DEFAULT_SELECT.parseToChannel(userChannel)),

	updateUserChannelReadAt: async (serviceId, userId, channelId) =>
		await prisma.userChannel
			.update({
				where: {
					UserChannelPK: {
						serviceId: serviceId,
						userId: userId,
						channelId: channelId,
					},
				},
				data: { readAt: new Date() },
				select: DEFAULT_SELECT.userChannel,
			})
			.then((userChannel) => DEFAULT_SELECT.parseToChannel(userChannel)),

	// 삭제여부만 변경
	updateChannelDeleteYn: async (serviceId, channelId, deleteYn = true) =>
		await prisma.channel.update({
			where: { ChannelPK: { serviceId: serviceId, id: channelId } },
			data: { deleteYn: deleteYn },
		}),

	deleteChannel: async (serviceId, channelId) =>
		await prisma.channel.delete({
			where: { ChannelPK: { serviceId: serviceId, id: channelId } },
		}),

	deleteUserChannel: async (serviceId, userId, channelId) =>
		await prisma.userChannel
			.delete({
				where: {
					UserChannelPK: {
						serviceId: serviceId,
						userId: userId,
						channelId: channelId,
					},
				},
			})
			.finally(() => prisma.$disconnect()),
};

module.exports = ChannelController;
