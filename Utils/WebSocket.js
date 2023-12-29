const WebSocket = require("ws");
const JWT = require("jsonwebtoken");

/** @type Map<String, ClientConnection> */
const socketMap = new Map();

class ClientConnection {
	/** @type WebSocket.Server */ WebSocket;

	constructor(WebSocket, serviceId, userId) {
		this.WebSocket = WebSocket;
		this.serviceId = serviceId;
		this.userId = userId;

		this.channelSet = new Set();
	}

	subscribeChannel = (channelId) => this.channelSet.add(channelId);
	unsubscribeChannel = (channelId) => this.channelSet.delete(channelId);
}

const verifyConnectRequest = (websocket, request) => {
	const TOKEN = request.headers.authorization;
	const KEY = process.env.JWT_KEY;

	JWT.verify(TOKEN, KEY, (error, payload) => {
		if (error) {
			websocket.send(JSON.stringify({ error: error }));
			websocket.terminate();
			return null;
		}

		return {
			serviceId: payload.service.id,
			userId: payload.user.id,
		};
	});
};

// TODO : 클라이언트 메세지 처리 ( message-typing 이벤트 )
const onMessageReceive = (data) => {
	const payload = JSON.parse(data);
	console.log(payload);
};

const onPublish = (filter = () => false, eventName, payload) =>
	Array.from(socketMap.values())
		.filter(filter)
		.map(async (websocket) => asyncSend(websocket, eventName, payload));

const asyncSend = (websocket, eventName, message) =>
	new Promise((resolve, reject) =>
		websocket.send(
			JSON.stringify({
				event: eventName,
				result: message,
			}),
			(error) => {
				if (error) reject(error);
				else resolve();
			}
		)
	);

const WS = {
	openSocketWithServer: (server) => {
		new WebSocket.Server({ server }).on("connection", (websocket, request) => {
			const { serviceId, userId } = verifyConnectRequest(websocket, request);

			if (serviceId && userId) {
				const key = `${serviceId}-${userId}`;
				const connection = new ClientConnection(websocket, serviceId, userId);
				socketMap.set(key, connection);

				websocket.onclose = () => {
					websocket.terminate();
					socketMap.delete(key);
				};

				websocket.onmessage = onMessageReceive;
			}
		});
	},

	event: {
		CHANNEL_CREATE: "channel-add",
		CHANNEL_UPDATE: "channel-change",
		CHANNEL_DELETE: "channel-remove",

		USER_IN: "user-join",
		USER_OUT: "user-leave",
		USER_UPDATE: "user-change",

		MESSAGE_SEND: "message-receive",
		MESSAGE_READ: "message-read",
		MESSAGE_TYPING: "message-typing",
		MESSAGE_UPDATE: "message-change",
		MESSAGE_DELETE: "message-remove",
	},

	subscribeChannel: (serviceId, userId, channelId) => {
		let client = socketMap.get(`${serviceId}-${userId}`);

		if (client instanceof ClientConnection) client.subscribeChannel(channelId);
	},

	subscribeChannelArray: (serviceId, userId, channelIdArray) => {
		let client = socketMap.get(`${serviceId}-${userId}`);

		if (client instanceof ClientConnection)
			channelIdArray.forEach((channelId) => client.subscribeChannel(channelId));
	},

	publishToService: async (serviceId, eventName, message) =>
		onPublish((conn) => conn.serviceId == serviceId, eventName, message),

	publishToChannel: async (serviceId, channelId, eventName, message) =>
		onPublish(
			(conn) => conn.serviceId == serviceId && conn.channelSet.has(channelId),
			eventName,
			message
		),

	publishToUser: async (serviceId, userId, eventName, message) =>
		onPublish(
			(conn) => conn.serviceId == serviceId && conn.userId == userId,
			eventName,
			message
		),
};

module.exports = WS;
