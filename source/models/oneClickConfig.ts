/** 
 *  @property configId. Unique config id.
 *  @property created. Created time.
 *  @property lastModified. Last modified time.
 *  @property shortNumber. Short number.
 *  @property merchantId. Merchant id.
 *  @property serviceCode. Service code.
 *  @property businessModel. Business model.
 *  @property preAuthServiceId. Service id used for pre-authorizations and recurring billing.
 *  @property preAuthServiceDescription. Service description used for pre-authorizations and recurring billing.
 *  @property age. Age requirements - typically 18 for subscriptions and adult content.
 *  @property isRestricted. Whether the transaction should be flagged as restricted.
 *  @property invoiceText. Invoice text - Appears in the Strex portal available for end users.
 *  @property price. Price - in whole NOK. Cents (øre) are supported by the first two decimal places.
 *  @property timeout. Timeout in minutes for transactions which trigger end user registration. Default value is 5.
 *  @property recurring. Whether this config is for setting up subscriptions and recurring payments.
 *  @property redirectUrl. One-click redirect url.
 *  @property onlineText. One-click online text to use when oneclick msisdn detection is online and PIN-code can be skipped.
 *  @property offlineText. One-click text to use when oneclick msisdn detection is offline and PIN-code is used.
 *  @property subscriptionInterval. Subscription interval (weekly, monthly, yearly)
 *  @property subscriptionPrice. Subscription price - in whole NOK. Cents (øre) are supported by the first two decimal places.
 *  @property subscriptionStartSms. Subscription start sms - sent when recurring transaction started.
 */
export default interface OneClickConfig {
	configId: string;
	created: Date;
	lastModified: Date;
	shortNumber: string;
	merchantId: string;
	serviceCode: string;
	businessModel: string;
	preAuthServiceId: string;
	preAuthServiceDescription: string;
	age: number;
	isRestricted: boolean;
	invoiceText: string;
	price: number;
	timeout: number;
	recurring: boolean;
	redirectUrl: string;
	onlineText: string;
	offlineText: string;
	subscriptionInterval: string;
	subscriptionPrice?: number;
	subscriptionStartSms: string;
}