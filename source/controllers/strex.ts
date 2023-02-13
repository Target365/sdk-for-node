import OneClickConfig from '../models/oneClickConfig';
import OneTimePassword from '../models/oneTimePassword';
import StrexMerchant from '../models/strexMerchant'
import StrexRegistrationSms from '../models/strexRegistrationSms';
import StrexTransaction from '../models/strexTransaction';
import { StrexUserValidity } from '../models/strexUserValidity';
import { Service } from '../service'

export class StrexController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async getMerchantIdsAsync(): Promise<StrexMerchant[]> {
		return await this.service.getAsync<StrexMerchant[]>(`api/strex/merchants`);
	}

	public async getMerchantAsync(merchantId: string): Promise<StrexMerchant> {
		return await this.service.getAsync<StrexMerchant>(`api/strex/merchants/${encodeURIComponent(merchantId)}`);
	}

	public async createOneTimePasswordAsync(oneTimePassword: OneTimePassword) {
		await this.service.postAsync(`api/strex/one-time-passwords`, JSON.stringify(oneTimePassword));
	}

	public async getOneTimePasswordAsync(transactionId: string): Promise<OneTimePassword> {
		return await this.service.getAsync<OneTimePassword>(`api/strex/one-time-passwords/${encodeURIComponent(transactionId)}`);
	}

	public async createStrexTransactionAsync(transaction: StrexTransaction): Promise<string> {
		let result: any = await this.service.postAsync(`api/strex/transactions`, JSON.stringify(transaction));
		return result?.headers.location.split('/').pop();
	}

	public async getStrexTransactionAsync(transactionId: string): Promise<StrexTransaction> {
		return await this.service.getAsync<StrexTransaction>(`api/strex/transactions/${encodeURIComponent(transactionId)}`);
	}

	public async reverseStrexTransactionAsync(transactionId: string) {
		let result: any = await this.service.deleteAsync(`api/strex/transactions/${encodeURIComponent(transactionId)}`);

		if (result.status != 204)
			throw 'An unexpected error occurred';
	}

	public async getStrexValidityAsync(recipient: string, merchantId?: string): Promise<StrexUserValidity> {
		let params = {};

		if (merchantId)
			params = { recipient: recipient, merchantId: merchantId };
		else
			params = { recipient: recipient };

		return await this.service.getAsync<StrexUserValidity>(`api/strex/validity`, params);
	}

	public async getOneClickConfigAsync(configId: string): Promise<OneClickConfig> {
		return await this.service.getAsync<OneClickConfig>(`api/one-click/configs/${encodeURIComponent(configId)}`);
	}

	public async saveOneClickConfigAsync(config: OneClickConfig) {
		let result = await this.service.updateAsync(`api/one-click/configs/${encodeURIComponent(config.configId)}`, JSON.stringify(config));

		if (result != 204)
			throw 'An unexpected error occurred';
	}

	public async sendStrexRegistrationSmsAsync(registrationSms: StrexRegistrationSms) {
		await this.service.postAsync(`api/strex/registrationsms`, JSON.stringify(registrationSms));
	}
}