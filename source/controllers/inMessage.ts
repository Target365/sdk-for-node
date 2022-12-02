import InMessage from '../models/inMessage'
import { Service } from '../service'

export class InMessageController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async getInMessageAsync(shortNumberId: string, transactionId: string): Promise<InMessage> {
		return await this.service.getAsync(`api/in-messages/${shortNumberId}/${encodeURIComponent(transactionId)}`);
	}
}