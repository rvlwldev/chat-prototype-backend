const UserNotFoundException = require("../../Exception/User/UserNotFound");

const userQuery = require("../../Database/Query/UserQuery");

const ExternalAPI = require("../../Util/ExternalAPI");
const exAPI = new ExternalAPI();

const UserService = {
	getUserById: async (userId) => {
		const USER_INFO = await userQuery.selectByUserId(userId);

		if (USER_INFO.length === 0) throw new UserNotFoundException();
		else return USER_INFO[0];
	},

	saveUser: async (userId, username, userProfileImageURL, role) => {
		return await userQuery.insert(userId, username, userProfileImageURL, role);
	},

	getUserOnExAPI: async (userId) => {
		return await exAPI.get(`users/${userId}`).then((result) => {
			if (result.error) throw new Error(result.message);
			else return result.user;
		});
	},

	saveUserOnExAPI: async (userId, username) => {
		return await exAPI
			.post("users/create", { userId: userId, password: userId, username: username })
			.then((result) => {
				if (result.error) throw new Error(result.message);
				else return result.user;
			});
	},
};

module.exports = UserService;
