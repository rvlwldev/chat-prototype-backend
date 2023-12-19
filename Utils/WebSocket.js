const WebSocket = require("ws");

/** @type WebSocket */
var WS;

function initializeWebSocket(server) {
	const webSocketServer = new WebSocket.Server({ server });

	webSocketServer.on("connection", (ws, req) => {
		ws.on("message", (payload) => {
			try {
				const PAYLOAD = JSON.parse(payload);
				let event = PAYLOAD.event;

				switch (event) {
					case "subscribe-channel":
						listenChannelMessages(PAYLOAD.channelId);
						break;
					case "read":
						break;
				}
			} catch (error) {
				console.error("메시지 파싱 오류:", error);
				console.log(payload);
			}
		});

		ws.on("error", (err) => {
			console.error("WebSocket Error");
			console.error(err);
		});

		ws.on("close", () => {
			console.log("클라이언트 접속 해제");
		});

		ws.on("test", (str) => {
			console.log("test String : " + str);
		});
	});
}

// TODO : 특정 채널의 메세지 올라오는거 대기 타기
function subscribeChannelMessages(channelId) {}

// TODO : 특정 채널의 읽음처리
function channelRead(channelId) {}

module.exports = { initializeWebSocket, WS };
