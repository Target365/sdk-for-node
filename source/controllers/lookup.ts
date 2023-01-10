import Lookup from '../models/lookup'
import { Service } from '../service'

export class LookupController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async getLookupAsync(msisdn: string): Promise<Lookup> {
		const params = { msisdn: msisdn };
		return await this.service.getAsync<Lookup>(`api/lookup`, params);
	}
}