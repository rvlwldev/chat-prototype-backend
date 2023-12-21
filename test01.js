// 웹소켓

const socketBaseURL = "ws://192.168.2.65:3000";
var WS;

let user = {
	service: { id: "test-service" },
	id: "test",
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
			if (data.event == "message-receive") receiveMessage(data.result);
		} catch (error) {}
	};

	WS.onerror = () => {};
	WS.close = () => {};
};

function receiveMessage(data) {
	console.log(data);
}
