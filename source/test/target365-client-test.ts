const expect = require('chai').expect;
import { Target365Client } from '../target365-client';
import { readFileSync } from 'fs';
import { v4 as uuidv4 } from "uuid";
import moment from 'moment';
import Keyword from "../models/keyword";
import OneClickConfig from "../models/oneClickConfig";
import OneTimePassword from "../models/oneTimePassword";
import OutMessage from "../models/outMessage";
import StrexTransaction from "../models/strexTransaction";

describe('', () => {
	const baseUrl = 'https://test.target365.io/';
	const keyName = 'NodeSKDTestKey';
	const privateKey = readFileSync('./source/test/private.key', 'utf8');
	const client = new Target365Client(baseUrl, keyName, privateKey);

	describe('Keyword', () => {
		it('keyword should be created, updated and deleted', () => {
			let keyword = {
				keywordId: '',
				shortNumberId: 'NO-0000',
				keywordText: 'node-sdk-test-keyword-text-0001',
				mode: 'Text',
				forwardUrl: 'https://www.node-sdk-test-keyword-text-0001.com',
				enabled: true
			} as Keyword;

			// Delete keyword if it exists (data cleanup)
			return client.getKeywordsAsync(keyword.shortNumberId, keyword.keywordText)
				.then((keywords) => Promise.all(keywords.map(k => client.deleteKeywordAsync(k.keywordId))))
				// Create keyword
				.then(() => client.createKeywordAsync(keyword))
				.then((keywordId) => keyword.keywordId = keywordId)
				// Read keyword
				.then(() => client.getKeywordAsync(keyword.keywordId))
				// Verify created keyword
				.then((created) => {
					expect(created.shortNumberId).to.equal(keyword.shortNumberId);
					expect(created.keywordText).to.equal(keyword.keywordText);
					expect(created.mode).to.equal(keyword.mode);
					expect(created.forwardUrl).to.equal(keyword.forwardUrl);
					expect(created.enabled).to.equal(keyword.enabled);
				})
				// Update keyword
				.then(() => client.updateKeywordAsync({
					keywordId: keyword.keywordId,
					shortNumberId: keyword.shortNumberId,
					keywordText: keyword.keywordText,
					mode: keyword.mode,
					forwardUrl: keyword.forwardUrl + '-test',
					enabled: keyword.enabled
				} as Keyword))
				// Read keyword
				.then(() => client.getKeywordAsync(keyword.keywordId))
				// Verify updated keyword
				.then((updated) => {
					expect(updated.shortNumberId).to.equal(keyword.shortNumberId);
					expect(updated.keywordText).to.equal(keyword.keywordText);
					expect(updated.mode).to.equal(keyword.mode);
					expect(updated.forwardUrl).to.equal(keyword.forwardUrl + '-test');
					expect(updated.enabled).to.equal(keyword.enabled);
				})
				// Delete keyword
				.then(() => client.deleteKeywordAsync(keyword.keywordId))
				//Verify deleted keyword
				.then(() => client.getKeywordsAsync(null, keyword.keywordText))
				.then((keywords) => {
					expect(JSON.stringify(keywords)).to.equal('[]');
				});
		});
	});

	describe('Lookup', () => {
		it('address should be looked up', () => {
			return client.getLookupAsync('+4798079008').then((lookupResult) => {
				expect(lookupResult.msisdn).to.equal("+4798079008");
				expect(lookupResult.firstName).to.equal('Hans');
				expect(lookupResult.lastName).to.equal('Stjernholm');
				expect(lookupResult.gender).to.equal('M');
			});
		});
	});

	describe('InMessage', () => {
		it('in-message should be read', () => {
			client.getInMessageAsync('NO-0000', '79f35793-6d70-423c-a7f7-ae9fb1024f3b').then((inMessage) => {
				expect(inMessage.transactionId).to.equal('79f35793-6d70-423c-a7f7-ae9fb1024f3b');
				expect(inMessage.keywordId).to.equal('102');
				expect(inMessage.sender).to.equal('+4798079008');
				expect(inMessage.recipient).to.equal('0000');
				expect(inMessage.content).to.equal('Test');
				expect(inMessage.isStopMessage).to.equal(false);
			});
		});
	});

	describe('OutMessage', () => {
		it('out-message should be created, updated and deleted', () => {
			let outMessage = {
				sender: 'Target365',
				recipient: '+4798079008',
				content: 'OutMessage 0001',
				sendTime: moment().add(1, 'days').toDate()
			} as OutMessage;

			// Create out-message
			return client.createOutMessageAsync(outMessage)
				.then((transactionId) => outMessage.transactionId = transactionId)
				// Read out-message
				.then(() => client.GetOutMessageAsync(outMessage.transactionId))
				// Verify created out-message
				.then((created) => {
					expect(created.sender).to.equal(outMessage.sender);
					expect(created.recipient).to.equal(outMessage.recipient);
					expect(created.content).to.equal(outMessage.content);
					expect(created.transactionId).to.equal(outMessage.transactionId);
				})
				// Update out-message
				.then(() => client.updateOutMessageAsync({
					transactionId: outMessage.transactionId,
					sender: outMessage.sender,
					recipient: outMessage.recipient,
					content: outMessage.content + '-test',
					sendTime: outMessage.sendTime
				} as OutMessage))
				// Read out-message
				.then(() => client.GetOutMessageAsync(outMessage.transactionId))
				// Verify updated out-message
				.then((updated) => {
					expect(updated.sender).to.equal(outMessage.sender);
					expect(updated.recipient).to.equal(outMessage.recipient);
					expect(updated.content).to.equal(outMessage.content + '-test');
					expect(updated.transactionId).to.equal(outMessage.transactionId);
				})
				// Delete out-message
				.then(() => client.deleteOutMessageAsync(outMessage.transactionId));
		});
	});

	describe('OutMessageBatch', () => {
		it('out-message-batch should be created and deleted', () => {
			let outMessageForBatch = {
				sender: 'BatchSender',
				recipient: '+4798079008',
				content: 'OutMessageBatch 0001',
				sendTime: moment().add(1, 'days').toDate(),
				transactionId: uuidv4()
			} as OutMessage;

			// Create out-message-batch
			return client.createOutMessageBatchAsync([outMessageForBatch])
				// Read out-message
				.then(() => setTimeout(() => {
					client.GetOutMessageAsync(outMessageForBatch.transactionId)
						// Verify created out-message
						.then((created) => {
							expect(created.sender).to.equal(outMessageForBatch.sender);
							expect(created.recipient).to.equal(outMessageForBatch.recipient);
							expect(created.content).to.equal(outMessageForBatch.content);
							expect(created.transactionId).to.equal(outMessageForBatch.transactionId);
						})
				}, 1000))
				// Delete out-message-batch
				.then(() => client.deleteOutMessageAsync(outMessageForBatch.transactionId));
		});
	});

	describe('OutMessageExport', () => {
		it('out-message export should contain CSV data', () => {
			let from = moment().add(-3, 'days').toDate();
			let to = moment().add(-2, 'days').toDate();

			client.getOutMessageExportAsync(from, to)
				.then((csv) => {
					expect(csv.startsWith("SendTime,Sender,Recipient,RecipientPrefix,MessageParts,StatusCode,DetailedStatusCode,Operator,Tags")).to.equal(true);
				});
		});
	});

	describe('prepareMsisdns', () => {
		it('Prepare msisdns', () => {
			let msisdn = '+4798079008';

			client.prepareMsisdnsAsync([msisdn]);
		});
	});

	describe('Strex', () => {
		it('strex one time password should be created and verified', () => {
			let oneTimePassword = {
				transactionId: uuidv4(),
				merchantId: 'NodeSdkTest',
				recipient: '+4798079008',
				recurring: false
			} as OneTimePassword;

			// Create strex one time password
			return client.createOneTimePasswordAsync(oneTimePassword)
				.then(() => setTimeout(() => {
					client.getOneTimePasswordAsync(oneTimePassword.transactionId).then((created) => {
						expect(created).to.not.equal(null);
						expect(created.transactionId).to.equal(oneTimePassword.transactionId);
						expect(created.merchantId).to.equal(oneTimePassword.merchantId);
						expect(created.recipient).to.equal(oneTimePassword.recipient);
						expect(created.recurring).to.equal(oneTimePassword.recurring);
					})
				}, 1000));
		});

		it('strex transaction should be created, verified and reversed', () => {
			let strexTransaction = {
				transactionId: uuidv4(),
				merchantId: 'NodeSdkTest',
				shortNumber: '0000',
				recipient: '+4798079008',
				price: 10,
				timeout: 10,
				serviceCode: '10001',
				businessModel: 'STREX-PAYMENT',
				age: 0,
				isRestricted: false,
				invoiceText: 'Test Invoice Text'
			} as StrexTransaction;

			// Create strex transaction
			return client.createStrexTransactionAsync(strexTransaction)
				.then(() => client.getStrexTransactionAsync(strexTransaction.transactionId))
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
				.then(() => client.reverseStrexTransactionAsync(strexTransaction.transactionId))
				.then(() => setTimeout(() => {
					client.getStrexTransactionAsync('-' + strexTransaction.transactionId)
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
				}, 1000));
		});

		it('one-click config should be saved and verified', () => {
			let oneClickConfig = {
				configId: 'NodeSdkTest',
				shortNumber: '0000',
				price: 99,
				merchantId: 'NodeSdkTest',
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
			} as OneClickConfig;

			return client.saveOneClickConfigAsync(oneClickConfig)
				.then(() => client.getOneClickConfigAsync(oneClickConfig.configId))
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
				});
		});

		it('strex user validity should be full', () => {
			return client.getStrexValidityAsync('+4799031520', 'NodeSdkTest')
				.then((userValidity) => {
					expect(userValidity).to.equal('Full');
				});
		});

		it('merchantId should be verified', () => {
			return client.getMerchantAsync('NodeSdkTest')
				.then((merchant) => {
					expect(merchant.merchantId).to.equal('NodeSdkTest');
				});
		});
	});
});