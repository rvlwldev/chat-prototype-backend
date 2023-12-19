document.addEventListener("DOMContentLoaded", () => {
	console.log("DOMContentLoaded");

	const ws = new WebSocket("ws://192.168.2.65:3000/");

	ws.onopen = () => {
		console.log("WebSocket이 OPEN됨");

		// 특정 이벤트로 데이터 전송
		ws.send(
			JSON.stringify({
				event: "read",
				data: "클라이언트에서 보낸 데이터",
			})
		);

		ws.send(
			JSON.stringify({
				event: "test",
				payload: "테스트 테스트 테스트 테스트 ",
			})
		);
	};

	ws.addEventListener("message", (event) => {
		console.log("WebSocket 메시지 수신:", event.data);

		try {
			const data = JSON.parse(event.data);

			if (data.event === "testEventResponse") {
				console.log("testEventResponse 수신:", data.payload);
			}
		} catch (error) {
			console.error("메시지 파싱 오류:", error);
		}
	});

	ws.addEventListener("error", (event) => {
		console.error("WebSocket 에러:", event);
	});

	ws.addEventListener("close", (event) => {
		console.log("WebSocket 연결 종료:", event);
	});
});
