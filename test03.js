// 웹소켓

const socketURL = "ws://192.168.2.65:3000/";

let WS;

document.addEventListener("DOMContentLoaded", () => {
	WS = new WebSocket(socketURL);
	console.log(WS);
	WS.onopen = initializeWS;
});

const initializeWS = () => {
	WS.onmessage = (payload) => {
		try {
			const data = JSON.parse(payload.data);
			console.log(data.event);
			if (data.event == "message-receive") receiveMessage(data.result);
		} catch (error) {}
	};

	WS.onerror = () => {};
	WS.close = () => {};

	WS.send(
		JSON.stringify({
			event: "sub-channel",
			data: { serviceId: "test-service", channel: { id: "test-channel-id01" } },
		})
	);

	WS.send(
		JSON.stringify({
			event: "send-message",
			data: {
				serviceId: "test-service",
				channel: { id: "test-channel-id01" },
				message: {
					text: "test TEXT 03",
					senderId: "test_account_03",
				},
			},
		})
	);
};

function receiveMessage(data) {
	console.log(data);
}
