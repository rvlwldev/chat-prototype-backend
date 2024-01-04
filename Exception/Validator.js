const prisma = require("../Utils/Prisma");

const ServiceException = require("./Service/ServiceException");
const UserException = require("./User/UserException");
const ChannelException = require("./Chat/ChannelException");
const MessageException = require("./Chat/MessageException");
const UserController = require("../Controller/User");
const Exception = require("./Exception");
const ServiceController = require("../Controller/Service");
const { HttpStatusCode } = require("axios");

const Validator = {
	header: {},

	body: {
		serviceId: async (req, res, next) =>
			await prisma.service
				.findUniqueOrThrow({ where: { id: req.body.serviceId } })
				.then(() => next())
				.catch(() => next(new ServiceException.NotFound())),

		userId: async (req, res, next) =>
			await prisma.user
				.findUniqueOrThrow({
					where: { serviceId: req.body.serviceId, id: req.body.userId },
				})
				.then(() => next())
				.catch(() => next(new UserException.NotFound())),

		roleCode: async (req, res, next) =>
			await prisma.role
				.findUniqueOrThrow({
					where: { code: req.body.roleCode },
				})
				.then(() => next())
				.catch(() =>
					next(
						new Exception(
							"올바르지 않은 정보입니다.(roleCode)",
							HttpStatusCode.BadRequest
						)
					)
				),

		channelId: async (req, res, next) =>
			await prisma.channel
				.findUniqueOrThrow({
					where: { ChannelPK: { serviceId: req.body.serviceId, id: req.body.channelId } },
				})
				.then(() => next())
				.catch(() => next(new ChannelException.NotFound())),

		messageId: async (req, res, next) => {
			next();
		},
	},

	params: {
		userId: async (req, res, next) =>
			await prisma.user
				.findUniqueOrThrow({
					where: { ServiceUserId: { serviceId: req.service.id, id: req.body.userId } },
				})
				.then(() => next())
				.catch(() => next(new UserException.NotFound())),

		channelId: async (req, res, next) =>
			await prisma.channel
				.findUniqueOrThrow({
					where: { ChannelPK: { serviceId: req.service.id, id: req.params.channelId } },
				})
				.then(() => next())
				.catch(() => next(new ChannelException.NotFound())),

		userChannelId: async (req, res, next) =>
			await prisma.userChannel
				.findUniqueOrThrow({
					where: {
						UserChannelPK: {
							serviceId: req.service.id,
							userId: req.user.id,
							channelId: req.params.channelId,
						},
					},
				})
				.then(() => next())
				.catch(() => next(new ChannelException.NotAllowed())),

		messageId: async (req, res, next) => {
			next();
		},
	},
};

module.exports = Validator;
