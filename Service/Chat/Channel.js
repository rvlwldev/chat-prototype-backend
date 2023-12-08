const ChannelNotFoundException = require("../../Exception/Channel/ChannelNotFound");
const UserNotFoundException = require("../../Exception/User/UserNotFound");

const channelQuery = require("../../Database/Query/ChannelQuery");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

// TODO : 채널검색
const ChannelService = {
	getChannelById: async (channelId) => await channelQuery.selectChannelById(channelId),

	getAllUserChannels: async (userId) => await channelQuery.selectChannelsByUserId(userId),

	getAllUserChannelsByType: async (userId, type) =>
		await channelQuery
			.selectChannelsByUserId(userId)
			.then((result) => result.filter((row) => row.type == type)),

	saveChannel: async (id, name, type) => await channelQuery.mergeChannel(id, name, type),

	joinChannel: async (channelId, userId) =>
		await channelQuery.mergeUserChannels(channelId, userId),

	saveChannelOnExAPI: async (id, name, type, ownerId) => {
		let body = {
			channelId: id,
			name: name,
			type: type,
			category: type,
			ownerId: ownerId,
		};

		return await exAPI.post("channels/create", body).then(async (res) => {
			if (res.error) {
				if (res.code == "2000" || res.code == "3003") throw new UserNotFoundException();
			} else return !!res.channel;
		});
	},

	joinChannelOnExAPI: async (channelId, userId) => {
		let requestURL = `channels/${channelId}/members/add`;
		let body = { members: [userId] };

		return await exAPI.post(requestURL, body).then((result) => {
			if (result.error) {
				if (result.code == "2003") throw new ChannelNotFoundException(channelId);
				else throw new Error(result.message);
			} else return true;
		});
	},
};

module.exports = ChannelService;
