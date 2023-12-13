const UserNotFoundException = require("../../Exception/User/UserNotFound");

const UserService = require("../User/User");
const ChannelService = require("../Chat/Channel");

// TODO : 글로벌 상수화 시키기
const SUPER_PUBLIC_CHANNEL_ADMIN_ID = "rlagudwns";
const SUPER_PUBLIC_CHANNEL_ADMIN_NM = "김형준";
const SUPER_PUBLIC_CHANNEL_MAP = new Map([
	["FIRST_TEST_OPEN_CHAT_CHANNEL01", "테스트 전체 공개 채팅방01"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL02", "테스트 전체 공개 채팅방02"],
	["FIRST_TEST_OPEN_CHAT_CHANNEL03", "테스트 전체 공개 채팅방03"],
]);

const ChannelValidator = {
	validatePublicChannelAdminId: async () => {
		try {
			let user = await UserService.EX_API.getUserById(SUPER_PUBLIC_CHANNEL_ADMIN_ID);

			if (!user) {
				await UserService.EX_API.createUser(
					SUPER_PUBLIC_CHANNEL_ADMIN_ID,
					SUPER_PUBLIC_CHANNEL_ADMIN_NM
				);
			}

			user = await UserService.getUserById(SUPER_PUBLIC_CHANNEL_ADMIN_ID);

			if (!user) {
				await UserService.createUser(
					SUPER_PUBLIC_CHANNEL_ADMIN_ID,
					SUPER_PUBLIC_CHANNEL_ADMIN_NM,
					null,
					99,
					"1234"
				);
			}

			console.log("서버 관리자 계정 정합성 검사 완료");
		} catch (error) {
			if (error instanceof UserNotFoundException) {
				await UserService.createUser(
					SUPER_PUBLIC_CHANNEL_ADMIN_ID,
					SUPER_PUBLIC_CHANNEL_ADMIN_NM,
					null,
					99
				);

				await ChannelValidator.validatePublicChannelAdminId();
			} else throw new Error(error.message);
		}
	},

	validatePublicChannels: async () => {
		try {
			let count = await ChannelService.getChannelsByUserIdAndType(
				SUPER_PUBLIC_CHANNEL_ADMIN_ID,
				"super_public"
			).then((res) => res.length);

			if (SUPER_PUBLIC_CHANNEL_MAP.size != count)
				for (const [channelId, channelName] of SUPER_PUBLIC_CHANNEL_MAP.entries()) {
					await ChannelService.createChannel(channelId, channelName, "super_public");
					await ChannelService.EX_API.saveChannel(
						channelId,
						channelName,
						"super_public",
						SUPER_PUBLIC_CHANNEL_ADMIN_ID
					);

					await ChannelService.addUserToChannel(channelId, SUPER_PUBLIC_CHANNEL_ADMIN_ID);
					await ChannelService.EX_API.addUserToChannel(
						channelId,
						SUPER_PUBLIC_CHANNEL_ADMIN_ID
					);
				}

			console.log("전체 공개 채널 정합성 검사 완료");
			return true;
		} catch (error) {
			if (error instanceof UserNotFoundException) {
				await ChannelValidator.validatePublicChannelAdminId();
				return ChannelValidator.validatePublicChannels();
			} else throw new Error(error);
		}
	},
};

module.exports = ChannelValidator;
