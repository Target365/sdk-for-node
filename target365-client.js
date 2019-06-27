const uuidv4 = require('uuid/v4');
const fetch = require('node-fetch');
const moment = require('moment');
const joi = require('joi');

const asn = require('asn1.js');
const sha2 = require('sha2');
const BN = require('bn.js');
const ECKey = require('ec-key');

const asn1 = {
    /**
     * ASN.1 ECDSA DER signature definition
     */
    ecdsaDerSig: asn.define('ECPrivateKey', function () {
        return this.seq().obj(this.key('r').int(), this.key('s').int())
    })
};

/**
 * Creates a signer
 *
 * @param ecPrivateKeyAsString Private key as a string in PKCS#8 format
 *
 * @returns Signer
 */
function Signer(ecPrivateKeyAsString) {
    // Remove technical information and whitespaces, before parsing a key
    const key = new ECKey(ecPrivateKeyAsString.replace('-----BEGIN EC PRIVATE KEY-----', '').replace('-----END EC PRIVATE KEY-----', '')
        .replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\n/g, ''), 'pkcs8');

    /**
     * Signs message and returns signature string
     *
     * @param message Message to sign
     *
     * @returns Message signature in base64 format
     */
    this.sign = (message) => {
        const buffer = key.createSign('SHA256').update(message).sign('buffer');
        const { r, s } = asn1.ecdsaDerSig.decode(buffer, 'der')

        // Pad r and s with 0 to length 32
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

    /**
     * Signs header and returns signature string
     *
     * @param key Key
     * @param method Reqyest method GET/POST?PUT/DELETE
     * @param uri Request URI
     * @param content Content to be sent in request body
     *
     * @return Message signature in base64 format
     */
    this.signHeader = (key, method, uri, content) => {
        const timestamp = moment().unix();
        const nonce = uuidv4();
        const hash = content === '' ? '' : sha2.sha256(content).toString('base64');
        const message = method.toLowerCase() + uri.toLowerCase() + timestamp + nonce + hash;

        return 'HMAC ' + key + ':' + timestamp + ':' + nonce + ':' + this.sign(message);
    };
}

/**
 * Creates a verifier
 *
 * @param ecPublicKeyAsString Public key as a string in SPKI format
 *
 * @returns Verifier
 */
function Verifier(ecPublicKeyAsString) {
    // Remove technical information and whitespaces, before parsing a key
    const key = new ECKey(ecPublicKeyAsString.replace('-----BEGIN EC PUBLIC KEY-----', '').replace('-----END EC PUBLIC KEY-----', '')
        .replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').replace(/\n/g, ''), 'spki');

    /**
     * Verifies message and returns true or false
     *
     * @param message Message to verify
     * @param sign Message signature
     *
     * @returns True/False
     */
    this.verify = (message, sign) => {
        const buffer = Buffer.from(sign, 'base64');
        const r = new BN(buffer.slice(0, 32).toString('hex'), 16, 'be')
        const s = new BN(buffer.slice(32).toString('hex'), 16, 'be')

        return key.createVerify('SHA256').update(message).verify(asn1.ecdsaDerSig.encode({ r, s }, 'der'), 'base64');
    };

    /**
     * Verifies header and returns true or false
     *
     * @param method Reqyest method GET/POST/PUT/DELETE
     * @param uri Request URI
     * @param timestamp Message timestamp
     * @param nonce Nonce
     * @param content Content to be sent in request body
     * @param sign Message signature
     *
     * @return Message signature in base64 format
     */
    this.verifyHeader = (method, uri, timestamp, nonce, content, sign) => {
        const hash = content === '' ? '' : sha2.sha256(content).toString('base64');

        return this.verify(method.toLowerCase() + uri.toLowerCase() + timestamp + nonce + hash, sign);
    };
};

/**
 * Creates a param
 */
function Param(key, value) {
    const k = key;
    const v = value;

    this.getKey = () => {
        return k;
    };

    this.getValue = () => {
        return v;
    }
}

/**
 * Creates a client
 *
 * @param ecPrivateKeyAsString Private key as a string in PKCS#8 format
 * @param parameters Map of parameters { baseUrl, keyName }
 *
 * @returns Verifier
 */
function Client(ecPrivateKeyAsString, parameters) {
    const signer = new Signer(ecPrivateKeyAsString);
    const keyName = parameters.keyName;
    const baseUrl = parameters.baseUrl;

    const handle = (handler) => {
        if (handler) {
            return handler;
        } else {
            return (response) => response.json().then((json) => {
                return {
                    error: 'InvalidResponse',
                    status: response.status,
                    message: json
                }
            });
        }
    };

    const validate = (object, schema, callback) => {
        return new Promise((resolve, reject) => {
            joi.validate(object, schema, { abortEarly: false }, (error) => {
                if (error) {
                    resolve({
                        error: 'InvalidInput',
                        constraints: error.details.map((detail) => detail.message)
                    });
                } else {
                    resolve(callback());
                }
            });
        });
    };

    /**
     * Performs standard GET call to the server
     *
     * @param path Path to be called (should not include base URL)
     * @param parameters Arrays of parameters to be sent in the query string
     * @param handlers Map of response handlers based on the response status {200: (response) => {...}, 404: (response) => {...}}
     *
     * @return Promise, which when resolves, contains a response
     */
    const doGet = (path, parameters, handlers) => {
        const params = parameters.map((parameter) => parameter.getKey() + '=' + encodeURIComponent(parameter.getValue())).join('&');
        const uri = baseUrl + path + (params ? '?' + params : '');
        const authorization = signer.signHeader(keyName, 'get', uri, '');

        return fetch(uri, {
            method: 'get',
            headers: {
                'Authorization': authorization
            }
        }).then((response) => handle(handlers[response.status])(response));
    };

    /**
     * Performs standard POST call to the server
     *
     * @param path Path to be called (should not include base URL)
     * @param content Body to be sent with the request as a json string
     * @param handlers Map of response handlers based on the response status {200: (response) => {...}, 404: (response) => {...}}
     *
     * @return Promise, which when resolves, contains a response
     */
    const doPost = (path, content, handlers) => {
        const uri = baseUrl + path;
        const authorization = signer.signHeader(keyName, 'post', uri, content);

        return fetch(uri, {
            method: 'post',
            headers: {
                'Authorization': authorization
            },
            body: content
        }).then((response) => handle(handlers[response.status])(response));
    };

    /**
     * Performs standard PUT call to the server
     *
     * @param path Path to be called (should not include base URL)
     * @param content Body to be sent with the request as a json string
     * @param handlers Map of response handlers based on the response status {200: (response) => {...}, 404: (response) => {...}}
     *
     * @return Promise, which when resolves, contains a response
     */
    const doPut = (path, content, handlers) => {
        const uri = baseUrl + path;
        const authorization = signer.signHeader(keyName, 'put', uri, content);

        return fetch(uri, {
            method: 'put',
            headers: {
                'Authorization': authorization
            },
            body: content
        }).then((response) => handle(handlers[response.status])(response));
    };

    /**
     * Performs standard DELETE call to the server
     *
     * @param path Path to be called (should not include base URL)
     * @param handlers Map of response handlers based on the response status {200: (response) => {...}, 404: (response) => {...}}
     *
     * @return Promise, which when resolves, contains a response
     */
    const doDelete = (path, handlers) => {
        const uri = baseUrl + path;
        const authorization = signer.signHeader(keyName, 'delete', uri, '');

        return fetch(uri, {
            method: 'delete',
            headers: {
                'Authorization': authorization
            }
        }).then((response) => handle(handlers[response.status])(response));
    };

    /**
     * Provides a signer associated with this Client
     */
    this.getSigner = () => {
        return signer;
    };

    /**
     * Performs a test to see if the service endpoint is responding.
     *
     * @return A simple string response.
     */
    this.ping = () => {
        return doGet('api/ping', [], {
            200: (response) => response.json()
        });
    };

    /**
     * Lists all keywords.
     *
     * @param parameters Object, with the next strcuture:
     * {
     *   shortNumberId, // Filter for short number id (exact string match).
     *   keywordText, // Filter for keyword text (contains match).
     *   mode, // Filter for mode (exact string match).
     *   tag // Filter for tag (exact string match).
     * }
     *
     * @return Lists of all keywords.
     */
    this.getKeywords = (parameters) => {
        const object = parameters;

        const schema = joi.object().keys({
            shortNumberId: joi.string().optional(),
            keywordText: joi.string().optional(),
            mode: joi.string().optional().valid('Text', 'Wildcard', 'Regex'),
            tag: joi.string().optional()
        });

        return validate(object, schema, () => {
            const params = parameters ? [new Param('shortNumberId', parameters.shortNumberId), new Param('keywordText', parameters.keywordText),
            new Param('mode', parameters.mode), new Param('tag', parameters.tag)].filter((parameter) => parameter.getValue()) : [];

            return doGet('api/keywords', params, {
                200: (response) => response.json()
            });
        });
    };

    /**
     * Posts a new keyword.
     *
     * @param keyword Keyword object to post, with the next structure:
     * {
     *   keywordId, // Keyword id returned by Target365.
     *   shortNumberId, // Short number associated with keyword.
     *   keywordText, // Keyword text.
     *   mode, // Keyword mode. Can be 'Text', 'Wildcard' or 'Regex'.
     *   forwardUrl, // Keyword forward url to post incoming messages.
     *   enabled, // Whether keyword is enabled.
     *   created, // Creation date.
     *   lastModified, // Last modified date.
     *   customProperties, // Custom properties associated with keyword. Will be propagated to incoming messages.
     *   tags // Tags associated with keyword. Can be used for statistics and grouping.
     * }
     *
     * @return Resource uri of created keyword.
     */
    this.postKeyword = (keyword) => {
        const object = {
            keyword: keyword
        };

        const schema = joi.object().keys({
            keyword: joi.object().keys({
                keywordId: joi.string().optional(),
                shortNumberId: joi.string().required(),
                keywordText: joi.string().required(),
                mode: joi.string().required().valid('Text', 'Wildcard', 'Regex'),
                forwardUrl: joi.string().required(),
                enabled: joi.boolean().required(),
                created: joi.string().optional(),
                lastModified: joi.string().optional(),
                customProperties: joi.object().optional(),
                tags: joi.array().optional()
            }).required()
        });

        return validate(object, schema, () => doPost('api/keywords', JSON.stringify(keyword), {
            201: (response) => response.headers.get('location').substring(response.headers.get('location').lastIndexOf('/') + 1)
        }));
    };

    /**
     * Gets a keyword.
     *
     * @param keywordId Keyword id.
     *
     * @return A keyword.
     */
    this.getKeyword = (keywordId) => {
        const object = {
            keywordId: keywordId
        };

        const schema = joi.object().keys({
            keywordId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/keywords/' + encodeURIComponent(keywordId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Updates a keyword.
     *
     * @param keyword Keyword object to post, with the next structure:
     * {
     *   keywordId, // Keyword id returned by Target365.
     *   shortNumberId, // Short number associated with keyword.
     *   keywordText, // Keyword text.
     *   mode, // Keyword mode. Can be 'Text', 'Wildcard' or 'Regex'.
     *   forwardUrl, // Keyword forward url to post incoming messages.
     *   enabled, // Whether keyword is enabled.
     *   created, // Creation date.
     *   lastModified, // Last modified date.
     *   customProperties, // Custom properties associated with keyword. Will be propagated to incoming messages.
     *   tags // Tags associated with keyword. Can be used for statistics and grouping.
     * }
     *
     * @return No content
     */
    this.putKeyword = (keyword) => {
        const object = {
            keyword: keyword
        };

        const schema = joi.object().keys({
            keyword: joi.object().keys({
                keywordId: joi.string().required(),
                shortNumberId: joi.string().required(),
                keywordText: joi.string().required(),
                mode: joi.string().required().valid('Text', 'Wildcard', 'Regex'),
                forwardUrl: joi.string().required(),
                enabled: joi.boolean().required(),
                created: joi.string().optional(),
                lastModified: joi.string().optional(),
                customProperties: joi.object().optional(),
                tags: joi.array().optional()
            }).required()
        });

        return validate(object, schema, () => doPut('api/keywords/' + encodeURIComponent(keyword.keywordId), JSON.stringify(keyword), {
            204: (response) => ''
        }));
    };

    /**
     * Deletes a keyword.
     *
     * @param keywordId Keyword id.
     *
     * @return No content
     */
    this.deleteKeyword = (keywordId) => {
        const object = {
            keywordId: keywordId
        };

        const schema = joi.object().keys({
            keywordId: joi.string().required()
        });

        return validate(object, schema, () => doDelete('api/keywords/' + encodeURIComponent(keywordId), {
            204: (response) => ''
        }));
    };

    /**
     * Lookup a phone number.
     *
     * @param msisdn Phone number in international format with a leading plus e.g. '+4798079008'.
     *
     * @return Lookup result.
     */
    this.addressLookup = (msisdn) => {
        const object = {
            msisdn: msisdn
        };

        const schema = joi.object().keys({
            msisdn: joi.string().required()
        });

        return validate(object, schema, () => {
            const params = [new Param('msisdn', msisdn)].filter((parameter) => parameter.getValue());

            return doGet('api/lookup', params, {
                200: (response) => response.json(),
                404: (response) => null
            });
        });
    };

    /**
     * Prepare MSISDNs for later sendings. This can greatly improve routing performance.
     *
     * @param msisdns MSISDNs to prepare as a string array.
     *
     * @return No content
     */
    this.prepareMsisdns = (msisdns) => {
        const object = {
            msisdns: msisdns
        };

        const schema = joi.object().keys({
            msisdns: joi.array().items(joi.string().required()).required()
        });

        return validate(object, schema, () => doPost('api/prepare-msisdns', JSON.stringify(msisdns), {
            204: (response) => ''
        }));
    }

    /**
     * Posts a new batch of up to 100 out-messages.
     *
     * @param outMessages Out-messages to post. Out-message structure:
     * {
     *   transactionId, // Transaction id. Must be unique per message if used. This can be used for guarding against resending messages.
     *   correlationId, // Correlation id. This can be used as the clients correlation id for tracking messages and delivery reports.
     *   keywordId, // Keyword id associated with message. Can be null.
     *   sender, // Sender. Can be an alphanumeric string, a phone number or a short number.
     *   recipient, // Recipient phone number.
     *   content, // Content. The actual text message content.
     *   sendTime, // Send time, in UTC. If omitted the send time is set to ASAP.
     *   timeToLive, // Message Time-To-Live (TTL) in minutes. Must be between 5 and 1440. Default value is 120.
     *   priority, // Priority. Can be 'Low', 'Normal' or 'High'. If omitted, default value is 'Normal'.
     *   deliveryMode, // Message delivery mode. Can be either 'AtLeastOnce' or 'AtMostOnce'. If omitted, default value is 'AtMostOnce'.
     *   merchantId, // Merchant id. Only used for STREX messages.
     *   serviceCode, // Service code. Only used for STREX messages.
     *   invoiceText, // Invoice text. Only used for STREX messages.
     *   price, // Price. Only used for STREX messages.
     *   deliveryReportUrl, // Delivery report url.
     *   allowUnicode, // True to allow unicode SMS, false to fail if content is unicode, null to replace unicode chars to '?'.
     *   lastModified, // Last modified time.
     *   created, // Created time.
     *   statusCode, // Delivery status code. Can be 'Queued', 'Sent', 'Failed', 'Ok' or 'Reversed'
     *   delivered, // Whether message was delivered. Null if status is unknown.
     *   billed, // Whether billing was performed. Null if status is unknown.
     *   tags // Tags associated with message. Can be used for statistics and grouping.
     * }
     *
     * @return List of resource uri of created out-message.
     */
    this.postOutMessageBatch = (outMessages) => {
        const object = {
            outMessages: outMessages
        };

        const schema = joi.object().keys({
            outMessages: joi.array().items(joi.object().keys({
                transactionId: joi.string().optional(),
                correlationId: joi.string().optional(),
                keywordId: joi.string().optional(),
                sender: joi.string().required(),
                recipient: joi.string().required(),
                content: joi.string().required(),
                sendTime: joi.string().optional(),
                timeToLive: joi.number().integer().optional(),
                priority: joi.string().optional().valid('Low', 'Normal', 'High'),
                deliveryMode: joi.string().optional().valid('AtLeastOnce', 'AtMostOnce'),
                strex: joi.object().keys({
                    merchantId: joi.string().required(),
                    serviceCode: joi.string().required(),
                    invoiceText: joi.string().required(),
                    price: joi.number().required()
                }).optional(),
                deliveryReportUrl: joi.string().optional(),
                allowUnicode: joi.boolean().optional(),
                lastModified: joi.string().optional(),
                created: joi.string().optional(),
                statusCode: joi.string().optional().valid('Queued', 'Sent', 'Failed', 'Ok', 'Reversed'),
                delivered: joi.boolean().optional(),
                billed: joi.boolean().optional(),
                tags: joi.array().optional()
            }).required()).required()
        });

        return validate(object, schema, () => doPost('api/out-messages/batch', JSON.stringify(outMessages), {
            201: (response) => outMessages.map((outMessage) => outMessage.transactionId)
        }));
    };

    /**
     * Posts a new out-message.
     *
     * @param outMessage Out-message to post, with the next structure:
     * {
     *   transactionId, // Transaction id. Must be unique per message if used. This can be used for guarding against resending messages.
     *   correlationId, // Correlation id. This can be used as the clients correlation id for tracking messages and delivery reports.
     *   keywordId, // Keyword id associated with message. Can be null.
     *   sender, // Sender. Can be an alphanumeric string, a phone number or a short number.
     *   recipient, // Recipient phone number.
     *   content, // Content. The actual text message content.
     *   sendTime, // Send time, in UTC. If omitted the send time is set to ASAP.
     *   timeToLive, // Message Time-To-Live (TTL) in minutes. Must be between 5 and 1440. Default value is 120.
     *   priority, // Priority. Can be 'Low', 'Normal' or 'High'. If omitted, default value is 'Normal'.
     *   deliveryMode, // Message delivery mode. Can be either 'AtLeastOnce' or 'AtMostOnce'. If omitted, default value is 'AtMostOnce'.
     *   merchantId, // Merchant id. Only used for STREX messages.
     *   serviceCode, // Service code. Only used for STREX messages.
     *   invoiceText, // Invoice text. Only used for STREX messages.
     *   price, // Price. Only used for STREX messages.
     *   deliveryReportUrl, // Delivery report url.
     *   allowUnicode, // True to allow unicode SMS, false to fail if content is unicode, null to replace unicode chars to '?'.
     *   lastModified, // Last modified time.
     *   created, // Created time.
     *   statusCode, // Delivery status code. Can be 'Queued', 'Sent', 'Failed', 'Ok' or 'Reversed'
     *   delivered, // Whether message was delivered. Null if status is unknown.
     *   billed, // Whether billing was performed. Null if status is unknown.
     *   tags // Tags associated with message. Can be used for statistics and grouping.
     * }
     *
     * @return Resource uri of created out-message.
     */
    this.postOutMessage = (outMessage) => {
        const object = {
            outMessage: outMessage
        };

        const schema = joi.object().keys({
            outMessage: joi.object().keys({
                transactionId: joi.string().optional(),
                correlationId: joi.string().optional(),
                keywordId: joi.string().optional(),
                sender: joi.string().required(),
                recipient: joi.string().required(),
                content: joi.string().required(),
                sendTime: joi.string().optional(),
                timeToLive: joi.number().integer().optional(),
                priority: joi.string().optional().valid('Low', 'Normal', 'High'),
                deliveryMode: joi.string().optional().valid('AtLeastOnce', 'AtMostOnce'),
                strex: joi.object().keys({
                    merchantId: joi.string().required(),
                    serviceCode: joi.string().required(),
                    invoiceText: joi.string().required(),
                    price: joi.number().required()
                }).optional(),
                deliveryReportUrl: joi.string().optional(),
                allowUnicode: joi.boolean().optional(),
                lastModified: joi.string().optional(),
                created: joi.string().optional(),
                statusCode: joi.string().optional().valid('Queued', 'Sent', 'Failed', 'Ok', 'Reversed'),
                delivered: joi.boolean().optional(),
                billed: joi.boolean().optional(),
                tags: joi.array().optional()
            }).required()
        });

        return validate(object, schema, () => doPost('api/out-messages', JSON.stringify(outMessage), {
            201: (response) => response.headers.get('location').substring(response.headers.get('location').lastIndexOf('/') + 1)
        }));
    };

    /**
     * Gets an out-message.
     *
     * @param transactionId Message transaction id.
     *
     * @return An out-message.
     */
    this.getOutMessage = (transactionId) => {
        const object = {
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/out-messages/' + encodeURIComponent(transactionId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Updates a future scheduled out-message.
     *
     * @param outMessage Text message to post, with the next structure:
     * {
     *   transactionId, // Transaction id. Must be unique per message if used. This can be used for guarding against resending messages.
     *   correlationId, // Correlation id. This can be used as the clients correlation id for tracking messages and delivery reports.
     *   keywordId, // Keyword id associated with message. Can be null.
     *   sender, // Sender. Can be an alphanumeric string, a phone number or a short number.
     *   recipient, // Recipient phone number.
     *   content, // Content. The actual text message content.
     *   sendTime, // Send time, in UTC. If omitted the send time is set to ASAP.
     *   timeToLive, // Message Time-To-Live (TTL) in minutes. Must be between 5 and 1440. Default value is 120.
     *   priority, // Priority. Can be 'Low', 'Normal' or 'High'. If omitted, default value is 'Normal'.
     *   deliveryMode, // Message delivery mode. Can be either 'AtLeastOnce' or 'AtMostOnce'. If omitted, default value is 'AtMostOnce'.
     *   merchantId, // Merchant id. Only used for STREX messages.
     *   serviceCode, // Service code. Only used for STREX messages.
     *   invoiceText, // Invoice text. Only used for STREX messages.
     *   price, // Price. Only used for STREX messages.
     *   deliveryReportUrl, // Delivery report url.
     *   lastModified, // Last modified time.
     *   created, // Created time.
     *   statusCode, // Delivery status code. Can be 'Queued', 'Sent', 'Failed', 'Ok' or 'Reversed'
     *   delivered, // Whether message was delivered. Null if status is unknown.
     *   billed, // Whether billing was performed. Null if status is unknown.
     *   tags // Tags associated with message. Can be used for statistics and grouping.
     * }
     *
     * @return No content
     */
    this.putOutMessage = (outMessage) => {
        const object = {
            outMessage: outMessage
        };

        const schema = joi.object().keys({
            outMessage: joi.object().keys({
                transactionId: joi.string().required(),
                correlationId: joi.string().optional(),
                keywordId: joi.string().optional(),
                sender: joi.string().required(),
                recipient: joi.string().required(),
                content: joi.string().required(),
                sendTime: joi.string().optional(),
                timeToLive: joi.number().integer().optional(),
                priority: joi.string().optional().valid('Low', 'Normal', 'High'),
                deliveryMode: joi.string().optional().valid('AtLeastOnce', 'AtMostOnce'),
                strex: joi.object().keys({
                    merchantId: joi.string().required(),
                    serviceCode: joi.string().required(),
                    invoiceText: joi.string().required(),
                    price: joi.number().required()
                }).optional(),
                deliveryReportUrl: joi.string().optional(),
                lastModified: joi.string().optional(),
                created: joi.string().optional(),
                statusCode: joi.string().optional().valid('Queued', 'Sent', 'Failed', 'Ok', 'Reversed'),
                delivered: joi.boolean().optional(),
                billed: joi.boolean().optional(),
                tags: joi.array().optional()
            }).required()
        });

        return validate(object, schema, () => doPut('api/out-messages/' + encodeURIComponent(outMessage.transactionId), JSON.stringify(outMessage), {
            204: (response) => ''
        }));
    };

    /**
     * Deletes a future scheduled out-message.
     *
     * @param transactionId Message transaction id.
     *
     * @return No content
     */
    this.deleteOutMessage = (transactionId) => {
        const object = {
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doDelete('api/out-messages/' + encodeURIComponent(transactionId), {
            204: (response) => ''
        }));
    };

    /**
     * Gets an in-message.
     *
     * @param shortNumberId Short number id.
     * @param transactionId Message transaction id.
     *
     * @return An in-message.
     */
    this.getInMessage = (shortNumberId, transactionId) => {
        const object = {
            shortNumberId: shortNumberId,
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            shortNumberId: joi.string().required(),
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/in-messages/' + encodeURIComponent(shortNumberId) + '/' + encodeURIComponent(transactionId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Lists all strex merchant ids.
     *
     * @return Lists all registered strex merchant ids.
     */
    this.getMerchantIds = () => {
        return doGet('api/strex/merchants', [], {
            200: (response) => response.json()
        });
    };

    /**
     * Gets a strex merchant id.
     *
     * @param merchantId Strex merchant id.
     *
     * @return A strex merchant id.
     */
    this.getMerchantId = (merchantId) => {
        const object = {
            merchantId: merchantId
        };

        const schema = joi.object().keys({
            merchantId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/strex/merchants/' + encodeURIComponent(merchantId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Updates or creates a new merchant id.
     *
     * @param strexMerchantId Merchant object to post, with the next structure:
     * {
     *   merchantId, // Strex merchant id.
     *   shortNumberId, // Short number id.
     *   password // This is a write-only property and will always return null.
     * }
     *
     * @return No content
     */
    this.putMerchantId = (strexMerchantId) => {
        const object = {
            strexMerchantId: strexMerchantId
        };

        const schema = joi.object().keys({
            strexMerchantId: joi.object().keys({
                merchantId: joi.string().required(),
                shortNumberIds: joi.array().items(joi.string()).required(),
                password: joi.string().optional(),
            }).required()
        });

        return validate(object, schema, () => doPut('api/strex/merchants/' + encodeURIComponent(strexMerchantId.merchantId), JSON.stringify(strexMerchantId), {
            204: (response) => ''
        }));
    };

    /**
     * Deletes a merchant id.
     *
     * @param merchantId Strex merchant id.
     *
     * @return No content
     */
    this.deleteMerchantId = (merchantId) => {
        const object = {
            merchantId: merchantId
        };

        const schema = joi.object().keys({
            merchantId: joi.string().required()
        });

        return validate(object, schema, () => doDelete('api/strex/merchants/' + encodeURIComponent(merchantId), {
            204: (response) => ''
        }));
    };

    /**
     * Creates a new one-time password.
     *
     * @param oneTimePassword Strex one-time password.
     * {
     *   transactionId, // Transaction id.
     *   merchantId, // Merchant id.
     *   recipient, // Recipient phone number.
     *   sender, // SMS Sender (originator).
     *   recurring, // Whether one-time password is for recurring payment.
     *   message, // One-time password message. This is prefixed to the generated password message.
     *   delivered, // Whether one-time password sms has been delivered. Null means unknown.
     * }
     *
     * @return Void
     */
    this.postStrexOneTimePassword = (oneTimePassword) => {
        const object = {
            oneTimePassword: oneTimePassword
        };

        const schema = joi.object().keys({
            oneTimePassword: joi.object().keys({
                transactionId: joi.string().required(),
                merchantId: joi.string().required(),
                recipient: joi.string().required(),
                sender: joi.string().optional(),
                recurring: joi.boolean().required(),
                message: joi.string().optional(),
                delivered: joi.boolean().optional()
            }).required()
        });

        return validate(object, schema, () => doPost('api/strex/one-time-passwords', JSON.stringify(oneTimePassword), {
            201: (response) => response.headers.get('location').substring(response.headers.get('location').lastIndexOf('/') + 1)
        }));
    };

    /**
     * Gets a strex one-time password.
     *
     * @param transactionId Transaction id.
     *
     * @return A strex one-time password.
     */
    this.getStrexOneTimePassword = (transactionId) => {
        const object = {
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/strex/one-time-passwords/' + encodeURIComponent(transactionId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Creates a new strex transaction.
     *
     * @param transaction Strex transaction.
     * {
     *   transactionId, // Transaction id. Must be unique per message if used. Can be used for guarding against resending messages.
     *   merchantId, // Merchant id.
     *   shortNumber, // Short number.
     *   recipient, // Recipient phone number.
     *   price, // Price.
     *   serviceCode, // Service code.
     *   invoiceText, // Invoice text.
     *   statusCode, // Status code. Can be 'Queued', 'Sent', 'Failed', 'Ok' or 'Reversed'
     *   sessionId, // Session id. Can be used as the clients to get all out-messages associated to a specific session.
     *   correlationId, // Correlation id. Can be used as the clients correlation id for tracking messages and delivery reports.
     *   oneTimePassword, // One-Time-Password. Used with previously sent one-time-passwords.
     *   billed, // Read-only: Whether billing has been performed. Null means unknown status.
     *   created, // Created time. Read-only property.
     *   lastModified, // Last modified time. Read-only property.
     * }
     *
     * @return Void
     */
    this.postStrexTransaction = (transaction) => {
        const object = {
            transaction: transaction
        };

        const schema = joi.object().keys({
            transaction: joi.object().keys({
                transactionId: joi.string().required(),
                merchantId: joi.string().required(),
                shortNumber: joi.string().required(),
                recipient: joi.string().required(),
                price: joi.number().required(),
                serviceCode: joi.string().required(),
                invoiceText: joi.string().required(),
                statusCode: joi.string().optional().valid('Queued', 'Sent', 'Failed', 'Ok', 'Reversed'),
                sessionId: joi.string().optional(),
                correlationId: joi.string().optional(),
                oneTimePassword: joi.string().optional(),
                billed: joi.boolean().optional(),
                created: joi.string().optional(),
                lastModified: joi.string().optional()
            }).required()
        });

        return validate(object, schema, () => doPost('api/strex/transactions', JSON.stringify(transaction), {
            201: (response) => response.headers.get('location').substring(response.headers.get('location').lastIndexOf('/') + 1)
        }));
    };

    /**
     * Gets a strex transaction.
     *
     * @param transactionId Transaction id.
     *
     * @return A strex transaction.
     */
    this.getStrexTransaction = (transactionId) => {
        const object = {
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/strex/transactions/' + encodeURIComponent(transactionId), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Reverses a previous strex transaction.
     *
     * @param transactionId Transaction id.
     *
     * @return Resource uri of reversed transaction.
     */
    this.reverseStrexTransaction = (transactionId) => {
        const object = {
            transactionId: transactionId
        };

        const schema = joi.object().keys({
            transactionId: joi.string().required()
        });

        return validate(object, schema, () => doDelete('api/strex/transactions/' + encodeURIComponent(transactionId), {
            201: (response) => response.headers.get('location').substring(response.headers.get('location').lastIndexOf('/') + 1)
        }));
    };

    /**
     * Verifies signature
     *
     * @param method Method
     * @param uri URI
     * @param content Content
     * @param xEcdsaSignatureString X-ECDSA signature as a string
     *
     * @return True/False
     */
    this.verifySignature = (method, uri, content, xEcdsaSignatureString) => {
        const objectBefore = {
            method: method,
            uri: uri,
            content: content,
            xEcdsaSignatureString: xEcdsaSignatureString
        };

        const schemaBefore = joi.object().keys({
            method: joi.string().required(),
            uri: joi.string().required(),
            content: joi.string().allow(''),
            xEcdsaSignatureString: joi.string().required().regex(/^[A-Za-z0-9_-]+:[0-9]+:[A-Za-z0-9_-]+:[A-Za-z0-9_+/=]+$/)
        });

        return validate(objectBefore, schemaBefore, () => {
            const parts = xEcdsaSignatureString.split(':');
            const keyName = parts[0];
            const timestamp = parts[1];
            const nonce = parts[2];
            const sign = parts[3];

            const objectAfter = {
                keyName: keyName,
                timestamp: timestamp,
                nonce: nonce,
                sign: sign
            };

            const schemaAfter = joi.object().keys({
                keyName: joi.string().required(),
                timestamp: joi.number().required().greater(moment().subtract(5, 'minutes').unix()),
                nonce: joi.string().required(),
                sign: joi.string().required()
            });

            return validate(objectAfter, schemaAfter, () => doGet('api/public-key/' + encodeURIComponent(keyName), [], {
                200: (response) => response.json()
            }).then((json) => new Verifier(json.publicKeyString).verifyHeader(method, uri, timestamp, content, sign)));
        });
    };

    /**
     * Gets a server public key.
     *
     * @param keyName Public key name.
     *
     * @return A server public key.
     */
    this.getServerPublicKey = (keyName) => {
        const object = {
            keyName: keyName
        };

        const schema = joi.object().keys({
            keyName: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/server/public-keys/' + encodeURIComponent(keyName), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Gets all client public key.
     *
     * @return Lists all client public key.
     */
    this.getClientPublicKeys = () => {
        return doGet('api/client/public-keys', [], {
            200: (response) => response.json()
        });
    };

    /**
     * Gets a client public key.
     *
     * @param keyName Public key name.
     *
     * @return A client public key.
     */
    this.getClientPublicKey = (keyName) => {
        const object = {
            keyName: keyName
        };

        const schema = joi.object().keys({
            keyName: joi.string().required()
        });

        return validate(object, schema, () => doGet('api/client/public-keys/' + encodeURIComponent(keyName), [], {
            200: (response) => response.json(),
            404: (response) => null
        }));
    };

    /**
     * Deletes a client public key.
     *
     * @param keyName Public key name.
     *
     * @return Void
     */
    this.deleteClientPublicKey = (keyName) => {
        const object = {
            keyName: keyName
        };

        const schema = joi.object().keys({
            keyName: joi.string().required()
        });

        return validate(object, schema, () => doDelete('api/client/public-keys/' + encodeURIComponent(keywordId), {
            204: (response) => ''
        }));
    };
};

module.exports = Client;
