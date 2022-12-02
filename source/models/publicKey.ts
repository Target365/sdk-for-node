/**
 * @property accountId. Account id.
 * @property name. Key name.
 * @property publicKeyString. Public key in DER(ANS.1) base64 format.
 * @property signAlgo. Signature algorithm.
 * @property hashAlgo. Hash algorithm.
 * @property created. Created time.
 * @property lastModified. Last modified time.
 * @property notUsableBefore. Not-usable-before time.
 * @property expiry. Expiry time.
 */
export default interface PublicKey {
	accountId: bigint;
	name: string;
	publicKeyString: string;
	signAlgo: string;
	hashAlgo: string;
	created: Date;
	lastModified: Date;
	notUsableBefore: Date;
	expiry: Date;
}