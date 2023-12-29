const ChannelException = require("../Exception/Chat/ChannelException");
const prisma = require("../Utils/Prisma");

const { v4: UUID4 } = require("uuid");

// TODO : 모든경로에서 service, channelId 모두 파라미터로 받기, 메소드 재사용으로 코드 줄이기
const ChannelController = {
	getChannelById: async (SERVICE, channelId) =>
		await prisma.channel
			.findUnique({ where: { service: SERVICE, id: channelId } })
			.catch((err) => {
				if (err.code == "P2020") throw new ChannelException.NotFound();
			})
			.finally(() => prisma.$disconnect()),

	getChannelsByUser: async (SERVICE, USER) =>
		await prisma.userChannel
			.findMany({
				where: { Service: SERVICE, user: USER },
				select: { channel: true },
			})
			.catch((err) => {
				if (err.code == "P2001") throw new ChannelException.NotFound();
			})
			.finally(() => prisma.$disconnect()),

	saveChannel: async (SERVICE, USER, type, name) => {
		if (type.includes("public")) {
			if (USER.role.id < 9) throw new ChannelException.NotAllowed();
			else if (!name) throw new ChannelException.NameRequired();

			let where = { serviceId: USER.serviceId, type: type, name: name };
			await prisma.channel.findFirst({ where: where }).then((channel) => {
				if (channel) throw new ChannelException.Duplicated();
			});
		}

		let channelId = UUID4().substring(0, 12);

		const newChannel = await prisma.channel.create({
			data: {
				service: SERVICE,
				id: channelId,
				name: name,
				type: type,
			},
			select: {
				service: false,
				id: true,
				name: true,
				type: true,
			},
		});

		await prisma.userChannel.create({ data: { channel: newChannel, user: USER } });

		return newChannel;
	},

	saveUserChannel: async (SERVICE, USER, CHANNEL) =>
		await prisma.userChannel
			.create({
				data: { service: SERVICE, channel: CHANNEL, user: USER },
				select: { channel: true, user: true },
			})
			.catch((err) => {
				console.log("saveUserChannel ERROR");
				console.log(err);
			})
			.finally(() => prisma.$disconnect()),

	saveUserChannels: async (SERVICE, USERS, CHANNEL) =>
		await prisma.userChannel
			.createMany({
				data: USERS.map((USER) => {
					return {
						serviceId: SERVICE.id,
						channelId: CHANNEL.id,
						userId: USER.id,
					};
				}),
			})
			.finally(() => prisma.$disconnect()),

	updateChannel: async (SERVICE, CHANNEL, data) =>
		await prisma.channel.update({
			where: { service: SERVICE, id: CHANNEL.id },
			data: data,
			select: {
				service: false,
				id: true,
				name: true,
				type: true,
			},
		}),

	updateChannelName: async (SERVICE, CHANNEL, name) =>
		await prisma.channel.update({
			where: { service: SERVICE, id: CHANNEL.id },
			data: { name: name },
			select: {
				service: false,
				id: true,
				name: true,
				type: true,
			},
		}),

	updateUserChannel: async (SERVICE, CHANNEL, data) =>
		await prisma.userChannel.update({
			where: { service: SERVICE, id: CHANNEL.id },
			data: data,
			select: {
				service: false,
				channel: true,
				user: true,
				readAt: true,
			},
		}),

	deleteChannel: async (SERVICE, USER, channelId) => {
		const CHANNEL = await prisma.channel
			.findUnique({
				where: { service: SERVICE, id: channelId },
			})
			.catch(async (err) => {
				await prisma.$disconnect();
				if (err.code == "P2020") throw new ChannelException.NotFound();
				throw err;
			});

		if (CHANNEL.type.includes("public") && USER.role.id < 9)
			throw new ChannelException.NotAllowed();

		await prisma.channel.delete({ where: { service: SERVICE, id: channelId } });

		return await prisma.channel.delete({ where: { service: SERVICE, id: CHANNEL } });
	},
};

module.exports = ChannelController;
