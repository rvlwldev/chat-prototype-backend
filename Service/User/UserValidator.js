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

const UserValidateService = {
	checkUserInfo: async (USER_ID) => {
		const USERINFO = await exAPI
			.get(`users/${USER_ID}`)
			.then((response) => response.user)
			.catch((err) => {
				if (err.code == "3003") return null;
			});

		if (!USERINFO) {
			let selectedUserInfo = await userQuery.selectByUserId(USER_ID, "cupg")[0];
			if (!selectedUserInfo) return false;

			await exAPI.post("users/create", {
				userId: USER_ID,
				password: USER_ID,
				username: selectedUserInfo.name,
			});
		}

		await userQuery.insert(USERINFO);

		return true;
	},

	checkPublicChannels: async (USER_ID) => {
		const selectedChannels = await channelQuery.selectPublicChannels();
		validatePublicChannelsByMap(selectedChannels, USER_ID);

		let ApiChannels = await getPublicChannelsFromExternalAPI().then((res) =>
			res.map((channel) => {
				return {
					id: channel.id,
					name: channel.name,
					type: channel.type,
				};
			})
		);

		return syncronizePublicChannels(ApiChannels, selectedChannels, USER_ID);
	},
};

async function validatePublicChannelsByMap(selectedChannels, USER_ID) {
	for (const [ID, NAME] of PUBLIC_CHANNEL_MAP.entries()) {
		if (!selectedChannels.find((selectedChannel) => selectedChannel.ID === ID))
			channelQuery.merge(ID, NAME, "super_public", USER_ID);
	}
}

async function getPublicChannelsFromExternalAPI(hasNext = true, channelArray = [], lastChannelId) {
	if (!hasNext) return channelArray;

	let requestURL = "channels?limit=100&category=super_public";
	if (lastChannelId) requestURL += `&lastChannelId=${lastChannelId}`;

	let response = await exAPI.get(requestURL).then((response) => response);
	let channels = response.channels;

	channelArray.push(...channels);

	if (channels.length > 0) lastChannelId = channels[channels.length - 1].id;

	return getPublicChannelsFromExternalAPI(response.hasNext, channelArray, lastChannelId);
}

async function syncronizePublicChannels(API_CHANNELS, DB_CHANNELS, USER_ID) {
	try {
		DB_CHANNELS.forEach(async (selectedChannel) => {
			let isMatched = API_CHANNELS.find((ApiChannel) => ApiChannel.ID === selectedChannel.ID);

			if (!isMatched) {
				await exAPI.post("channels/create", {
					channelId: selectedChannel.id,
					name: selectedChannel.name,
					type: "super_public",
					category: "super_public",
					ownerId: ADMIN_ID,
					members: [USER_ID],
				});
			}
		});

		API_CHANNELS.forEach(async (ApiChannel) => {
			let isMatched = API_CHANNELS.find((dbChannel) => dbChannel.ID === ApiChannel.ID);
			if (!isMatched)
				await channelQuery.merge(ApiChannel.ID, ApiChannel.NAME, ApiChannel.TYPE, USER_ID);
		});

		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
}

module.exports = UserValidateService;
