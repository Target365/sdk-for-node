/** 
 *  @property merchantId. Merchant id - provided by Strex.
 *  @property serviceCode. Service code - provided by Strex. See <see cref="ServiceCodes"/>.
 *  @property businessModel. Business model - optional and provided by Strex.
 *  @property age. Age requirements - typically 18 for subscriptions and adult content. Default value is 0.
 *  @property isRestricted. Whether the transaction should be flagged as restricted - provided by Strex.
 *  @property smsConfirmation. Whether to use sms confirmation.
 *  @property invoiceText. Invoice text - this shows up on the Strex portal for end users.
 *  @property price. price to charge in whole NOK. Two decimals are supported (øre).
 *  @property timeout. Timeout in minutes for transactions which trigger end user registration. Default value is 5.
 *  @property preAuthServiceId. Service id used for pre-authorizations and recurring billing.
 *  @property preAuthServiceDescription. Service description used for pre-authorizations and recurring billing.
 *  @property billed. Read-only: Whether billing was performed. Null if status is unknown.
 *  @property resultCode. Read-only: Strex payment gateway result code.
 *  @property resultDescription. Read-only: Strex payment gateway result description.
 */
export default interface StrexData {
	merchantId: string;
	serviceCode: string;
	businessModel: string;
	age: number;
	isRestricted: boolean;
	smsConfirmation?: boolean;
	invoiceText: string;
	price: number;
	timeout: number;
	preAuthServiceId: string;
	preAuthServiceDescription: string;
	billed?: boolean;
	resultCode: string;
	resultDescription: string;
}