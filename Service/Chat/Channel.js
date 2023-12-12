const ChannelNotFoundException = require("../../Exception/Channel/ChannelNotFound");
const UserNotFoundException = require("../../Exception/User/UserNotFound");

const channelQuery = require("../../Database/Query/ChannelQuery");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

// TODO : 채널검색 (retrieve? search?)
const ChannelService = {
	createChannel: async (id, name, type) => {
		return await channelQuery.mergeChannel(id, name, type);
	},

	getChannelById: async (channelId) => {
		return await channelQuery.selectChannelById(channelId);
	},

	getChannelsByUserId: async (userId) => {
		return await channelQuery.selectChannelsByUserId(userId);
	},

	getChannelsByUserIdAndType: async (userId, type) => {
		return await channelQuery
			.selectChannelsByUserId(userId)
			.then((result) => result.filter((row) => row.type == type));
	},

	addUserToChannel: async (channelId, userId) => {
		await channelQuery.mergeUserChannels(channelId, userId);
	},

	EX_API: {
		saveChannel: async (id, name, type, ownerId) => {
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
				}

				return !!res.channel;
			});
		},

		addUserToChannel: async (channelId, userId) => {
			let requestURL = `channels/${channelId}/members/add`;
			let body = { members: [userId] };

			return await exAPI.post(requestURL, body).then((result) => {
				if (result.error) {
					if (result.code == "2003") throw new ChannelNotFoundException(channelId);
					else throw new Error(result.message);
				} else return true;
			});
		},
	},
};

module.exports = ChannelService;
