import Pincode from '../models/pincode'
import { Service } from '../service'

export class PincodeController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async sendPinCodeAsync(pincode: Pincode) {
		let result = await this.service.postAsync(`api/pincodes`, JSON.stringify(pincode));

		if (result.status != 204)
			throw 'An unexpected error occurred';
	}

	public async verifyPinCodeAsync(transactionId: string, pincode: string): Promise<boolean> {
		const params = { transactionId: transactionId, pincode: pincode };
		return await this.service.getAsync<boolean>(`api/pincodes/verification`, params);
	}
}