/** 
 *  @property transactionId. TransactionId.
 *  @property recipient. Msisdn to receive pincode.
 *  @property sender. Sender of SMS.
 *  @property prefixText. Text inserted before pincode (optional).
 *  @property suffixText. Text added after pincode (optional).
 */
export default interface Pincode {
	transactionId: string;
	recipient: string;
	sender: string;
	prefixText: string;
	suffixText: string;
}