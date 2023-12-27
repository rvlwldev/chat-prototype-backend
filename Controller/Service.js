const prisma = require("../Utils/Prisma");
const { v4: UUID4 } = require("uuid");

const ServiceException = require("../Exception/ServiceException");

const ServiceController = {
	authenticate: async (req, res, next) => {
		if (req.USER.roleCode != 99) throw new ServiceException.AccessDenied();
		next();
	},

	saveService: async (USER, name, id) => {
		if (!id) id = UUID4();
		if (!name) throw new ServiceException.MissingRequiredValues();

		await prisma.service.findFirst({ where: { id: id } }).then((service) => {
			if (service) throw new ServiceException.Duplicated();
		});

		return await prisma.service
			.create({
				data: { id: id, name: name, users: [USER] },
				select: { id: true, name: true },
			})
			.finally(() => prisma.$disconnect());
	},

	getService: async (serviceId) =>
		await prisma.service
			.findUnique({
				where: { id: serviceId },
				select: { channels: true },
			})
			.catch((err) => {
				// TODO : Prisma 에러 상수화
				if (err.code == "P2001") throw new ServiceException.NotFound();
			}),

	getAllService: async () => await prisma.service.findMany({ select: { id: true, name: true } }),
};

module.exports = ServiceController;
