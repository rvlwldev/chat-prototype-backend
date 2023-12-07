const DATABASE = require("../../Database/Database");
const channelQuery = require("../../Database/Query/ChannelQuery");
const UserNotFoundException = require("../../Exception/User/UserNotFound");

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

	createChannel: async (id, name, type, ownerId) => {
		let body = {
			channelId: id,
			name: name,
			type: type,
			category: type,
			ownerId: ownerId,
		};

		return await exAPI.post("channels/create", body).then(async (res) => {
			if (res.error) {
				switch (res.code) {
					case "2000":
						throw new UserNotFoundException(res.message);
					case "2002":
						await channelQuery.mergeChannel(body.channelId, body.name, body.type);
						return await channelQuery.selectChannel(body.channelId);
				}
			} else {
				await channelQuery.mergeChannel(res.channel.id, res.channel.name, res.channel.type);
				return await channelQuery.selectChannel(res.channel.id);
			}
		});
	},

	joinChannel: async (channelId, userId) => {
		let requestURL = `channels/${channelId}/members/add`;
		let body = { members: [userId] };

		await exAPI
			.post(requestURL, body)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
				throw new Error(err.message);
			});

		await channelQuery.mergeUserChannels(channelId, userId);
	},
};

module.exports = ChannelService;
