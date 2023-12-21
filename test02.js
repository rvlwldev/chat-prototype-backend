// 웹소켓

const socketBaseURL = "ws://192.168.2.65:3000";
var WS;

let user = {
	service: { id: "test-service" },
	id: "test_account_01",
	name: "테스트이름01",
};

// 서버에서 수신만... 즉, on-message만
document.addEventListener("DOMContentLoaded", () => {
	let url = socketBaseURL + `?serviceId=${user.service.id}&userId=${user.id}`;

	WS = new WebSocket(url);
	WS.onopen = initializeWS;
});

const initializeWS = () => {
	WS.onmessage = (payload) => {
		console.log(payload);
		try {
			const data = JSON.parse(payload.data);
			console.log(data.event);
			if (data.event == "message") receiveMessage(data.result);
		} catch (error) {}
	};

	WS.onerror = () => {};
	WS.close = () => {};

	WS.send(
		JSON.stringify({
			event: "message",
			data: {
				serviceId: "test-service",
				channel: { id: "test-channel-01" },
				message: {
					text: "test TEXT 01",
					senderId: "test_account_01",
				},
			},
		})
	);
};

function receiveMessage(data) {
	console.log(data);
}
