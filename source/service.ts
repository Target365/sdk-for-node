import axios from 'axios'
import { Signer } from './signer';

export class Service {
	private baseUrl: string;
	private keyName: string;
	private signer: Signer;

	constructor(baseUrl: string, keyName: string, privateKey: string) {
		this.baseUrl = baseUrl;
		this.keyName = keyName;
		this.signer = new Signer(privateKey);
	}

	public async getAsync<T>(path: string, params?: any): Promise<T> {
		try {
			const authorization = this.getAuthorization('get', path, '', params);
			let result = await axios.get(`${this.baseUrl}${path}`, { headers: { 'Authorization': authorization }, params: params });
			return result.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async postAsync(path: string, data: any, params?: any) {
		try {
			const authorization = this.getAuthorization('post', path, data, params);
			return await axios.post(`${this.baseUrl}${path}`, data, { headers: { 'Authorization': authorization }, params: params });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async updateAsync(path: string, data: any, params?: any) {
		try {
			const authorization = this.getAuthorization('put', path, data, params);
			let result = await axios.put(`${this.baseUrl}${path}`, data, { headers: { 'Authorization': authorization }, params: params });
			return result.status;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public async deleteAsync(path: string, params?: any) {
		try {
			const authorization = this.getAuthorization('delete', path, '', params);
			return await axios.delete(`${this.baseUrl}${path}`, { headers: { 'Authorization': authorization }, params: params });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response?.data.Message;
			} else {
				throw 'An unexpected error occurred';
			}
		}
	};

	public getAuthorization(method: string, path: string, content: any, params?: any) {
		let parameters = '';

		if (params)
			parameters = '?' + new URLSearchParams(params).toString();

		const uri = this.baseUrl + path + (parameters == '?' ? '' : parameters);
		return this.signer.SignHeader(this.keyName, method, uri, content);
	}
}