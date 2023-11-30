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
			"app-id ": "7033fa01-881d-46e5-8ed2-63c472d83a89",
			"api-key": "bd6739468ceaf08797fdea8852a7a3c0da68b13735b94ef2b7c3a9929cd89716",
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
