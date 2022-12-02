import { DeliveryMode } from "./deliveryMode";
import StrexData from "./strexData";

/**
 * @property transactionId. Must be unique per message if used. This can be used for guarding against resending messages.
 * @property sessionId. This can be used as the clients to get all out-messages associated to a specific session.
 * @property correlationId. This can be used as the clients correlation id for tracking messages and delivery reports.
 * @property keywordId associated with message. Can be null.
 * @property sender. Can be an alphanumeric string, a phone number or a short number.
 * @property recipient phone number.
 * @property content. The actual text message content.
 * @property sendTime. Send time, in UTC. If omitted the send time is set to ASAP.
 * @property timeToLive. Message Time-To-Live (TTL) in minutes. Must be between 5 and 1440. Default value is 120.
 * @property priority. Can be 'Low', 'Normal' or 'High'. If omitted, default value is 'Normal'.
 * @property deliveryMode. Message delivery mode. Can be either AtLeastOnce or AtMostOnce. If omitted, default value is AtMostOnce.
 * @property deliveryReportUrl. Delivery report url.
 * @property lastModified. Last modified time.
 * @property created. Created time.
 * @property statusCode. Overall status code.
 * @property detailedStatusCode. Detailed status code.
 * @property statusDescription. Status description.
 * @property delivered. Whether message was delivered. Null if status is unknown.
 * @property operator id (from delivery report).
 * @property strex. Strex data associated with the out-message.
 * @property allowUnicode. Whether Unicode message is allowed.
 *			 True sends unicode SMS if Content has unicode characters.
 *			 False forces message to be rejected if Content has unicode characters.
 *			 Default is True.
 * @property smscTransactionId. External SMSC transaction id.
 * @property smscMessageParts. SMSC message parts.
 * @property tags. Tags associated with message. Can be used for statistics and grouping.
 * @property properties. Custom properties associated with the out-message.
 */
export default interface OutMessage {
	transactionId: string;
	sessionId: string;
	correlationId: string;
	keywordId: string;
	sender: string;
	recipient: string;
	content: string;
	sendTime: Date;
	timeToLive: number;
	priority: string;
	deliveryMode: DeliveryMode;
	deliveryReportUrl: string;
	lastModified: Date;
	created: Date;
	statusCode: string;
	detailedStatusCode: string;
	statusDescription: string;
	delivered?: boolean;
	operatorId: string;
	strex: StrexData;
	allowUnicode?: boolean;
	smscTransactionId: string;
	smscMessageParts: number;
	tags: string[];
	properties: object;
}