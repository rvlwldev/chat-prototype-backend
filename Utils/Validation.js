const ServiceException = require("../Exception/Service/ServiceException");
const UserException = require("../Exception/User/UserException");
const ChannelException = require("../Exception/Chat/ChannelException");
const MessageException = require("../Exception/Chat/MessageException");
const UserController = require("../Controller/User");
const Exception = require("../Exception/Exception");

const Validator = {
	header: {
		token: async (req, res, next) => {
			const { serviceId, userId } = req;

			if (!!!serviceId) throw new ServiceException.NotFound();
			if (!!!userId) throw new UserException.NotFound();

			next();
		},
	},

	body: {
		userId: async (req, res, next) => {
			console.log("body");
			next();
		},

		roleCode: async (req, res, next) => {},
		serviceId: async (req, res, next) => {},
		channelId: async (req, res, next) => {},
	},

	param: {
		userId: async (req, res, next) => {
			console.log("body");
			next();
		},
		service: (req, res, next) => {},
		channel: (req, res, next) => {},
		message: (req, res, next) => {},
	},
};

module.exports = Validator;
