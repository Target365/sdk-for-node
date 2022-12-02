/** 
 *  @property infoText. Info message sent before preauth message
 *  @property infoSender. Sender of info message
 *  @property prefixMessage. Text inserted before preauth text
 *  @property postfixMessage. Text inserted after preauth text
 *  @property delay. Delay in minutes between info message and preauth message
 *  @property merchantId. MerchantId to perform preauth on
 *  @property serviceDescription. Service description for Strex "Min Side"
 *  @property active. If settings are active
 */
export default interface PreAuthSettings {
	infoText: string;
	infoSender: string;
	prefixMessage: string;
	postfixMessage: string;
	delay?: number;
	merchantId: string;
	serviceDescription: string;
	active?: boolean;
}