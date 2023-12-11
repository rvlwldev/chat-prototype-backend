const userQuery = require("../../Database/Query/UserQuery");
const channelQuery = require("../../Database/Query/ChannelQuery");
const messageQuery = require("../../Database/Query/MessageQuery");

const SearchService = {
	findAllUserByName: async (userId, text) => {
		return await userQuery.searchByName(userId, text);
	},

	findAllChannelsByName: async (userId, text) => {
		return await channelQuery.searchChannelsByUserId(userId, text);
	},

	findAllMessagesByText: async (userId, text) => {
		return await messageQuery.searchByUserId(userId, text);
	},
};

module.exports = SearchService;
