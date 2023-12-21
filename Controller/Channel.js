const prisma = require("../Utils/Prisma");

const ServiceController = require("./Service");
const UserController = require("./User");

const { v4: uuidv4 } = require("uuid");

const ChannelController = {
	getChannelsByUserId: async (serviceId, userId) =>
		await prisma.userChannel
			.findMany({
				where: {
					Service: await ServiceController.getService(serviceId),
					user: await UserController.getUser(serviceId, userId),
				},
				include: { channel: true },
			})
			.then((userChannels) => userChannels.map((userChannel) => userChannel.channel))
			.finally(() => prisma.$disconnect()),

	// TODO : 채널타입 모델링
	saveChannel: async (serviceId, type, name, createUserId) => {
		return await prisma.channel
			.create({
				data: {
					service: await prisma.service.findUnique({ where: { id: serviceId } }),
					user: await prisma.user.findUnique(createUserId),

					id: uuidv4(),
					type: type,
					name: name,
				},
			})
			.catch((err) => {
				throw err;
			})
			.finally(() => prisma.$disconnect());
	},
};

module.exports = ChannelController;
