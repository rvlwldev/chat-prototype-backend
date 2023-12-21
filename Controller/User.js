const prisma = require("../Utils/Prisma");

const bcrypt = require("bcrypt");

const SALT_ROUND = 10;

const UserNotFoundException = require("../Exception/User/UserNotFound");
const JWT = require("../Utils/JWT");
const ServiceController = require("./Service");

// TODO : User Exception 나누기
const UserController = {
	createUser: async (serviceId, id, password, name, role) => {
		if (role == 99) {
			throw new Error("관리자 계정은 생성할 수 없습니다.");
		} else if (await UserController.getUser(serviceId, id)) {
			throw new Error("중복된 아이디 입니다.");
		}

		return await prisma.user
			.create({
				data: {
					serviceId: serviceId,
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

	getUser: async (serviceId, userId) => {
		const SERVICE = await ServiceController.getService(serviceId);

		await prisma.user
			.findUnique({
				where: {
					service: SERVICE,
					id: userId,
				},
			})
			.then((user) => user)
			.catch((err) => {
				throw err;
			})
			.finally(() => prisma.$disconnect());
	},

	getToken: async (serviceId, userId, inputPW) => {
		const USERINFO = await prisma.user
			.findUnique({ where: { serviceId: serviceId, id: userId } })
			.catch(() => null);
		if (!USERINFO) throw new UserNotFoundException();

		const PW_MATCH = bcrypt.compareSync(inputPW, USERINFO.password);
		if (!PW_MATCH) throw new Error("비밀번호가 틀렸음");

		const { password, ...USER } = USERINFO;

		return {
			service: await prisma.service
				.findUnique({ where: { id: serviceId } })
				.finally(() => prisma.$disconnect()),
			user: USER,
			token: JWT.generate(USER),
		};
	},
};

module.exports = UserController;
