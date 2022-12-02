/** 
 *  @property merchantId. Merchant id.
 *  @property accountId. Account id.
 *  @property shortNumberId. Short number.
 *  @property password. This is a write-only property and will always return null.
 */
export default interface StrexMerchant {
	merchantId: string;
	accountId: number;
	shortNumberIds: string[];
	password: string;
}