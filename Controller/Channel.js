const prisma = require("../Utils/Prisma");

const ServiceController = require("./Service");
const UserController = require("./User");

const ChannelController = {
	getChannelsByUserId: async (serviceId, userId) => {
		const SERVICE = await ServiceController.getService(serviceId);
		const USER = await UserController.getUser(serviceId, userId);

		const USER_CHANNELS = await prisma.userChannel
			.findMany({
				where: {
					Service: SERVICE,
					user: USER,
				},
				include: { channel: true },
			})
			.finally(() => prisma.$disconnect());

		return USER_CHANNELS.map((userChannel) => userChannel.channel);
	},
};

module.exports = ChannelController;
