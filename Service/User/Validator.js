const UserNotFoundException = require("../../Exception/User/UserNotFound");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const ChannelService = require("../Chat/Channel");
const channelQuery = require("../../Database/Query/ChannelQuery");

const UserService = require("./User");
const userQuery = require("../../Database/Query/UserQuery");

const SUPER_PUBLIC_CHANNEL_ADMIN_ID = "47e2beb243c5bb9c";
const SUPER_PUBLIC_CHANNEL_MAP = new Map([
	["FIRST_TEST_OPEN_CHAT_CHANNEL01", "테스트 전체 공개 채팅방01"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL02", "테스트 전체 공개 채팅방02"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL03", "테스트 전체 공개 채팅방03"],
]);

const UserValidator = {
	// TODO : 퍼블릭 채널 참여 검사

	validate: async (userId, username) => {
		var USER_INFO = {};

		try {
			USER_INFO = await UserService.getUserById(userId);
		} catch (error) {
			if (error instanceof UserNotFoundException) {
				let temp = await userQuery.selectFromIntranet(userId).then((res) => res[0]);

				if (temp.admin_check != "1")
					throw new Error("가입 승인이 되지 않았습니다. 완료 후 로그인 가능합니다.");

				USER_INFO.id = temp.id;
				USER_INFO.name = temp.name;

				await userQuery.insert(USER_INFO.id, USER_INFO.name);
			}
		}

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
		.catch((err) => {
			if (err.code == "3003") {
				return false;
			} else {
				throw new Error(err.message);
			}
		});
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
				await ChannelService.saveChannel(
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

	let count = await ChannelService.getAllUserChannels(userId).then(toCount);

	if (SUPER_PUBLIC_CHANNEL_MAP.size != count)
		for (const [channelId] of SUPER_PUBLIC_CHANNEL_MAP.entries())
			await ChannelService.joinChannel(channelId, userId);
}

module.exports = UserValidator;
