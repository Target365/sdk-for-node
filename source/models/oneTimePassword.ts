/** 
 *  @property transactionId. Transaction id.
 *  @property merchantId. Merchant id.
 *  @property recipient. Recipient msisdn.
 *  @property recurring. Whether one-time password is for recurring payment.
 *  @property sender. One-time password SMS message sender (originator).
 *  @property messagePrefix. Text string which will be prepended to the standard Strex SMS message sent to the subscriber.
 *  @property messageSuffix. Text string which will be appended to the standard Strex SMS message sent to the subscriber.
 *  @property message. Deprecated, use MessagePrefix and MessageSuffix instead.
 *  @property timeToLive. Time-To-Live (TTL) in minutes. Must be between 1 and 1440. Default value is 2.
 *  @property delivered. Whether one-time password sms has been delivered. Null means unknown.
 */
export default interface OneTimePassword {
	transactionId: string;
	merchantId: string;
	recipient: string;
	recurring: boolean;
	sender: string;
	messagePrefix: string;
	messageSuffix: string;
	message: string;
	timeToLive: number;
	delivered?: boolean;
}