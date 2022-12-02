/**
 * @property transactionId. Operator transaction id.
 * @property keywordId. Keyword id associated with message. Can be null.
 * @property sender. Can be alphanumeric a phone number or the actual short number.
 * @property recipient. Phone number format includes a leading pluss and country code such as '+4798079008'.
 * @property content. The actual text message content.
 * @property isStopMessage. Whether the incoming message must be treated as a stop and unsubscribe request message.
 * @property processAttempts. Process attempts.
 * @property processed. Whether message has been processed.
 * @property created. Creation time.
 * @property tags. Tags associated with keyword. Can be used for statistics and grouping.
 * @property properties. Custom properties associated with message propagated from keyword.
 */
export default interface InMessage {
	transactionId: string;
	keywordId: string;
	sender: string;
	recipient: string;
	content: string;
	isStopMessage: boolean;
	processAttempts: number;
	processed?: boolean;
	created: Date;
	tags: string[];
	properties: object;
}