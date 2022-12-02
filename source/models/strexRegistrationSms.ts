/**
 * @property transactionId. Transaction Id.
 * @property merchantId. Merchant Id.
 * @property recipient. Recipient mobile number.
 * @property smsText. SMS text to be added in the registration SMS. Registration URL will be added by Strex.
 */
export default interface StrexRegistrationSms {
	transactionId: string;
	merchantId: string;
	recipient: string;
	smsText: string;
}