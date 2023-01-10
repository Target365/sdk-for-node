import Keyword from '../models/keyword'
import { Service } from '../service'

export class KeywordController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async getKeywordsAsync(shortnumberId?: string | null, keywordText?: string | null, mode?: string | null, tag?: string | null): Promise<Keyword[]> {
		const parameters = { shortnumberId: shortnumberId, keywordText: keywordText, mode: mode, tag: tag };
		const filterdParameters = Object.fromEntries(
			Object.entries(parameters)
				.filter(([_, value]) => value != null)
				.map(([key, value]) => [key, value,]));

		return await this.service.getAsync<Keyword[]>('api/keywords', filterdParameters);
	}

	public async getKeywordAsync(keywordId: string): Promise<Keyword> {
		return await this.service.getAsync<Keyword>(`api/keywords/${encodeURIComponent(keywordId)}`);
	}

	public async createKeywordAsync(keyword: Keyword): Promise<string> {
		let result: any = await this.service.postAsync(`api/keywords`, JSON.stringify(keyword));
		return result?.headers.location.split('/').pop();
	}

	public async updateKeywordAsync(keyword: Keyword) {
		let result = await this.service.updateAsync(`api/keywords/${keyword.keywordId}`, JSON.stringify(keyword));

		if (result === 204)
			return '';
		else
			return 'Not updated';
	}

	public async deleteKeywordAsync(keywordId: string) {
		let result = await this.service.deleteAsync(`api/keywords/${encodeURIComponent(keywordId)}`);

		if (result.status === 204)
			return '';
		else
			return 'Not Deleted';
	}
}