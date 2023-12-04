const channelQuery = require("../../Database/Query/ChannelQuery");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = {
	getUserChannelsByUserId: async (userId) => {
		return await channelQuery.selectChannelsByUserId(userId);
	},

	getChannelInfo: async (channelId) => {
		let result = await channelQuery.selectChannel(channelId);

		if (result.length < 1) return "Not Found";

		return result[0];
	},
};

module.exports = ChannelService;
