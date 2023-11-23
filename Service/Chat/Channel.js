const channelQuery = require("../../Database/Query/ChannelQuery");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = {
	getUserChannelIdArray: async (userId) => {
		const getAllChannels = async (channels = [], lastChannelId) => {
			let query = lastChannelId ? `?lastChannelId=${lastChannelId}` : ``;

			const response = await exAPI.get(`channels${query}`).then((res) => res);
			const currentChannels = response.channels;

			channels = channels.concat(currentChannels);

			if (response.hasNext) {
				lastChannelId = currentChannels[currentChannels.length - 1].id;
				return await getAllChannels(channels, response.lastChannelId);
			} else return channels;
		};

		/** @type Array */
		let channelIdArray = await channelQuery
			.selectChannelsByUserId(userId)
			.then((idArray) => idArray.map((obj) => obj.channelId));

		/** @type Array */
		let channels = await getAllChannels();

		return channels.filter((channel) => channelIdArray.includes(channel.id));
	},
};

module.exports = ChannelService;
