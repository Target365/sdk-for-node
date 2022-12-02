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

		if (result.status === 201)
			return '';
		else
			return 'Not created';
	}

	public async getOutMessageAsync(transactionId: string): Promise<OutMessage> {
		return await this.service.getAsync(`api/out-messages/${encodeURIComponent(transactionId)}`);
	}

	public async updateOutMessageAsync(message: OutMessage) {
		let result: any = await this.service.updateAsync(`api/out-messages/${encodeURIComponent(message.transactionId as string)}`, JSON.stringify(message));

		if (result === 204)
			return '';
		else
			return 'Not updated';
	}

	public async deleteOutMessageAsync(transactionId: string) {
		let result = await this.service.deleteAsync(`api/out-messages/${encodeURIComponent(transactionId)}`);

		if (result.status === 204)
			return '';
		else
			return 'Not Deleted';
	}

	public async prepareMsisdnsAsync(msisdns: string[]) {
		let result: any = await this.service.postAsync(`api/prepare-msisdns`, JSON.stringify(msisdns));

		if (result.status === 204)
			return '';
		else
			return 'Not created';
	}

	public async getOutMessageExportAsync(from: Date, to: Date) {
		var params = { from: from, to: to };
		return await this.service.getAsync(`api/export/out-messages`, params);
	}
}