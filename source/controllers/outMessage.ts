import OutMessage from '../models/outMessage'
import { Service } from '../service'

export class OutMessageController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async createOutMessageAsync(message: OutMessage): Promise<string> {
		let result: any = await this.service.postAsync(`api/out-messages`, JSON.stringify(message));
		return result?.headers.location.split('/').pop();
	}

	public async createOutMessageBatchAsync(messages: OutMessage[]) {
		let result: any = await this.service.postAsync(`api/out-messages/batch`, JSON.stringify(messages));

		if (result.status != 201 && result.status != 204)
			throw 'An unexpected error occurred';
	}

	public async getOutMessageAsync(transactionId: string): Promise<OutMessage> {
		return await this.service.getAsync<OutMessage>(`api/out-messages/${encodeURIComponent(transactionId)}`);
	}

	public async updateOutMessageAsync(message: OutMessage) {
		let result = await this.service.updateAsync(`api/out-messages/${encodeURIComponent(message.transactionId as string)}`, JSON.stringify(message));

		if (result != 201 && result != 204)
			throw 'An unexpected error occurred';
	}

	public async deleteOutMessageAsync(transactionId: string) {
		let result = await this.service.deleteAsync(`api/out-messages/${encodeURIComponent(transactionId)}`);

		if (result.status != 201 && result.status != 204)
			throw 'An unexpected error occurred';
	}

	public async prepareMsisdnsAsync(msisdns: string[]) {
		let result: any = await this.service.postAsync(`api/prepare-msisdns`, JSON.stringify(msisdns));

		if (result.status != 201 && result.status != 204)
			throw 'An unexpected error occurred';
	}

	public async getOutMessageExportAsync(from: Date, to: Date): Promise<string> {
		var params = { from: from, to: to };
		return await this.service.getAsync<string>(`api/export/out-messages`, params);
	}
}