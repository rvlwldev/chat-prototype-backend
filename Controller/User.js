const prisma = require("../Utils/Prisma");
const bcrypt = require("bcrypt");

const JWT = require("../Utils/JWT");
const SALT_ROUND = 10;

const UserExceptions = require("../Exception/UserException");

const UserController = {
	createUser: async (SERVICE, id, password, name, role) => {
		if (role >= 9) throw new UserExceptions.InvalidRole();

		const USER = await UserController.getUser(SERVICE, id)
			.then((user) => !!user)
			.catch((err) => {
				if (err instanceof UserExceptions.NotFound) return null;
				else throw new Error(err);
			});

		if (USER) throw new UserExceptions.Duplicated();

		return await prisma.user
			.create({
				data: {
					serviceId: SERVICE.id,
					id: id,
					password: bcrypt.hashSync(password, SALT_ROUND),
					name: name,
					role: role,
				},
				select: {
					id: true,
					name: true,
					role: true,
					password: false,
				},
			})
			.finally(() => prisma.$disconnect());
	},

	getUser: async (SERVICE, userId) =>
		await prisma.user
			.findUniqueOrThrow({
				where: { service: SERVICE, id: userId },
				select: {
					serviceId: true,
					id: true,
					name: true,
					role: true,
					profileUserImageUrl: true,
				},
			})
			.catch((err) => {
				throw new UserExceptions.NotFound();
			})
			.finally(() => prisma.$disconnect()),

	getUsers: async (SERVICE, userIdArray) => {
		await prisma.user
			.findMany({
				where: {
					service: SERVICE,
					id: { in: userIdArray },
				},
			})
			.finally(() => prisma.$disconnect());
	},

	getUsersByService: async (SERVICE) =>
		await prisma.user.findMany({ where: { service: SERVICE } }),

	getUsersByChannel: async (SERVICE, CHANNEL) =>
		await prisma.userChannel
			.findMany({
				where: {
					service: SERVICE,
					channel: CHANNEL,
				},
				select: { user: true },
			})
			.finally(() => prisma.$disconnect()),

	getToken: async (SERVICE, USER, inputPW) => {
		const PASSWORD = await prisma.user
			.findUnique({ where: { service: SERVICE, id: USER.id } })
			.then((user) => user.password)
			.catch(() => {
				throw new UserExceptions.NotFound();
			})
			.finally(() => prisma.$disconnect());

		if (!bcrypt.compareSync(inputPW, PASSWORD)) throw new UserExceptions.InvalidPassword();

		return JWT.generate(SERVICE, USER);
	},
};

module.exports = UserController;
