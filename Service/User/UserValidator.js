const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const userQuery = require("../../Database/Query/UserQuery");
const channelQuery = require("../../Database/Query/ChannelQuery");

const ADMIN_ID = "47e2beb243c5bb9c";
const PUBLIC_CHANNEL_MAP = new Map([
	["FIRST_TEST_OPEN_CHAT_CHANNEL01", "테스트 전체 공개 채팅방01"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL02", "테스트 전체 공개 채팅방02"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL03", "테스트 전체 공개 채팅방03"],
]);

const UserService = {
	validateUserById: async (userId) => {
		try {
			let userinfo = await userQuery.selectByUserId(userId).then((result) => result[0]);

			await exAPI
				.get(`users/${userId}`)
				.then((response) => response.user)
				.catch(async (err) => {
					console.log(err);
					if (err.code == "3003")
						return UserService.createUserOnExAPI(userId, userinfo.name);
					else throw new Error("talkplus error");
				});

			await UserService.checkUserOnPublicChannels(userId);
			await UserService.joinPublicChannels(userId);

			return true;
		} catch (err) {
			console.log(err);
		}
	},

	createAndGetUserOnExAPI: async (userId, username) => {
		await exAPI
			.post("users/create", { userId: userId, password: userId, username: username })
			.then((response) => response.user);
	},

	checkUserOnPublicChannels: async (userId) => {
		let count = await channelQuery.countAllPublicChannelsWithUserId(userId);
		if (count == PUBLIC_CHANNEL_MAP.keys.length) return true;

		try {
			for (const [ID, NAME] of PUBLIC_CHANNEL_MAP.entries())
				channelQuery.mergeUserChannels(ID, NAME, "super_public", userId);

			return true;
		} catch (err) {
			throw new Error(err.message);
		}
	},

	joinPublicChannels: async (userId) => {
		for (const [ID, NAME] of PUBLIC_CHANNEL_MAP.entries()) {
			await exAPI.post(`channels/${ID}/members/add`, { members: [userId] }).catch((err) => {
				throw new Error(err.message);
			});
		}
	},
};

module.exports = UserService;
