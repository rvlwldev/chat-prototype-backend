const prisma = require("../Utils/Prisma");
const bcrypt = require("bcrypt");

const JWT = require("../Utils/JWT");
const SALT_ROUND = 10;

const UserException = require("../Exception/User/UserException");

// TODO : 모든경로에서 serviceId로 파라미터로 받기
const UserController = {
	createUser: async (serviceId, id, password, name, roleCode) => {
		if (roleCode >= 9) throw new UserException.InvalidRole();
		if (!!!name || !!!password) throw new UserException.MissingRequiredValues();

		await prisma.user.findUnique({ where: { serviceId: serviceId, id: id } }).then((user) => {
			if (!!user) throw new UserException.Duplicated();
		});

		return await prisma.user
			.create({
				data: {
					serviceId: serviceId,
					id: id,
					password: bcrypt.hashSync(password, SALT_ROUND),
					name: name,
					roleCode: roleCode,
					createdAt: new Date(),
				},
				select: {
					id: true,
					name: true,
					roleCode: true,
					createdAt: true,
				},
			})
			.finally(() => prisma.$disconnect());
	},

	getUser: async (serviceId, userId) =>
		await prisma.user
			.findUnique({
				where: { serviceId: serviceId, id: userId },
				select: {
					id: true,
					name: true,
					roleCode: true,
					profileUserImageUrl: true,
				},
			})
			.then((user) => {
				if (!user) throw new UserException.NotFound();
				return user;
			})
			.finally(() => prisma.$disconnect()),

	getUsers: async (serviceId, userIdArray = []) =>
		await prisma.user
			.findMany({
				where: {
					serviceId: serviceId,
					id: { in: userIdArray },
				},
				select: {
					serviceId: true,
					id: true,
					name: true,
					roleCode: true,
					profileUserImageUrl: true,
				},
			})
			.then((users) => {
				if (userIdArray.length != users.length) throw new UserException.InvalidUserInfo();
				return users;
			})
			.finally(() => prisma.$disconnect()),

	getUsersByServiceId: async (serviceId) =>
		await prisma.user.findMany({
			where: { serviceId: serviceId },
			select: {
				id: true,
				name: true,
				profileUserImageUrl: true,
				roleCode: true,
			},
		}),

	getUsersByChannelId: async (serviceId, channelId) =>
		await prisma.userChannel
			.findMany({
				where: {
					serviceId: serviceId,
					channelId: channelId,
				},
				select: {
					user: {
						select: {
							id: true,
							name: true,
							profileUserImageUrl: true,
							roleCode: true,
						},
					},
				},
			})
			.then((res) => res.map((users) => users.user))
			.finally(() => prisma.$disconnect()),

	getToken: async (serviceId, userId, inputPW) => {
		const PASSWORD = await prisma.user
			.findUnique({ where: { serviceId: serviceId, id: userId } })
			.then((user) => {
				if (!user) throw new UserException.NotFound();
				return user.password;
			});

		if (!bcrypt.compareSync(inputPW, PASSWORD)) throw new UserException.InvalidPassword();

		return JWT.generate(serviceId, userId);
	},
};

module.exports = UserController;
