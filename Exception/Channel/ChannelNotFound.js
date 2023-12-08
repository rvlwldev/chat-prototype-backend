class ChannelNotFoundException extends Error {
	constructor(channelId) {
		super(`채널 ID를 찾을 수 없습니다.\nID : ${channelId}`);
		this.name = "ChannelNotFoundException";
	}
}

module.exports = ChannelNotFoundException;
