const AXIOS = require("axios");
const { URL, APP } = require("../_Global/Constant/API");

class ExternalAPI {
	#url;
	#commonHeader;

	constructor(baseUrl) {
		if (baseUrl) this.#url = baseUrl;
		else this.#url = URL.TALK_PLUS;

		this.#commonHeader = {
			"Content-Type": "application/json",
			"app-id ": APP.TALK_PLUS.ID,
			"api-key": APP.TALK_PLUS.KEY,
		};
	}

	async get(url, body = {}) {
		try {
			const response = await AXIOS.get(this.#url + url, {
				params: body,
				headers: this.#commonHeader,
			}).then((res) => res);

			return response.data;
		} catch (err) {
			return err.response.data;
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
			return err.response.data;
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
			return err.response.data;
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
			return err.response.data;
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
			return err.response.data;
		}
	}
}

module.exports = ExternalAPI;
