import Pincode from '../models/pincode'
import { Service } from '../service'

export class PincodeController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async sendPinCodeAsync(pincode: Pincode): Promise<string> {
		let result = await this.service.postAsync(`api/pincodes`, JSON.stringify(pincode));

		if (result.status === 204)
			return '';
		else
			return 'Not saved';
	}

	public async verifyPinCodeAsync(transactionId: string, pincode: string): Promise<boolean> {
		const params = { transactionId: transactionId, pincode: pincode };
		return await this.service.getAsync(`api/pincodes/verification`, params);
	}
}