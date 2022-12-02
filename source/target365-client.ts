import { Service } from './service';
import { InMessageController } from './controllers/inMessage';
import { KeywordController } from './controllers/keyword';
import { LookupController } from './controllers/lookup';
import { OutMessageController } from './controllers/outMessage';
import { PincodeController } from './controllers/pincode';
import { StrexController } from './controllers/strex';
import { PublicKeyController } from './controllers/publicKey';
import InMessage from './models/inMessage';
import Keyword from './models/keyword';
import Lookup from './models/lookup';
import OneClickConfig from './models/oneClickConfig';
import OneTimePassword from './models/oneTimePassword';
import OutMessage from './models/outMessage';
import Pincode from './models/pincode';
import PublicKey from './models/publicKey';
import StrexMerchant from './models/strexMerchant';
import StrexRegistrationSms from './models/strexRegistrationSms';
import StrexTransaction from './models/strexTransaction';
import { StrexUserValidity } from './models/strexUserValidity';

export class Target365Client {
	private service: Service;
	private keywordController: KeywordController;
	private lookupController: LookupController;
	private inMessageController: InMessageController;
	private outMessageController: OutMessageController;
	private strexController: StrexController;
	private pincodeController: PincodeController;
	private publicKeyController: PublicKeyController;

	constructor(baseUrl: string, privateKey: string) {
		this.service = new Service(baseUrl, privateKey);
		this.keywordController = new KeywordController(this.service);
		this.lookupController = new LookupController(this.service);
		this.inMessageController = new InMessageController(this.service);
		this.outMessageController = new OutMessageController(this.service);
		this.strexController = new StrexController(this.service);
		this.pincodeController = new PincodeController(this.service);
		this.publicKeyController = new PublicKeyController(this.service);
	}

	/**
	 * Lists all keywords.
	 * 
	 * @param shortNumberId Filter for short number id (exact string match).
	 * @param keywordText Filter for keyword text (contains match).
	 * @param mode Filter for mode (exact string match)
	 * @param tag Filter for tag (exact string match).
	 */
	public async getKeywordsAsync(shortNumberId?: string | null, keywordText?: string | null, mode?: string | null, tag?: string | null): Promise<Keyword[]> {
		try {
			return await this.keywordController.getKeywordsAsync(shortNumberId, keywordText, mode, tag);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a keyword.
	 * 
	 * @param keywordId Keyword id.
	 */
	public async getKeywordAsync(keywordId: string): Promise<Keyword> {
		try {
			if (!keywordId) throw 'keywordId cannot be null or empty string.';

			return await this.keywordController.getKeywordAsync(keywordId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 *  Creates a keyword object
	 *  
	 * @param keyword - Keyword object
	 */
	public async createKeywordAsync(keyword: Keyword): Promise<string> {
		try {
			return await this.keywordController.createKeywordAsync(keyword);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 *  Update a keyword object
	 *  
	 * @param keyword - Updated keyword. 
	 */
	public async updateKeywordAsync(keyword: Keyword): Promise<string> {
		try {
			return await this.keywordController.updateKeywordAsync(keyword);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Deletes a keyword.
	 *
	 * @param keywordId Keyword id.
	 */
	public async deleteKeywordAsync(keywordId: string): Promise<string> {
		try {
			if (!keywordId) throw 'keywordId cannot be null or empty string.';

			return await this.keywordController.deleteKeywordAsync(keywordId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Lookup a phone number.
	 *
	 * @param msisdn Phone number in international format with a leading plus e.g. '+4798079008'.
	 */
	public async getLookupAsync(msisdn: string): Promise<Lookup> {
		try {
			if (!msisdn) throw 'msisdn cannot be null or empty string.';

			return await this.lookupController.getLookupAsync(msisdn);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets an in-message.
	 *
	 * @param shortNumberId Short number id.
	 * @param transactionId In-message transaction id.
	 */
	public async getInMessageAsync(shortNumberId: string, transactionId: string): Promise<InMessage> {
		try {
			if (!shortNumberId) throw 'shortNumberId cannot be null or empty string.';
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return await this.inMessageController.getInMessageAsync(shortNumberId, transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates a new out-message.
	 *
	 * @param message Out-message object.
	 */
	public async createOutMessageAsync(message: OutMessage): Promise<string> {
		try {
			return await this.outMessageController.createOutMessageAsync(message);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates a new out-message batch..
	 *
	 * @param messages Out-messages array.
	 */
	public async createOutMessageBatchAsync(messages: OutMessage[]): Promise<string> {
		try {
			return await this.outMessageController.createOutMessageBatchAsync(messages);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets an out-message.
	 *
	 * @param transactionId Out-message transaction id.
	 */
	public async GetOutMessageAsync(transactionId: string): Promise<OutMessage> {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return await this.outMessageController.getOutMessageAsync(transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 *  Updates a future scheduled out-message
	 *  
	 * @param message Updated message. 
	 */
	public async updateOutMessageAsync(message: OutMessage): Promise<string> {
		try {
			if (!message.transactionId) throw 'transactionId cannot be null or empty string.';

			return await this.outMessageController.updateOutMessageAsync(message);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Deletes future sheduled out-message.
	 *
	 * @param transactionId Transaction id.
	 */
	public async deleteOutMessageAsync(transactionId: string): Promise<string> {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return await this.outMessageController.deleteOutMessageAsync(transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Prepare MSISDNs for later sendings. This can greatly improves sending performance.
	 *
	 * @param msisdns Msisdns to prepare.
	 */
	public async prepareMsisdnsAsync(msisdns: string[]): Promise<string> {
		try {
			if (!msisdns || msisdns.length == 0) throw 'msisdns cannot be null or empty.';

			return await this.outMessageController.prepareMsisdnsAsync(msisdns);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Get out-message export in CSV format.
	 *
	 * @param from From time.
	 * @param to To time.
	 */
	public async getOutMessageExportAsync(from: Date, to: Date): Promise<OutMessage> {
		try {
			if (!from) throw 'from cannot be null or empty.';
			if (!to) throw 'from cannot be null or empty.';

			return await this.outMessageController.getOutMessageExportAsync(from, to);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets all merchant ids.
	 */
	public async getMerchantIdsAsync(): Promise<StrexMerchant[]> {
		try {
			return this.strexController.getMerchantIdsAsync();
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a merchant.
	 *
	 * @param merchantId merchant id.
	 */
	public async getMerchantAsync(merchantId: string): Promise<StrexMerchant> {
		try {
			if (!merchantId) throw 'merchantId cannot be null or empty string.';

			return this.strexController.getMerchantAsync(merchantId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates/updates a merchant.
	 *
	 * @param merchant merchant object.
	 */
	public async saveMerchantAsync(merchant: StrexMerchant) {
		try {
			if (!merchant) throw 'merchant cannot be null.';
			if (!merchant.merchantId) throw 'merchantId cannot be null or empty string.';

			return this.strexController.saveMerchantAsync(merchant);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Deletes a merchant.
	 *
	 * @param merchantId merchant id.
	 */
	public async deleteMerchantAsync(merchantId: string) {
		try {
			if (!merchantId) throw 'merchantId cannot be null or empty string.';

			return this.strexController.deleteMerchantAsync(merchantId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates a one-time password.
	 *
	 * @param oneTimePassword One-time password object.
	 */
	public async createOneTimePasswordAsync(oneTimePassword: OneTimePassword) {
		try {
			if (!oneTimePassword) throw 'oneTimePassword cannot be null.';

			this.strexController.createOneTimePasswordAsync(oneTimePassword);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a one-time password.
	 *
	 * @param transactionId Strex transaction id.
	 */
	public async getOneTimePasswordAsync(transactionId: string): Promise<OneTimePassword> {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return this.strexController.getOneTimePasswordAsync(transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates a new strex transaction.
	 *
	 * @param transaction Strex transaction object.
	 */
	public async createStrexTransactionAsync(transaction: StrexTransaction): Promise<string> {
		try {
			if (!transaction) throw 'transaction cannot be null.';

			return this.strexController.createStrexTransactionAsync(transaction);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a strex transaction.
	 *
	 * @param transactionId Strex transaction id.
	 */
	public async getStrexTransactionAsync(transactionId: string): Promise<StrexTransaction> {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return this.strexController.getStrexTransactionAsync(transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Reverses a strex transaction and returns the resulting reversal transaction id.
	 *
	 * @param transactionId Strex transaction id.
	 */
	public async reverseStrexTransactionAsync(transactionId: string) {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';

			return this.strexController.reverseStrexTransactionAsync(transactionId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets Strex user validity.
	 *
	 * @param recipient Recipient msisdn.
	 * @param merchantId MerchantId (optional).
	 */
	public async getStrexValidityAsync(recipient: string, merchantId?: string): Promise<StrexUserValidity> {
		try {
			if (!recipient) throw 'recipient cannot be null or empty string.';

			return this.strexController.getStrexValidityAsync(recipient, merchantId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a one-click config.
	 *
	 * @param configId Config id.
	 */
	public async getOneClickConfigAsync(configId: string): Promise<OneClickConfig> {
		try {
			if (!configId) throw 'configId cannot be null or empty string.';

			return this.strexController.getOneClickConfigAsync(configId);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Creates/updates a one-click config.
	 *
	 * @param config one-click config object.
	 */
	public async saveOneClickConfigAsync(config: OneClickConfig) {
		try {
			if (!config) throw 'config cannot be null.';
			if (!config.merchantId) throw 'merchantId cannot be null or empty string.';

			return this.strexController.saveOneClickConfigAsync(config);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Initiates Strex-registation by SMS.
	 *
	 * @param registrationSms Strex registration sms.
	 */
	public async sendStrexRegistrationSmsAsync(registrationSms: StrexRegistrationSms) {
		try {
			if (!registrationSms) throw 'registrationSms cannot be null.';
			if (!registrationSms.merchantId) throw 'merchantId cannot be null or empty string.';
			if (!registrationSms.recipient) throw 'recipient cannot be null or empty string.';
			if (!registrationSms.transactionId) throw 'transactionId cannot be null or empty string.';

			this.strexController.sendStrexRegistrationSmsAsync(registrationSms);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Sends pin code to user for verification.
	 *
	 * @param pincode Pin code object.
	 */
	public async sendPinCodeAsync(pincode: Pincode) {
		try {
			if (!pincode) throw 'pincode cannot be null.';

			return this.pincodeController.sendPinCodeAsync(pincode);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Verify pin code sent to user.
	 *
	 * @param transactionId TransactionId used when creating pincode.
	 * @param pincode Pin code to check.
	 */
	public async verifyPinCodeAsync(transactionId: string, pincode: string): Promise<boolean> {
		try {
			if (!transactionId) throw 'transactionId cannot be null or empty string.';
			if (!pincode) throw 'pincode cannot be null or empty string.';

			return this.pincodeController.verifyPinCodeAsync(transactionId, pincode);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets server public key used for signing outgoing http requests like delivery reports and in-messages.
	 *
	 * @param keyName Key name.
	 */
	public async getServerPublicKeyAsync(keyName: string): Promise<PublicKey> {
		try {
			if (!keyName) throw 'keyName cannot be null or empty string.';

			return this.publicKeyController.getServerPublicKeyAsync(keyName);
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets client public key used for verifying incoming http requests.
	 */
	public async getClientPublicKeysAsync(): Promise<PublicKey[]> {
		try {
			return this.publicKeyController.getClientPublicKeysAsync();
		} catch (e: any) {
			throw e;
		}
	}

	/**
	 * Gets a client public key.
	 *
	 * @param keyName Key name.
	 */
	public async getClientPublicKeyAsync(keyName: string): Promise<PublicKey> {
		try {
			if (!keyName) throw 'keyName cannot be null or empty string.';

			return this.publicKeyController.getClientPublicKeyAsync(keyName);
		} catch (e: any) {
			throw e;
		}
	}
}