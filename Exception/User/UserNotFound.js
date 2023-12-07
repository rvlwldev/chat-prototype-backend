class UserNotFoundException extends Error {
	constructor(message = "확인할 수 없는 유저 ID입니다.") {
		super(message);
		this.name = "UserNotFoundException";
	}
}

module.exports = UserNotFoundException;
