import axios from 'axios'

export class Service {
	private baseUrl: string;
	private headers: object;

	constructor(baseUrl: string, privateKey: string) {
		this.baseUrl = baseUrl;
		this.headers = { 'X-ApiKey': privateKey };
	}

	public async getAsync(url: string, params?: object) {
		try {
			let result = await axios.get(`${this.baseUrl}${url}`, { headers: this.headers, params: params });
			return result.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 404) {
					return null;
				}
				else {
					throw error.response?.data.Message;
				}
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async postAsync(url: string, data: any, params?: object) {
		try {
			let result = await axios.post(`${this.baseUrl}${url}`, data, { headers: this.headers, params: params });
			return result;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async updateAsync(url: string, data: any, params?: object) {
		try {
			let result = await axios.put(`${this.baseUrl}${url}`, data, { headers: this.headers, params: params });
			return result.status;
		} catch (error) {
			console.log('update error: '+ error);
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async deleteAsync(url: string, params?: object) {
		try {
			return await axios.delete(`${this.baseUrl}${url}`, { headers: this.headers, params: params });
		} catch (error) {
			console.log(JSON.stringify(error));
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};
}