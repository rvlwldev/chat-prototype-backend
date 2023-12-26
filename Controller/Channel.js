const { channel } = require("diagnostics_channel");
const ChannelException = require("../Exception/ChannelException");
const prisma = require("../Utils/Prisma");

const ServiceController = require("./Service");
const UserController = require("./User");

const { v4: uuidv4 } = require("uuid");

// TODO : param 수정
const ChannelController = {
	getChannelById: async (channelId) =>
		await prisma.channel
			.findUnique({ where: { id: channelId } })
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
			.finally(() => prisma.$disconnect()),

	saveChannel: async (SERVICE, USER, type, name) => {
		// TODO : 채널타입 모델링
		if (type.includes("public")) {
			if (USER.role.id < 9) throw new ChannelException.NotAllowed();
			else if (!name) throw new ChannelException.NameRequired();

			let where = { serviceId: USER.serviceId, type: type, name: name };
			await prisma.channel.findFirst({ where: where }).then((channel) => {
				if (channel) throw new ChannelException.Duplicated();
			});
		}

		let channelId = uuidv4().substring(0, 12);

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

	saveUserChannel: async (SERVICE, CHANNEL, USER) =>
		await prisma.userChannel
			.create({
				data: {
					service: SERVICE,
					channel: CHANNEL,
					user: USER,
				},
			})
			.catch((err) => {
				console.log("saveUserChannel ERROR");
				console.log(err);
			})
			.finally(() => prisma.$disconnect()),

	saveUserChannels: async (SERVICE, CHANNEL, USERS) =>
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
