const AXIOS = require("axios");

class ExternalAPI {
	#url;
	#commonHeader;

	#adminID;

	constructor(baseUrl) {
		if (baseUrl) this.#url = baseUrl;
		else this.#url = "https://api.talkplus.io/v1.4/api/";

		this.#commonHeader = {
			"Content-Type": "application/json",
			"app-id ": "*",
			"api-key": "*",
		};

		this.#adminID = "47e2beb243c5bb9c";
	}

	async get(url, body = {}) {
		try {
			const response = await AXIOS.get(this.#url + url, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			throw err.response.data;
		}
	}

	async post(url, body = {}) {
		try {
			const response = await AXIOS.post(this.#url + url, body, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			throw err.response.data;
		}
	}

	async patch(url, body = {}) {
		try {
			const response = await AXIOS.patch(this.#url + url, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			throw err.response.data;
		}
	}

	async put(url, body = {}) {
		try {
			const response = await AXIOS.put(this.#url + url, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			throw err.response.data;
		}
	}

	async delete(url, body = {}) {
		try {
			const response = await AXIOS.delete(this.#url + url, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			throw err.response.data;
		}
	}
}

module.exports = ExternalAPI;
