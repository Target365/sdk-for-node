# Node User Guide

## Table of Contents
* [Introduction](#introduction)
* [Setup](#setup)
    * [Target365Client](#target365client)
* [Text messages](#text-messages)
    * [Send an SMS](#send-an-sms)
    * [Set DeliveryReport URL for an SMS](#set-deliveryreport-url-for-an-sms)
    * [Add tags to message](#add-tags-to-message)
    * [Schedule an SMS for later sending](#schedule-an-sms-for-later-sending)
    * [Edit a scheduled SMS](#edit-a-scheduled-sms)
    * [Delete a scheduled SMS](#delete-a-scheduled-sms)
    * [Send batch](#send-batch)
    * [Delivery mode](#delivery-mode)
* [Payment transactions](#payment-transactions)
    * [Create a Strex payment transaction](#create-a-strex-payment-transaction)
    * [Create a Strex payment transaction with one-time password](#create-a-strex-payment-transaction-with-one-time-password)
    * [Reverse a Strex payment transaction](#reverse-a-strex-payment-transaction)
    * [Check status on Strex payment transaction](#check-status-on-strex-payment-transaction)
* [One-click](#one-click)
    * [One-click config](#one-click-config)
    * [Recurring transaction](#recurring-transaction)
* [Lookup](#lookup)
    * [Address lookup for mobile number](#address-lookup-for-mobile-number)
* [Keywords](#keywords)
    * [Create a keyword](#create-a-keyword)
    * [Delete a keyword](#delete-a-keyword)
* [Forwards](#forwards)
    * [SMS forward](#sms-forward)
    * [DLR forward](#dlr-forward)
    * [DLR status codes](#dlr-status-codes)
* [Pincodes](#pincodes)
    * [Send pincode](#send-pincode)
    * [Verify pincode](#verify-pincode)
* [Encoding and SMS length](#encoding-and-sms-length)
    * [Automatic character replacements](#automatic-character-replacements)
* [Pre-authorization](#pre-authorization)
   * [Pre-authorization via keyword](#pre-authorization-via-keyword)
   * [Pre-authorization via API](#pre-authorization-via-api)
   * [Rebilling with pre-authorization](#rebilling-with-pre-authorization)
* [Testing](#testing)
    * [Fake numbers](#fake-numbers)

## Introduction
The Target365 SDK gives you direct access to our online services like sending and receiving SMS, address lookup and Strex payment transactions.
The SDK provides an appropriate abstraction level for Node development and is officially support by Target365.
The SDK also implements very high security (ECDsaP256 HMAC).

## Setup
### Target365Client
```Node
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const Client = require('target365-sdk');

let baseUrl = "https://shared.target365.io/";
let keyName = "YOUR_KEY";
let privateKey = "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgzNTTnuXqcrI5uSEa\r\n...";
let serviceClient = new Client(privateKey, { baseUrl, keyName });
```
## Text messages

### Send an SMS
This example sends an SMS to 98079008 (+47 for Norway) from "Target365" with the text "Hello world from SMS!".
```Node
let outMessage = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello World from SMS!'
};

serviceClient.postOutMessage(outMessage);
```

### Set DeliveryReport URL for an SMS
This example sends an SMS and later a [DeliveryReport](#dlr-forward) will be posted at the url specified below.
```Node
let outMessage = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello World from SMS!',
    deliveryReportUrl: 'https://your.site.com/sms/dlr'
};

serviceClient.postOutMessage(outMessage);
```

### Add tags to message
This example show how to add tags to a message that can be used for statistics and grouping. Hierachies can be created with /. In the future, tags may only contain a-z0-9. Urls are allowed as an exception, so that '//' doesn't make hierarchy.
```Node
let outMessage = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello World from SMS!',
    tags: ["tag1", "grouping:group/subgroup/tag2"]
};

serviceClient.postOutMessage(outMessage);
```

### Schedule an SMS for later sending
This example sets up a scheduled SMS. Scheduled messages can be updated or deleted before the time of sending.
```Node
let outMessage = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello World from SMS!',
    sendTime: moment().add(1, 'hours').format()
};

serviceClient.postOutMessage(outMessage);
```

### Edit a scheduled SMS
This example updates a previously created scheduled SMS.
```Node
let outMessage = serviceClient.getOutMessage(transactionId);
outMessage.SendTime = moment().add(1, 'hours').format();
outMessage.Content += " An hour later! :)";

serviceClient.putOutMessageAsync(outMessage);
```

### Delete a scheduled SMS
This example deletes a previously created scheduled SMS.
```Node
serviceClient.deleteOutMessage(transactionId);
```

### Send batch
This example sends a batch of messages in one operation.
Batches behave logically the same way as if you would send each message by itself and is offered only for performance reasons. Here are the limitations and restrictions when it comes to using batches:
* You can have up to 10 000 messages per batch operation.
* Each message in the batch must have a unique TransactionId, otherwise the operation will fail.
* If one or more messages have errors (like invalid recipient etc.) only those messages will fail, the rest will be processed normally.
* If you want a status per message you have to set the DeliveryReportUrl on each message.
```Node
let outMessage1 = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello!'
};

let outMessage2 = {
    transactionId: uuidv4(),
    sender: 'Target365',
    recipient: '+4798079008',
    content: 'Hello again!'
};

serviceClient.postOutMessageBatch([outMessage1, outMessage2]);
```

### Delivery mode
We support explicitly specifying delivery mode AtMostOnce or AtLeastOnce via the deliveryMode property.
* AtMostOnce delivery mode means that for a message processed by our platform, that message is delivered once or not at all. In more casual terms it means that the message may be lost.
* AtLeastOnce delivery mode means that for a message processed by our platform, potentially multiple attempts are made at delivering it, such that at least one succeeds. In more casual terms this means that the message may be duplicated but not lost.

AtMostOnce and AtLeastOnce delivery mode is only in effect in extreme edge cases where we've lost connection to an operator with a request mid-flight and have no way of knowing whether the message was delivered or not.

## Payment transactions
If your service requires a minimum age of the End User, each payment transaction should be defined with minimum age. Both StrexTransaction and OutMessage have a property named “Age”. If not set or present in the request, there is no age limit.

### Create a Strex payment transaction
This example creates a 1 NOK Strex payment transaction that the end user will confirm by replying "OK" to an SMS from Strex.

```Node
let transaction = {
    transactionId: uuidv4(),
    merchantId: 'YOUR_MERCHANT_ID',
    shortNumber: '2002',
    recipient: '+4798079008',
    price: 1,
    serviceCode: '10001',
    invoiceText: 'Donation test',
    smsConfirmation: true
};

serviceClient.postStrexTransaction(transaction);
```

### Create a Strex payment transaction with one-time password
This example creates a Strex one-time password sent to the end user and get completes the payment by using the one-time password.
You can use MessagePrefix and MessageSuffix to influence the start and end of the SMS sent by Strex. In the Test Environment - with endpoint https://test.target365.io - the OTP is always 1234.
```Node
let transactionId = uuidv4();

let oneTimePassword = {
    transactionId: transactionId,
    merchantId: 'YOUR_MERCHANT_ID',
    recipient: '+4798079008',
    messagePrefix: 'Dear customer...',
    messageSuffix: 'Best regards...',
    recurring: false
};

serviceClient.postStrexOneTimePassword(oneTimePassword);

// *** Get input from end user (eg. via web site) ***

let transaction = {
    transactionId: transactionId,
    merchantId: 'YOUR_MERCHANT_ID',
    shortNumber: '2002',
    recipient: '+4798079008',
    price: 1,
    serviceCode: '10001',
    invoiceText: 'Donation test',
    oneTimePassword: 'ONE_TIME_PASSWORD_FROM_USER',
};

serviceClient.postStrexTransaction(transaction);
```

### Reverse a Strex payment transaction
This example reverses a previously billed Strex payment transaction. The original transaction will not change,
but a reversal transaction will be created that counters the previous transaction by a negative Price.
The reversal is an asynchronous operation that usually takes a few seconds to finish.
```Node
let reversalTransactionId = serviceClient.reverseStrexTransaction(transactionId);
```

### Check status on Strex payment transaction
This example gets a previously created Strex transaction to check its status. This method will block up to 20 seconds if the transaction is still being processed.
```Node
let transaction = serviceClient.getStrexTransaction(transactionId);
let statusCode = transaction.statusCode;
```

## One-click

Please note:

* The OneClick service will not stop same MSISDN to order several times as long as transactionID is unique. If end users order or subscribe several times to same service it's the merchants responsibility to refund the end user.

* Recurring billing is initiated by merchants, see section [Payment transactions](#payment-transactions) for more info.

* Since the one-click flow ends by redirecting the end user to an external merchant-controlled URL we recommend that merchants implement a mechanism to check status on all started transactions. If there’s any issue for the end user on their way to the last page they might have finished the payment, but not been able to get their product.


### One-click config
This example sets up a one-click config which makes it easier to handle campaigns in one-click where most properties like merchantId, price et cetera are known in advance. You can redirect the end-user to the one-click campaign page by redirecting to http://betal.strex.no/{YOUR-CONFIG-ID} for PROD and http://test-strex.target365.io/{YOUR-CONFIG-ID} for TEST-environment. You can also set the TransactionId by adding ?id={YOUR-TRANSACTION-ID} to the URL.

```Node
let config = {
    configId: 'YOUR_CONFIG_ID',
    shortNumber: '2002',
    price: 99,
    merchantId: 'YOUR_MERCHANT_ID',
    businessModel: 'STREX-PAYMENT',
    serviceCode: '14002',
    invoiceText: 'Donation test',
    onlineText: 'Buy directly',
    offlineText: 'Buy with SMS pincode',
    redirectUrl: 'https://your-return-url.com?id={TransactionId}', // {TransactionId} is replaced by actual id
    subscriptionInterval: 'monthly',
    subscriptionPrice: 99,
    subscriptionStartSms: 'Thanks for donating 99kr each month.'
    recurring: true,
    isRestricted: false,
    timeout: 5,
    age: 0
};

serviceClient.putOneClickConfig(config);
```

If Recurring is set to 'false', the following parameters are optional:

* subscriptionInterval - Possible values are "weekly", "monthly", "yearly"

* subscriptionPrice - How much the subscriber will be charged each interval

This parameter is optional:

* subscriptionStartSms - SMS that will be sent to the user when subscription starts.

### Recurring transaction
This example sets up a recurring transaction for one-click. After creation you can immediately get the transaction to get the status code - the server will wait up to 20 seconds for the async transaction to complete.
![Recurring sequence](https://github.com/Target365/sdk-for-net/raw/master/oneclick-recurring-flow.png "Recurring sequence diagram")
```Node
let transaction = {
    transactionId: transactionId,
    recipient: "RECIPIENT_FROM_SUBSCRIPTION_TRANSACTION",
    merchantId: 'YOUR_MERCHANT_ID',
    shortNumber: '2002',
    price: 1,
    serviceCode: '10001',
    invoiceText: 'Donation test'
};

serviceClient.postStrexTransaction(transaction);
transaction = serviceClient.getStrexTransaction(transactionId);

// TODO: Check transaction.StatusCode
```

## Lookup

### Address lookup for mobile number
This example looks up address information for the mobile number 98079008. Lookup information includes registered name and address.
```Node
let lookup = serviceClient.addressLookup("+4798079008");
let firstName = lookup.firstName;
let lastName = lookup.lastName;
```

## Keywords

### Create a keyword
This example creates a new keyword on short number 2002 that forwards incoming SMS messages to 2002
that starts with "HELLO" to the URL "https://your-site.net/api/receive-sms".
```Node
let keyword = {
    shortNumberId: 'NO-2002',
    keywordText: 'HELLO',
    mode: 'Startswith',
    forwardUrl: 'https://your-site.net/api/receive-sms',
    enabled: true
};

let keywordId = serviceClient.postKeyword(keyword);
```

### Delete a keyword
This example deletes a keyword.
```Node
serviceClient.deleteKeyword(keywordId);
```
## Forwards

### SMS forward
This example shows how SMS messages are forwarded to the keywords ForwardUrl. All sms forwards expects a response with status code 200 (OK). If the request times out or response status code differs the forward will be retried several times.
#### Request
```http
POST https://your-site.net/api/receive-sms HTTP/1.1
Content-Type: application/json
Host: your-site.net

{
  "transactionId":"00568c6b-7baf-4869-b083-d22afc163059",
  "created":"2019-02-07T21:11:00+00:00",
  "sender":"+4798079008",
  "recipient":"2002",
  "content":"HELLO"
}
```

#### Response
```http
HTTP/1.1 200 OK
Date: Thu, 07 Feb 2019 21:13:51 GMT
Content-Length: 0
```

### DLR forward
This example shows how delivery reports (DLR) are forwarded to the outmessage DeliveryReportUrl. All DLR forwards expect a response with status code 200 (OK). If the request times out or response status code differs, the forward will be retried 19 times with exponentially longer intervals, for approximately 48 hours.
#### Request
```http
POST https://your-site.net/api/receive-dlr HTTP/1.1
Content-Type: application/json
Host: your-site.net

{
    "correlationId": null,
    "transactionId": "client-specified-id-5c88e736bb4b8",
    "price": null,
    "sender": "Target365",
    "recipient": "+4798079008",
    "operatorId": "no.telenor",
    "statusCode": "Ok",
    "detailedStatusCode": "Delivered",
    "delivered": true,
    "billed": null,
    "smscTransactionId": "16976c7448d",
    "smscMessageParts": 1
}
```

#### Response
```http
HTTP/1.1 200 OK
Date: Thu, 07 Feb 2019 21:13:51 GMT
Content-Length: 0
```

### DLR status codes
Delivery reports contains two status codes, one overall called `StatusCode` and one detailed called `DetailedStatusCode`.

#### StatusCode values
|Value|Description|
|:---|:---|
|Queued|Message is in a queue and has not been delivered, internally in our platform. Normally there should be very few with this status.|
|Sent|The message has been delivered to the recipient's operator, but we have not received any final status and do not know the final outcome. Status may change if we receive confirmation from the operator.|
|Failed|Message has not been delivered, unfortunately we have not received a more detailed delivery description.|
|Ok|message has been delivered/billed|
|Reversed|Message billing has been reversed|

#### DetailedStatusCode values
|Value|Description|
|:---|:---|
|None|Message has no status|
|Delivered|Message is delivered to destination|
|Expired|The message has not been delivered and the "lifetime" of the message has expired. Standard "lifetime" (time we try to deliver a message) is set to 2 hours, this can be overwritten if you are technically integrated. The billing has not been completed and a potential message has not been delivered. The TimeToLive of the billing has expired. Standard TimeToLive (time we try to charge) varies from method og action, some can be overwritten if you are technically integrated.|
|Undelivered|Message has not been delivered, unfortunately we have not received a more detailed delivery description.|
|UnknownError|Obsolete. Replaced by OtherError|
|Failed|Message has not been delivered, unfortunately we have not received a more detailed delivery description.|
|CardPSPError|The billing has not been completed. The end user has uploaded a bank card for debit, the debit has failed.|
|ConnectionOffline|The billing has not been completed, it has not been possible to contact MNO.|
|MissingDeliveryReport|Operator has not given us final status.|
|Sent|The message has been delivered to the recipient's operator, but we have not received any final status and do not know the final outcome. Status may change if we receive confirmation from the operator. On billing: Billing have not been confirmed, but we have not received any final status and do not know the final outcome. Status may change if we receive confirmation from the operator.|
|Rejected|The billing has not been completed and a potential message has not been delivered. The error can vary, but most often due to errors on the sender, errors on the recipient number or expired token. Do not try to rate again.|
|UnknownSubscriber|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient's age is unknown and that we therefore do not know if the user is old enough in relation to the set age for the service.|
|SubscriberUnavailable|Subscriber unavailable|
|SubscriberBarred|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient has blocked the possibility of debits via mobile payment, the recipient may have to contact his operator and lift this block.|
|InsufficientFunds|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient does not have coverage on his prepaid card.|
|InvalidCredentials|The billling has not been completed and a potential message has not been delivered, the transmission was made with the wrong username / password.|
|InvalidOTP|The billing has not been carried out and any message has not been delivered, an invalid onetime password has been used|
|MnoError|The billing has not been carried out and any message has not been delivered, this is due to an error at MNO.|
|RegistrationRequired|Registration required|
|UnknownAge|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient's age is unknown and that we therefore do not know if the user is old enough in relation to the set age for the service.|
|DuplicateTransaction|The message is not delivered. Same TransactionID is used before.|
|SubscriberLimitExceeded|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient has reached the limit for what can be charged per month. In some cases, there may also be an annual limit or a limit set at the user level.|
|MaxPinRetry|The billing has not been completed and a potential message has not been delivered. Recipient has entered the wrong pin code too many times.|
|MissingPreAuth|The billing has not been completed and a potential message has not been delivered. Process stopped since there is no valid active Token on MSISDN.|
|InvalidAmount|Invalid amount|
|OneTimePasswordExpired|The billing has not been completed and a potential message has not been delivered. The one-time password sent to the recipient has expired on time.|
|OneTimePasswordFailed|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient has entered the wrong password.|
|Pending|The billing has not been completed and a potential message has not been delivered. The reason is normally that we are waiting for an action from the end user, it can for example be registration or a confirmation via SMS or pin code.|
|SubscriberTooYoung|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient is younger than a set age limit for the service.|
|TimeoutError|The billing has not been completed and a potential message has not been delivered. The reason is that the recipient has not performed the necessary action (eg registration or confirmation) within the set deadline.|
|Stopped|Message is part of more than 100 identical messages in an hour and stopped, assuming it is part of an eternal loop|
|UserInTransaction|The billing has not been completed and no notification has been delivered. The reason is that you have another assessment process active against the user.|
|OtherError|Billing has not been completed and no potential messages has been delivered. This is an overall status for very many different statuses, but where all are few in number. This is done so that you may avoid dealing with many 100 different wrong details. If you have a larger number of assessments with this status, please contact us so that we can analyze your traffic in more detail.|

## Pincodes

### Send pincode
This example shows how to send pincodes to users and verify their input to validate their phonenumbers.
#### Request
```Node
let pincode = {
   transactionId: uuidv4(),
   recipient: '+4798079008',
   sender: 'Sender',
   prefixText: 'Your pin code is ',
   suffixText: ' to log on to acme.inc',
   pincodeLength: 4,
   maxAttempts: 3
};

serviceClient.postPincode(pincode);
```

prefixText, suffixText and pincodeLength are optional. If specified, pincodeLength must be between 4 and 6 and maxAttempts must be between 1 and 5.

### Verify pincode
This example shows how to verify the pincode sent in the previous step and entered on a web page by the user. Use the TransactionId provided in the previous step.
#### Request
```Node
boolean success = serviceClient.getPincodeVerification(pincode.transactionId, pin);
```

## Encoding and SMS length
When sending SMS messages, we'll automatically send messages in the most compact encoding possible. If you include any non GSM-7 characters in your message body, we will automatically fall back to UCS-2 encoding (which will limit message bodies to 70 characters each).

Additionally, for long messages (greater than 160 GSM-7 or 70 UCS-2) we will split the message into multiple segments. Six (6) bytes is also needed to instruct receiving device how to re-assemble messages, which for multi-segment messages, leaves 153 GSM-7 characters or 67 UCS-2 characters per segment.

Note that this may cause more message segments to be sent than you expect - a body with 152 GSM-7-compatible characters and a single unicode character will be split into three (3) messages because the unicode character changes the encoding into less-compact UCS-2. This will incur charges for three outgoing messages against your account.

Norwegian operators support different numbers of segments; Ice 16 segments, Telia 16 segments and Telenor 255 segments.

### Automatic character replacements
Unless you spesifically set the AllowUnicode property to true, we will automatically replace the following Unicode characters into GSM-7 counter-parts:

|From|To|
|:---|:---|
|– (long hyphen)|- (regular hyphen)|
|« (Word/Outlook quote)|" (regular quote)|
|» (Word/Outlook quote)|" (regular quote)|
|” (Word/Outlook quote)|" (regular quote)|
|’ (Word/Outlook apostrophe)|' (regular apostrophe)|
|\u00A0|(regular space)|
|\u1680|(regular space)|
|\u180E|(regular space)|
|\u2000|(regular space)|
|\u2001|(regular space)|
|\u2002|(regular space)|
|\u2003|(regular space)|
|\u2004|(regular space)|
|\u2005|(regular space)|
|\u2006|(regular space)|
|\u2007|(regular space)|
|\u2008|(regular space)|
|\u2009|(regular space)|
|\u200A|(regular space)|
|\u200B|(regular space)|
|\u202F|(regular space)|
|\u205F|(regular space)|
|\u3000|(regular space)|
|\uFEFF|(regular space)|

*Please note that we might remove or add Unicode characters that are automatically replaced. This is an "best effort" to save on SMS costs!*

## Pre-authorization
Some Strex service codes require recurring billing to be authorized by the user via a confirmation sms or sms pincode.
This can be achieved either via direct API calls or setting it up to be handled automatically via a keyword.

### Pre-authorization via keyword
Automatic pre-authorization can be activated on a keyword by either activating it in the
PreAuth section of the keyword in Strex Connect or via the SDK

```Node
var keyword = {
    shortNumberId: "NO-2002",
    keywordText: "HELLO",
    mode: "Text",
    forwardUrl: "https://your-site.net/api/receive-sms",
    enabled: true,
    preAuthSettings: {
        active: true,
        infoText: "Info message sent before preauth message",
        infoSender: "2002",
        prefixMessage: "Text inserted before preauth text",
        postfixMessage: "Text inserted after preauth text",
        delay: delayMins,
        merchantId: "Your merchant id",
        serviceDescription: "Service description"
    }
};

let keywordId = serviceClient.postKeyword(keyword);
```

In-messages forwarded to you will then look like this:
```http
POST https://your-site.net/api/receive-sms HTTP/1.1
Content-Type: application/json

{
  "transactionId":"00568c6b-7baf-4869-b083-d22afc163059",
  "created": "2021-12-06T09:50:00+00:00",
  "keywordId": "12345678",
  "sender":"+4798079008",
  "recipient":"2002",
  "content": "HELLO",
  "properties": {
    "ServiceId": "1234",
    "preAuthorization": true
  }
}
```
If PreAuthorization was not successfully performed, "preAuthorization" will be "false".

The new properties are ServiceId and preAuthorization. ServiceId must be added to the outmessage/transaction when doing rebilling in the "preAuthServiceId" field. 
The ServiceId is always the same for one keyword. Incoming messages forwarded with "preAuthorization" set as "false" are not possible
to bill via Strex Payment.

### Pre-authorization via API
Pre-authorization via API can be used with either SMS confirmation or OTP (one-time-passord). SMS confirmation is used by default if OneTimePassword isn't used.
PreAuthServiceId is an id chosen by you and must be used for all subsequent rebilling. PreAuthServiceDescription is optional, but should be set as this text will be visible for the end user on the Strex "My Page" web page.

Example using OTP-flow:
```Node
var transactionId = "your-unique-id";

var oneTimePassword = {
    transactionId: transactionId,
    merchantId: "your-merchant-id",
    recipient: "+4798079008",
    messagePrefix: "Dear customer...",
    messageSuffix: "Best Regards...",			
    recurring: true,
};

serviceClient.postStrexOneTimePassword(oneTimePassword);

// *** Get input from end user (eg. via web site) ***

var transaction = {
    transactionId: transactionId,
    shortNumber: "2002",
    recipient: "+4798079008",
    merchantId: "your-merchant-id",
    age: 18,
    price: 10,
    serviceCode: ServiceCodes.NonCommercialDonation,
    preAuthServiceId: "your-service-id",
    preAuthServiceDescription: "your-subscription-description",
    invoiceText: "Donation test",
    oneTimePassword: "code_from_end_user"
};

serviceClient.postStrexTransaction(transaction);
```

### Rebilling with pre-authorization:
```Node
var transaction = {
    transactionId: "your-unique-id",
    shortNumber: "2002",
    recipient: "+4798079008",
    content: "your-sms-text-to-end-user",
    merchantId: "your-merchant-id",
    age: 18,
    price: 10,
    serviceCode: ServiceCodes.NonCommercialDonation,
    preAuthServiceId: "your-service-id",
    invoiceText: "Donation test",
};

serviceClient.postStrexTransaction(transaction);
```

## Testing

### Fake numbers

If you need to trigger sms messages with different status codes for testing, without actually sending an sms to the end-user, we have added support for these fake numbers that will always get the corresponding status codes:

* +4700000001: Ok - Delivered
* +4700000010: Failed - Undelivered
* +4700000020: Failed - SubscriberBarred

All other numbers starting with +47000000 will be treated as fake and get status code Ok - Delivered.
