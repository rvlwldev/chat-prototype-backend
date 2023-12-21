const WebSocket = require("ws");

class ClientConnection {
	#ID;

	channelIdSet = new Set();
	/** @type WebSocket.Server */ WS;

	constructor(serviceId, userId, ws) {
		this.#ID = `${serviceId}-${userId}`;
		this.WS = ws;
	}

	addChannelId = (channelId) => this.channelIdSet.add(channelId);
	deleteChannelId = (channelId) => this.channelIdSet.delete(channelId);

	valueOf = () => this.#ID;
}

/** @type Map<String, ClientConnection> */
const connectionMap = new Map();

function openSocketWithServer(server) {
	const wss = new WebSocket.Server({ server });

	const getParams = (url) => {
		const params = new URLSearchParams(url.split("?")[1]);
		return {
			serviceId: params.get("serviceId"),
			userId: params.get("userId"),
		};
	};

	wss.on("connection", (ws, req) => {
		const { serviceId, userId } = getParams(req.url);
		ws.onclose = () => removeClient(serviceId, userId);

		// TODO: validation
		if (!validateConnection(serviceId, userId)) {
			// TODO : 실패 메세지 보내기
			ws.terminate();
			return;
		}

		// 클라이언트 에러
		ws.onerror = (error) => console.error(`클라이언트 에러: ${error.message}`);

		const connection = new ClientConnection(serviceId, userId, ws);
		connectionMap.set(`${serviceId}-${userId}`, connection);
	});
}

function validateConnection(serviceId, userId) {
	return true;
}

function removeClient(serviceId, userId) {
	const ID = `${serviceId}-${userId}`;
	if (!connectionMap.has(ID)) return;

	connectionMap.get(ID).WS.terminate();
	connectionMap.delete(ID);
}

async function sendMessage(ws, eventName, message) {
	return new Promise((resolve, reject) => {
		ws.send(
			JSON.stringify({
				event: eventName,
				message: message,
			}),
			(error) => {
				if (error) reject(error);
				else resolve();
			}
		);
	});
}

const WS = {
	subscribe: (serviceId, userId, channelId) => {
		const connection = connectionMap.get(`${serviceId}-${userId}`);

		if (!connection) {
			// TODO : 클라이언트가 없으면 예외처리
			return;
		}

		connection.addChannelId(channelId);
	},

	publish: async (channelId, eventName, message) => {
		for (const connection of connectionMap.keys()) {
			if (connection.channelIdSet.has(channelId))
				sendMessage(connection.WS, eventName, message);
		}
	},
};

module.exports = { openSocketWithServer, WS };
