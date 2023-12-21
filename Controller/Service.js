const prisma = require("../Utils/Prisma");

const ServiceController = {
	getService: async (serviceId) =>
		await prisma.service.findUniqueOrThrow({ where: { id: serviceId } }).catch((err) => {
			throw new Error("찾을 수 없는 서비스");
		}),
};

module.exports = ServiceController;
