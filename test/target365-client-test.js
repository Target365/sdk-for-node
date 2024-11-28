const fs = require('fs');
const expect = require('chai').expect;
const uuid = require('uuid');
const moment = require('moment');

const Client = require('../target365-client.js');

/**
 * Reads key from file as a string
 *
 * @param path Path to a key
 * @returns Promise, which resolves to a key as a string
 */
const readKey = (path) => new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, key) => resolve(key));
});

describe('', () => {
    let client;

    before(async () => {
        client = await Promise.all([readKey('./test/private.key'), readKey('./test/public.key')]).then(([ecPrivateKeyAsString, ecPublicKeyAsString]) => {
            return new Client(ecPrivateKeyAsString, {
                baseUrl: 'https://test.target365.io/',
                keyName: 'NodeSdkTest2024'
            })
        });
    });

    describe('Ping', () => {
        it('pong should be returned', () => {
            // Ping
            return client.ping().then((pong) => expect(pong).to.equal('pong'));
        });
    });

    describe('Keyword', () => {
        describe('Integration', () => {
            it('keyword should be created, updated and deleted', () => {
                let keyword = {
                    shortNumberId: 'NO-0000',
                    keywordText: 'node-sdk-test-keyword-text-0001',
                    mode: 'Text',
                    forwardUrl: 'https://www.node-sdk-test-keyword-text-0001.com',
                    enabled: true
                };

                // Delete keyword if it exists (data cleanup)
                return client.getKeywords({ keywordText: keyword.keywordText })
                    .then((keywords) => Promise.all(keywords.map(k => client.deleteKeyword(k.keywordId))))
                    // Create keyword
                    .then(() => client.postKeyword(keyword))
                    .then((keywordId) => keyword.keywordId = keywordId)
                    // Read keyword
                    .then(() => client.getKeyword(keyword.keywordId))
                    // Verify created keyword
                    .then((created) => {
                        expect(created.shortNumberId).to.equal(keyword.shortNumberId);
                        expect(created.keywordText).to.equal(keyword.keywordText);
                        expect(created.mode).to.equal(keyword.mode);
                        expect(created.forwardUrl).to.equal(keyword.forwardUrl);
                        expect(created.enabled).to.equal(keyword.enabled);
                    })
                    // Update keyword
                    .then(() => client.putKeyword({
                        keywordId: keyword.keywordId,
                        shortNumberId: keyword.shortNumberId,
                        keywordText: keyword.keywordText,
                        mode: keyword.mode,
                        forwardUrl: keyword.forwardUrl + '-test',
                        enabled: keyword.enabled
                    }))
                    // Read keyword
                    .then(() => client.getKeyword(keyword.keywordId))
                    // Verify updated keyword
                    .then((updated) => {
                        expect(updated.shortNumberId).to.equal(keyword.shortNumberId);
                        expect(updated.keywordText).to.equal(keyword.keywordText);
                        expect(updated.mode).to.equal(keyword.mode);
                        expect(updated.forwardUrl).to.equal(keyword.forwardUrl + '-test');
                        expect(updated.enabled).to.equal(keyword.enabled);
                    })
                    // Delete keyword
                    .then(() => client.deleteKeyword(keyword.keywordId))
                    // Verify deleted keyword
                    .then(() => client.getKeyword(keyword.keywordId))
                    .then((deleted) => {
                        expect(deleted).to.equal(null);
                    });
            });
        });

        describe('Validation', () => {
            describe('getKeywords()', () => {
                it('mode should be one of Text, Wildcard, Regex', () => {
                    return client.getKeywords({ mode: 'Invalid Mode Value' }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"mode" must be one of [Text, Wildcard, Regex]']);
                    });
                });
            });

            describe('postKeyword()', () => {
                it('keyword should be required', () => {
                    return client.postKeyword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyword" is required']);
                    });
                });

                it('keyword.shortNumberId, keyword.keywordText, keyword.mode, keyword.forwardUrl, keyword.enabled should be required', () => {
                    return client.postKeyword({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"shortNumberId" is required', '"keywordText" is required', '"mode" is required', '"forwardUrl" is required', '"enabled" is required']);
                    });
                });

                it('keyword.shortNumberId, keyword.keywordText, keyword.forwardUrl should not be blank', () => {
                    return client.postKeyword({
                        shortNumberId: '',
                        keywordText: '',
                        mode: 'Text',
                        forwardUrl: ''
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"shortNumberId" is not allowed to be empty', '"keywordText" is not allowed to be empty', '"forwardUrl" is not allowed to be empty', '"enabled" is required']);
                    });
                });

                it('keyword.mode should be one of Text, Wildcard, Regex', () => {
                    return client.postKeyword({
                        shortNumberId: 'ShortNumberId',
                        keywordText: 'KeywordText',
                        mode: 'Invalid Mode Value',
                        forwardUrl: 'ForwardUrl',
                        enabled: true
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"mode" must be one of [Text, Wildcard, Regex]']);
                    });
                });
            });

            describe('getKeyword()', () => {
                it('keywordId should be required', () => {
                    return client.getKeyword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is required']);
                    });
                });

                it('keywordId should not be blank', () => {
                    return client.getKeyword('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is not allowed to be empty']);
                    });
                });
            });

            describe('putKeyword()', () => {
                it('keyword should be required', () => {
                    return client.putKeyword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyword" is required']);
                    });
                });

                it('keyword.keywordId, keyword.shortNumberId, keyword.keywordText, keyword.mode, keyword.forwardUrl, keyword.enabled should be required', () => {
                    return client.putKeyword({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is required', '"shortNumberId" is required', '"keywordText" is required', '"mode" is required', '"forwardUrl" is required', '"enabled" is required']);
                    });
                });

                it('keyword.keywordId, keyword.shortNumberId, keyword.keywordText, keyword.forwardUrl should not be blank', () => {
                    return client.putKeyword({
                        keywordId: '',
                        shortNumberId: '',
                        keywordText: '',
                        mode: 'Regex',
                        forwardUrl: '',
                        enabled: true
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is not allowed to be empty', '"shortNumberId" is not allowed to be empty', '"keywordText" is not allowed to be empty', '"forwardUrl" is not allowed to be empty']);
                    });
                });

                it('keyword.mode should be one of Text, Wildcard, Regex', () => {
                    return client.putKeyword({
                        keywordId: 'KeywordId',
                        shortNumberId: 'ShortNumberId',
                        keywordText: 'KeywordText',
                        mode: 'Invalid Mode Value',
                        forwardUrl: 'ForwardUrl'
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"mode" must be one of [Text, Wildcard, Regex]', '"enabled" is required']);
                    });
                });
            });

            describe('deleteKeyword()', () => {
                it('keywordId should be required', () => {
                    return client.deleteKeyword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is required']);
                    });
                });

                it('keywordId should not be blank', () => {
                    return client.deleteKeyword('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keywordId" is not allowed to be empty']);
                    });
                });
            });
        });
    });

    describe('Lookup', () => {
        describe('Integration', () => {
            it('address should be looked up', () => {
                let msisdn = '+4798079008';

                // Lookup and verify address
                return client.addressLookup(msisdn).then((lookupResult) => {
                    expect(lookupResult.msisdn).to.equal("+4798079008");
                    expect(lookupResult.firstName).to.equal('Hans');
                    expect(lookupResult.lastName).to.equal('Stjernholm');
                    expect(lookupResult.gender).to.equal('M');
                });
            });
        });

        describe('Validation', () => {
            describe('addressLookup()', () => {
                it('msisdn should be required', () => {
                    return client.addressLookup().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"msisdn" is required']);
                    });
                });

                it('msisdn should not be blank', () => {
                    return client.addressLookup('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"msisdn" is not allowed to be empty']);
                    });
                });
            });
        });
    });

    describe('FreetextLookup', () => {
        describe('Integration', () => {
            it('address should be looked up', () => {
                let freetext = '+4798079008';

                // Lookup and verify address
                return client.freetextLookup(freetext).then((lookupResults) => {
                    expect(lookupResults[0].msisdn).to.equal("+4798079008");
                    expect(lookupResults[0].firstName).to.equal('Hans');
                    expect(lookupResults[0].lastName).to.equal('Stjernholm');
                    expect(lookupResults[0].gender).to.equal('M');
                });
            });
        });

        describe('Validation', () => {
            describe('freetextLookup()', () => {
                it('freetext should be required', () => {
                    return client.freetextLookup().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"freetext" is required']);
                    });
                });
            });
        });
    });

    describe('OutMessage', () => {
        describe('Integration', () => {
            it('out-message should be created, updated and deleted', () => {
                let msisdn = '+4798079008';

                let outMessageForBatch = {
                    sender: 'BatchSender',
                    recipient: '+4798079008',
                    content: 'OutMessageBatch 0001',
                    sendTime: moment().add(1, 'days').format(),
                    transactionId: uuid.v4()
                };

                let outMessage = {
                    sender: 'Target365',
                    recipient: '+4798079008',
                    content: 'OutMessage 0001',
                    sendTime: moment().add(1, 'days').format(),
                    transactionId: uuid.v4()
                };

                // Create out-message
                return client.postOutMessage(outMessage)
                    .then((transactionId) => outMessage.transactionId = transactionId)
                    // Read out-message
                    .then(() => client.getOutMessage(outMessage.transactionId))
                    // Verify created out-message
                    .then((created) => {
                        expect(created.sender).to.equal(outMessage.sender);
                        expect(created.recipient).to.equal(outMessage.recipient);
                        expect(created.content).to.equal(outMessage.content);
                        expect(created.transactionId).to.equal(outMessage.transactionId);
                    })
                    // Update out-message
                    .then(() => client.putOutMessage({
                        transactionId: outMessage.transactionId,
                        sender: outMessage.sender,
                        recipient: outMessage.recipient,
                        content: outMessage.content + ' (updated)',
                        sendTime: outMessage.sendTime
                    }))
                    // Read out-message
                    .then(() => client.getOutMessage(outMessage.transactionId))
                    // Verify updated out-message
                    .then((updated) => {
                        expect(updated.sender).to.equal(outMessage.sender);
                        expect(updated.recipient).to.equal(outMessage.recipient);
                        expect(updated.content).to.equal(outMessage.content + ' (updated)');
                        expect(updated.transactionId).to.equal(outMessage.transactionId);
                    })
                    // Delete out-message batch
                    .then(() => client.deleteOutMessage(outMessageForBatch.transactionId))
                    // Verify deleted out-message batch
                    .then(() => client.getOutMessage(outMessageForBatch.transactionId))
                    .then((deletedBatch) => {
                        expect(deletedBatch).to.equal(null);
                    })
                    // Delete out-message batch
                    .then(() => client.deleteOutMessage(outMessage.transactionId))
                    // Verify deleted out-message batch
                    .then(() => client.getOutMessage(outMessage.transactionId))
                    .then((deleted) => {
                        expect(deleted).to.equal(null);
                    });
            });

            // Out-message export
            it('out-message export should contain CSV data', () => {
                let from = moment().add(-3, 'days').format();
                let to = moment().add(-2, 'days').format();

                client.getOutMessageExport(from, to)
                    .then((csv) => {
                        expect(csv.startsWith("SendTime,Sender,Recipient,RecipientPrefix,MessageParts,StatusCode,DetailedStatusCode,Operator,Tags")).to.equal(true);
                    });
            });
        });

        describe('Validation', () => {
            describe('prepareMsisdns()', () => {
                it('msisdns should be required', () => {
                    return client.prepareMsisdns().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"msisdns" is required']);
                    });
                });

                it('msisdns should contain at least 1 item', () => {
                    return client.prepareMsisdns([]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"msisdns" does not contain 1 required value(s)']);
                    });
                });

                it('msisdns item should not be blank', () => {
                    return client.prepareMsisdns(['']).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"0" is not allowed to be empty', '"msisdns" does not contain 1 required value(s)']);
                    });
                });
            });

            describe('postOutMessageBatch()', () => {
                it('outMessages should be required', () => {
                    return client.postOutMessageBatch().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"outMessages" is required']);
                    });
                });

                it('outMessages should contain at least 1 item', () => {
                    return client.postOutMessageBatch([]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"outMessages" does not contain 1 required value(s)']);
                    });
                });

                it('outMessages[0].sender, outMessages[0].recipient, outMessages[0].content should be required', () => {
                    return client.postOutMessageBatch([{}]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"sender" is required', '"recipient" is required', '"content" is required', '"outMessages" does not contain 1 required value(s)']);
                    });
                });

                it('outMessages[0].sender, outMessages[0].recipient, outMessages[0].content should not be blank', () => {
                    return client.postOutMessageBatch([{ sender: '', recipient: '', content: '' }]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"sender" is not allowed to be empty', '"recipient" is not allowed to be empty', '"content" is not allowed to be empty', '"outMessages" does not contain 1 required value(s)']);
                    });
                });

                it('outMessages[0].priority should be one of Low, Normal, High', () => {
                    return client.postOutMessageBatch([{
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        priority: 'Invalid priority Value'
                    }]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"priority" must be one of [Low, Normal, High]', '"outMessages" does not contain 1 required value(s)']);
                    });
                });

                it('outMessages[0].deliveryMode should be one of AtLeastOnce, AtMostOnce', () => {
                    return client.postOutMessageBatch([{
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        deliveryMode: 'Invalid DeliveryMode Value'
                    }]).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"deliveryMode" must be one of [AtLeastOnce, AtMostOnce]', '"outMessages" does not contain 1 required value(s)']);
                    });
                });
            });

            describe('postOutMessage()', () => {
                it('outMessage should be required', () => {
                    return client.postOutMessage().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"outMessage" is required']);
                    });
                });

                it('outMessage.sender, outMessage.recipient, outMessage.content should be required', () => {
                    return client.postOutMessage({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"sender" is required', '"recipient" is required', '"content" is required']);
                    });
                });

                it('outMessage.sender, outMessage.recipient, outMessage.content should not be blank', () => {
                    return client.postOutMessage({ sender: '', recipient: '', content: '' }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"sender" is not allowed to be empty', '"recipient" is not allowed to be empty', '"content" is not allowed to be empty']);
                    });
                });

                it('outMessage.priority should be one of Low, Normal, High ', () => {
                    return client.postOutMessage({
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        priority: 'Invalid priority Value'
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"priority" must be one of [Low, Normal, High]']);
                    });
                });

                it('outMessage.deliveryMode should be one of AtLeastOnce, AtMostOnce', () => {
                    return client.postOutMessage({
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        deliveryMode: 'Invalid DeliveryMode Value'
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"deliveryMode" must be one of [AtLeastOnce, AtMostOnce]']);
                    });
                });

                it('outMessage.strex.merchantId, outMessage.strex.serviceCode, outMessage.strex.invoiceText, outMessage.strex.price should be required', () => {
                    return client.postOutMessage({
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        deliveryMode: 'AtLeastOnce',
                        strex: {}
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"merchantId" is required', '"serviceCode" is required', '"invoiceText" is required', '"price" is required']);
                    });
                });

                it('outMessage.strex.merchantId, outMessage.strex.serviceCode, outMessage.strex.invoiceText should not be blank', () => {
                    return client.postOutMessage({
                        sender: 'Sender',
                        recipient: 'Recipient',
                        content: 'Content',
                        deliveryMode: 'AtLeastOnce',
                        strex: {
                            "merchantId": "",
                            "serviceCode": "",
                            "invoiceText": "",
                            "price": 10,
                            "timeout": 10
                        }
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"merchantId" is not allowed to be empty', '"serviceCode" is not allowed to be empty', '"invoiceText" is not allowed to be empty']);
                    });
                });
            });

            describe('getOutMessage()', () => {
                it('transactionId should be required', () => {
                    return client.getOutMessage().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required']);
                    });
                });

                it('transactionId should not be blank', () => {
                    return client.getOutMessage('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty']);
                    });
                });
            });

            describe('putOutMessage()', () => {
                it('outMessage should be required', () => {
                    return client.putOutMessage().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"outMessage" is required']);
                    });
                });

                it('outMessage.transactionId, outMessage.sender, outMessage.recipient, outMessage.content should be required', () => {
                    return client.putOutMessage({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required', '"sender" is required', '"recipient" is required', '"content" is required']);
                    });
                });

                it('outMessage.transactionId, outMessage.sender, outMessage.recipient, outMessage.content should not be blank', () => {
                    return client.putOutMessage({
                        transactionId: '',
                        sender: '',
                        recipient: '',
                        content: ''
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty', '"sender" is not allowed to be empty', '"recipient" is not allowed to be empty', '"content" is not allowed to be empty']);
                    });
                });
            });

            describe('deleteOutMessage()', () => {
                it('transactionId should be required', () => {
                    return client.deleteOutMessage().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required']);
                    });
                });

                it('transactionId should not be blank', () => {
                    return client.deleteOutMessage('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty']);
                    });
                });
            });
        });
    });

    describe('InMessage', () => {
        describe('Integration', () => {
            it('in-message should be read', () => {
                // Read and verify in-message
                client.getInMessage('NO-0000', '79f35793-6d70-423c-a7f7-ae9fb1024f3b').then((inMessage) => {
                    expect(inMessage.transactionId).to.equal('79f35793-6d70-423c-a7f7-ae9fb1024f3b');
                    expect(inMessage.keywordId).to.equal('102');
                    expect(inMessage.sender).to.equal('+4798079008');
                    expect(inMessage.recipient).to.equal('0000');
                    expect(inMessage.content).to.equal('Test');
                    expect(inMessage.isStopMessage).to.equal(false);
                });
            });
        });

        describe('Validation', () => {
            describe('getInMessage()', () => {
                it('shortNumberId, transactionId should be required', () => {
                    return client.getInMessage().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"shortNumberId" is required', '"transactionId" is required',]);
                    });
                });

                it('shortNumberId, transactionId should not be blank', () => {
                    return client.getInMessage('', '').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"shortNumberId" is not allowed to be empty', '"transactionId" is not allowed to be empty']);
                    });
                });
            });
        });
    });

    describe('Strex', () => {
        describe('Integration', () => {
            it('strex one time password should be created and verified', () => {
                let strexOneTimePassword = {
                    transactionId: uuid.v4(),
                    merchantId: 'JavaSdkTest',
                    recipient: '+4798079008',
                    recurring: false
                };

                // Create strex one time password
                return client.postStrexOneTimePassword(strexOneTimePassword)
                    .then(() => client.getStrexOneTimePassword(strexOneTimePassword.transactionId))
                    // Verify created strex one time password
                    .then((created) => {
                        expect(created).to.not.equal(null);
                        expect(created.transactionId).to.equal(strexOneTimePassword.transactionId);
                        expect(created.merchantId).to.equal(strexOneTimePassword.merchantId);
                        expect(created.recipient).to.equal(strexOneTimePassword.recipient);
                        expect(created.recurring).to.equal(strexOneTimePassword.recurring);
                    });
            });

            it('strex transaction should be created, verified and reversed', () => {
                let strexTransaction = {
                    transactionId: uuid.v4(),
                    merchantId: 'JavaSdkTest',
                    shortNumber: '0000',
                    recipient: '+4798079008',
                    price: 10,
                    timeout: 10,
                    serviceCode: '10001',
                    businessModel: 'STREX-PAYMENT',
                    age: 0,
                    isRestricted: false,
                    invoiceText: 'Test Invoice Text'
                };

                // Create strex transaction
                return client.postStrexTransaction(strexTransaction)
                    .then(() => client.getStrexTransaction(strexTransaction.transactionId))
                    // Verify created strex transaction
                    .then((created) => {
                        expect(created.transactionId).to.equal(strexTransaction.transactionId);
                        expect(created.merchantId).to.equal(strexTransaction.merchantId);
                        expect(created.shortNumber).to.equal(strexTransaction.shortNumber);
                        expect(created.recipient).to.equal(strexTransaction.recipient);
                        expect(created.price).to.equal(strexTransaction.price);
                        expect(created.timeout).to.equal(strexTransaction.timeout);
                        expect(created.serviceCode).to.equal(strexTransaction.serviceCode);
                        expect(created.invoiceText).to.equal(strexTransaction.invoiceText);
                    })
                    // Reverse strex transaction
                    .then(() => client.reverseStrexTransaction(strexTransaction.transactionId))
                    .then(() => client.getStrexTransaction('-' + strexTransaction.transactionId))
                    // Verified reversed strex transaction
                    .then((reversed) => {
                        expect(reversed.transactionId).to.equal('-' + strexTransaction.transactionId);
                        expect(reversed.merchantId).to.equal(strexTransaction.merchantId);
                        expect(reversed.shortNumber).to.equal(strexTransaction.shortNumber);
                        expect(reversed.recipient).to.equal(strexTransaction.recipient);
                        expect(reversed.price).to.equal(-1 * strexTransaction.price);
                        expect(reversed.serviceCode).to.equal(strexTransaction.serviceCode);
                        expect(reversed.invoiceText).to.equal(strexTransaction.invoiceText);
                    })
            });

            it('one-click config should be saved and verified', () => {
                let oneClickConfig = {
                    configId: 'APITEST',
                    shortNumber: '0000',
                    price: 99,
                    merchantId: 'JavaSdkTest',
                    businessModel: 'STREX-PAYMENT',
                    preAuthServiceId: 'MyProduct',
                    serviceCode: '14002',
                    invoiceText: 'Donation test',
                    onlineText: 'Buy directly',
                    offlineText: 'Buy with SMS pincode',
                    redirectUrl: 'https://tempuri.org/node',
                    subscriptionPrice: 99,
                    subscriptionInterval: "monthly",
                    subscriptionStartSms: "Thanks for donating 99kr each month",
                    recurring: true,
                    isRestricted: false,
                    timeout: 5,
                    age: 0
                };

                return client.putOneClickConfig(oneClickConfig)
                    .then(() => client.getOneClickConfig(oneClickConfig.configId))
                    .then((fetched) => {
                        expect(fetched.configId).to.equal(oneClickConfig.configId);
                        expect(fetched.merchantId).to.equal(oneClickConfig.merchantId);
                        expect(fetched.businessModel).to.equal(oneClickConfig.businessModel);
                        expect(fetched.preAuthServiceId).to.equal(oneClickConfig.preAuthServiceId);
                        expect(fetched.shortNumber).to.equal(oneClickConfig.shortNumber);
                        expect(fetched.redirectUrl).to.equal(oneClickConfig.redirectUrl);
                        expect(fetched.price).to.equal(oneClickConfig.price);
                        expect(fetched.timeout).to.equal(oneClickConfig.timeout);
                        expect(fetched.serviceCode).to.equal(oneClickConfig.serviceCode);
                        expect(fetched.invoiceText).to.equal(oneClickConfig.invoiceText);
                        expect(fetched.recurring).to.equal(oneClickConfig.recurring);
                    })
            });

            it('strex user validity should be full', () => {
                return client.getStrexUserValidity('+4799031520', 'JavaSdkTest')
                    .then((userValidity) => {
                        expect(userValidity).to.equal('Full');
                    })
            });
        });

        describe('Validation', () => {
            describe('getMerchantId()', () => {
                it('merchantId should be required', () => {
                    return client.getMerchantId().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"merchantId" is required']);
                    });
                });

                it('merchantId should not be blank', () => {
                    return client.getMerchantId('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"merchantId" is not allowed to be empty']);
                    });
                });
            });

            describe('postStrexOneTimePassword()', () => {
                it('oneTimePassword should be required', () => {
                    return client.postStrexOneTimePassword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"oneTimePassword" is required']);
                    });
                });

                it('oneTimePassword.transactionId, oneTimePassword.merchantId, oneTimePassword.recipient, oneTimePassword.recurring should be required', () => {
                    return client.postStrexOneTimePassword({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required', '"merchantId" is required', '"recipient" is required', '"recurring" is required']);
                    });
                });

                it('oneTimePassword.transactionId, oneTimePassword.merchantId, oneTimePassword.recipient should not be blank', () => {
                    return client.postStrexOneTimePassword({
                        transactionId: '',
                        merchantId: '',
                        recipient: '',
                        recurring: false
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty', '"merchantId" is not allowed to be empty', '"recipient" is not allowed to be empty']);
                    });
                });
            });

            describe('getStrexOneTimePassword()', () => {
                it('transactionId should be required', () => {
                    return client.getStrexOneTimePassword().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required']);
                    });
                });

                it('transactionId should not be blank', () => {
                    return client.getStrexOneTimePassword('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty']);
                    });
                });
            });

            describe('postStrexTransaction()', () => {
                it('transaction should be required', () => {
                    return client.postStrexTransaction().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transaction" is required']);
                    });
                });

                it('transaction.transactionId, transaction.merchantId, transaction.shortNumber, transaction.recipient, transaction.price, transaction.serviceCode, transaction.invoiceText should be required', () => {
                    return client.postStrexTransaction({}).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required', '"shortNumber" is required', '"merchantId" is required', '"serviceCode" is required', '"invoiceText" is required', '"price" is required']);
                    });
                });

                it('transaction.transactionId, transaction.merchantId, transaction.shortNumber, transaction.recipient, transaction.serviceCode, transaction.invoiceText should not be blank', () => {
                    return client.postStrexTransaction({
                        transactionId: '',
                        merchantId: '',
                        shortNumber: '',
                        recipient: '',
                        price: 10,
                        timeout: 10,
                        serviceCode: '',
                        invoiceText: ''
                    }).then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty', '"shortNumber" is not allowed to be empty', '"recipient" is not allowed to be empty', '"merchantId" is not allowed to be empty', '"serviceCode" is not allowed to be empty', '"invoiceText" is not allowed to be empty']);
                    });
                });
            });

            describe('getStrexTransaction()', () => {
                it('transactionId should be required', () => {
                    return client.getStrexTransaction().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required']);
                    });
                });

                it('transactionId should not be blank', () => {
                    return client.getStrexTransaction('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty']);
                    });
                });
            });

            describe('reverseStrexTransaction()', () => {
                it('transactionId should be required', () => {
                    return client.reverseStrexTransaction().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is required']);
                    });
                });

                it('transactionId should not be blank', () => {
                    return client.reverseStrexTransaction('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"transactionId" is not allowed to be empty']);
                    });
                });
            });
        });
    });

    describe('PublicKey(s)', () => {
        describe('Integration', () => {
            it('server public key should be verified', () => {
                // TODO This function was never tested, as in order to invoke it, need to know name of the server public key
                // client.getServerPublicKey()
            });

            it('client public keys should be verified and deleted', () => {
                // Verify client public keys
                return client.getClientPublicKeys()
                    .then((clientPublicKeys) => {
                        let filteredClientPublicKeys = clientPublicKeys.filter(key => key.name.indexOf('NodeSdkTest2024') >= 0);
                        expect(filteredClientPublicKeys).to.have.lengthOf(1);

                        let clientPublicKey = filteredClientPublicKeys[0];
                        expect(clientPublicKey.publicKeyString).to.equal('MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElTQ+Camc4t1TnMNR7eftqJkSnQHW85woBpChpHZcy8AQXmU3wWI6qXZQdriMBwX28IZzlBHKRn73cD4RE0AwmQ==');
                        expect(clientPublicKey.signAlgo).to.equal('ECDsaP256');
                        expect(clientPublicKey.hashAlgo).to.equal('SHA256');
                    });

                // TODO This function was never tested, as if to delete client public key, there is not way to add it back easily
                // client.deleteClientPublicKey()
            });

            it('client public key should be verified', () => {
                // Verify client public key
                return client.getClientPublicKey('NodeSdkTest2024')
                    .then((clientPublicKey) => {
                        expect(clientPublicKey.publicKeyString).to.equal('MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElTQ+Camc4t1TnMNR7eftqJkSnQHW85woBpChpHZcy8AQXmU3wWI6qXZQdriMBwX28IZzlBHKRn73cD4RE0AwmQ==');
                        expect(clientPublicKey.signAlgo).to.equal('ECDsaP256');
                        expect(clientPublicKey.hashAlgo).to.equal('SHA256');
                    });
            });
        });

        describe('Validation', () => {
            describe('getServerPublicKey()', () => {
                it('keyName should be required', () => {
                    return client.getServerPublicKey().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is required']);
                    });
                });

                it('keyName should not be blank', () => {
                    return client.getServerPublicKey('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is not allowed to be empty']);
                    });
                });
            });

            describe('getClientPublicKey()', () => {
                it('keyName should be required', () => {
                    return client.getClientPublicKey().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is required']);
                    });
                });

                it('keyName should not be blank', () => {
                    return client.getClientPublicKey('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is not allowed to be empty']);
                    });
                });
            });

            describe('deleteClientPublicKey()', () => {
                it('keyName should be required', () => {
                    return client.deleteClientPublicKey().then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is required']);
                    });
                });

                it('keyName should not be blank', () => {
                    return client.deleteClientPublicKey('').then((response) => {
                        expect(response.error).to.equal('InvalidInput');
                        expect(response.constraints).to.deep.equal(['"keyName" is not allowed to be empty']);
                    });
                });
            });
        });

        describe('Pincode', () => {
          describe('Integration', () => {
            describe('pincode', () => {
              it('pincode should be created and verified', () => {
                let pincode = {
                  transactionId: uuid.v4(),
                  recipient: '+4798079008',
                  sender: 'Sender'
                };

                // Create pincode
                return client.postPincode(pincode)
                  .then(() => client.getOutMessage(pincode.transactionId))
                  .then((outMessage) => client.getPincodeVerification(pincode.transactionId, outMessage.content))
                  // Verify created user pincode
                  .then((result) => {
                    expect(result) == "true";
                  });
                });
             });
          });
       });
    });
});
