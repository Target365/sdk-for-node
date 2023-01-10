import PublicKey from '../models/publicKey'
import { Service } from '../service'

export class PublicKeyController {
	private service: Service;

	constructor(service: Service) {
		this.service = service;
	}

	public async getServerPublicKeyAsync(keyName: string): Promise<PublicKey> {
		return await this.service.getAsync<PublicKey>(`api/server/public-keys/${encodeURIComponent(keyName)}`);
	}

	public async getClientPublicKeysAsync(): Promise<PublicKey[]> {
		return await this.service.getAsync<PublicKey[]>(`api/client/public-keys`);
	}

	public async getClientPublicKeyAsync(keyName: string): Promise<PublicKey> {
		return await this.service.getAsync<PublicKey>(`api/client/public-keys/${encodeURIComponent(keyName)}`);
	}
}