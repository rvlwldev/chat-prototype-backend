const UserNotFoundException = require("../../Exception/User/UserNotFound");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = require("../Chat/Channel");
const channelQuery = require("../../Database/Query/ChannelQuery");

const userQuery = require("../../Database/Query/UserQuery");

const SUPER_PUBLIC_CHANNEL_ADMIN_ID = "47e2beb243c5bb9c";
const SUPER_PUBLIC_CHANNEL_MAP = new Map([
	["FIRST_TEST_OPEN_CHAT_CHANNEL01", "테스트 전체 공개 채팅방01"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL02", "테스트 전체 공개 채팅방02"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL03", "테스트 전체 공개 채팅방03"],
]);

const UserService = {
	validate: async (userId, username) => {
		await checkPublicChannels();

		const USER_INFO = await userQuery
			.selectByUserId(userId)
			.then((result) => (result.length == 1 ? result[0] : null))
			.then(async (result) => result ?? (await userQuery.insert(userId, username, null)))
			.then(async (result) => {
				if (result) return await userQuery.selectByUserId(userId).then((res) => res[0]);
			});

		if (!USER_INFO.length != 1) throw new UserNotFoundException();

		let isUserIdExistOnExAPI = await isExistUserOnExAPI(userId);
		if (!isUserIdExistOnExAPI) await createAndGetUserOnExAPI(userId, USER_INFO.name);

		await checkUserOnPublicChannels(userId);

		return true;
	},
};

async function isExistUserOnExAPI(userId) {
	return exAPI
		.get(`/users${userId}`)
		.then((res) => !!res.user)
		.catch((err) => false);
}

async function createAndGetUserOnExAPI(userId, username) {
	return await exAPI
		.post("users/create", { userId: userId, password: userId, username: username })
		.then((response) => response.user);
}

async function checkPublicChannels() {
	try {
		let count = await channelQuery.selectSuperPublicChannels().then((res) => res.length);

		if (SUPER_PUBLIC_CHANNEL_MAP.size != count) {
			for (const [channelId, channelName] of SUPER_PUBLIC_CHANNEL_MAP.entries())
				await ChannelService.createChannel(
					channelId,
					channelName,
					"super_public",
					SUPER_PUBLIC_CHANNEL_ADMIN_ID
				);
		}
	} catch (err) {
		if (err instanceof UserNotFoundException) {
			let adminInfo = await userQuery
				.selectByUserId(SUPER_PUBLIC_CHANNEL_ADMIN_ID)
				.then((result) => (result.length > 0 ? result[0] : []));

			createAndGetUserOnExAPI(SUPER_PUBLIC_CHANNEL_ADMIN_ID, adminInfo.name);
			checkPublicChannels();
		} else throw new Error(err);
	}
}

async function checkUserOnPublicChannels(userId) {
	const toCount = (channels) => channels.map((channel) => channel.type == "super_public").length;

	let count = await ChannelService.getUserChannelsByUserId(userId).then(toCount);

	if (SUPER_PUBLIC_CHANNEL_MAP.size != count)
		for (const [channelId] of SUPER_PUBLIC_CHANNEL_MAP.entries())
			await ChannelService.joinChannel(channelId, userId);
}

module.exports = UserService;
