import { DeliveryMode } from "./deliveryMode";
import StrexData from './strexData'

/** 
 *  @property transactionId. Must be unique per transaction if used. This can be used for guarding against resending.
 *  @property sessionId. This can be used as the clients relate transactions associated to a specific session.
 *  @property correlationId. This can be used as the clients correlation id for tracking transactions.
 *  @property shortNumber. Short number.
 *  @property recipient. Recipient phone number.
 *  @property content. Optional SMS text message content (Not used for direct billing).
 *  @property oneTimePassword. One-Time-Password. Used for Strex one-time password verification.
 *  @property deliveryMode. Delivery mode.
 *  @property statusCode. Status code. See <see cref="StatusCodes"/>.
 *  @property detailedStatusCode. Detailed status code. See <see cref="DetailedStatusCodes" />.
 *  @property statusDescription. Status description.
 *  @property created. Created time.
 *  @property lastModified. Last modified time.
 *  @property tags. Tags associated with transaction. Can be used for statistics and grouping.
 *  @property properties. Custom properties associated with the transaction.
 */
export default interface StrexTransaction extends StrexData {
	transactionId: string;
	sessionId: string;
	correlationId: string;
	shortNumber: string;
	recipient: string;
	content: string;
	oneTimePassword: string;
	deliveryMode: DeliveryMode;
	statusCode: string;
	detailedStatusCode: string;
	statusDescription: string;
	created: Date;
	lastModified: Date;
	tags: string[];
	properties: object;
}