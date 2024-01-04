const prisma = require("../Utils/Prisma");
const { v4: UUID4 } = require("uuid");

const ServiceException = require("../Exception/Service/ServiceException");

const ServiceController = {
	authenticate: async (req, res, next) => {
		if (req.USER.roleCode != 99) throw new ServiceException.AccessDenied();
		next();
	},

	saveService: async (USER, name, id) => {
		if (!id) id = UUID4();
		if (!name) throw new ServiceException.MissingRequiredValues();

		return await prisma.service
			.findFirst({ where: { id: id } })
			.then((service) => {
				if (service) throw new ServiceException.Duplicated();
			})
			.then(async () => {
				return await prisma.service.create({
					data: { id: id, name: name, users: [USER] },
					select: { id: true, name: true },
				});
			})
			.finally(() => prisma.$disconnect());
	},

	getServiceById: async (serviceId) =>
		await prisma.service.findUnique({ where: { id: serviceId } }).then((service) => {
			if (!!!service) throw new ServiceException.NotFound();
			return service;
		}),

	getAllService: async () => await prisma.service.findMany({ select: { id: true, name: true } }),
};

module.exports = ServiceController;
