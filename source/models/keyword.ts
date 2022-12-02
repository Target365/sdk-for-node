import PreAuthSettings from '../models/preAuthSettings'

/**
 * @property keywordId. Keyword id returned by Target365.
 * @property shortNumberId. Short number associated with keyword.
 * @property keywordText. Keyword text.
 * @property mode. Keyword mode. Can be 'Text', 'Wildcard' or 'Regex'.
 * @property forwardUrl. Keyword forward url to post incoming messages.
 * @property enabled. Whether keyword is enabled.
 * @property created. Creation date.
 * @property lastModified. Last modified date.
 * @property customProperties. Custom properties associated with keyword. Will be propagated to incoming messages.
 * @property tags. Tags associated with keyword. Can be used for statistics and grouping.
 * @property aliases. Alias keywords associated with keyword.
 * @property preAuthSettings. Preauth settings.
 */
export default interface Keyword {
	keywordId: String;
	shortNumberId: string;
	keywordText: string;
	mode: string;
	forwardUrl: string;
	enabled: boolean;
	created: Date;
	lastModified: Date;
	customProperties: object;
	tags: string[];
	aliases: string[];
	preAuthSettings: PreAuthSettings;
}