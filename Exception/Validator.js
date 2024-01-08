const prisma = require("../Utils/Prisma");

const ServiceController = require("../Controller/Service");
const UserController = require("../Controller/User");

const ServiceException = require("./Service/ServiceException");
const UserException = require("./User/UserException");
const ChannelException = require("./Chat/ChannelException");
const MessageException = require("./Chat/MessageException");

const { HttpStatusCode } = require("axios");
const Exception = require("./Exception");

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
			const catchErr = (err) =>
				err instanceof Exception ? next(err) : next(new MessageException.NotFound());

			if (!!req.body.parentId)
				await prisma.message
					.findUniqueOrThrow({ where: { id: req.body.parentId } })
					.catch(catchErr);

			await prisma.message
				.findUniqueOrThrow({ where: { id: req.body.messageId } })
				.then((message) => {
					if (!!message.deletedAt) throw new MessageException.Deleted();
				})
				.then(() => next())
				.catch(catchErr);
		},

		messageText: async (req, res, next) => {
			if (!!!req.body.text) {
				next(new MessageException.MissingRequiredValues());
			} else if (!req.body.text instanceof String) {
				next(new MessageException.MissingRequiredValues()); // TODO : 이상한 값 예외 추가
			} else next();
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

		messageId: async (req, res, next) =>
			await prisma.message
				.findUniqueOrThrow({ where: { id: req.params.messageId } })
				.then((message) => {
					if (!!message.deletedAt) throw new MessageException.Deleted();
				})
				.then(() => next())
				.catch((err) => {
					if (err instanceof Exception) next(err);
					else next(new MessageException.NotFound());
				}),
	},
};

module.exports = Validator;
