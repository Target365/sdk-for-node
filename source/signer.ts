const ECKey = require('ec-key');
const asn = require('asn1.js');
const sha2 = require('sha2');
import moment from 'moment';
import { v4 as uuidv4 } from "uuid";

export class Signer {
	private privateKey: any;
	private asn1: any;

	constructor(ecPrivateKeyAsString: string) {
		this.privateKey = new ECKey(ecPrivateKeyAsString.replace('-----BEGIN EC PRIVATE KEY-----', '').replace('-----END EC PRIVATE KEY-----', '')
			.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\n/g, ''), 'pkcs8');

		this.asn1 = {
			ecdsaDerSig: asn.define('ECPrivateKey', function (this: typeof asn) {
				this.seq().obj(this.key('r').int(), this.key('s').int())
			})
		};
	}

	public Sign(message: any): string {
		const buffer = this.privateKey.createSign('SHA256').update(message).sign('buffer');
		const { r, s } = this.asn1.ecdsaDerSig.decode(buffer, 'der')

		let rb = r.toBuffer();
		while (rb.length !== 32) {
			rb = Buffer.concat([Buffer.alloc(1).fill(0), rb]);
		}

		let sb = s.toBuffer();
		while (sb.length !== 32) {
			sb = Buffer.concat([Buffer.alloc(1).fill(0), sb]);
		}

		return Buffer.concat([rb, sb]).toString('base64');
	};

	public SignHeader(key: string, method: string, uri: string, content: any) {
		const timestamp = moment().unix();
		const nonce = uuidv4();
		const hash = content === '' ? '' : sha2.sha256(content).toString('base64');
		const message = method.toLowerCase() + uri.toLowerCase() + timestamp + nonce + hash;

		return 'HMAC ' + key + ':' + timestamp + ':' + nonce + ':' + this.Sign(message);
	};
}