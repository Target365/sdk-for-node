## ![Strex](https://github.com/Target365/sdk-for-php/raw/master/strex.png "Strex")
Strex AS is a Norwegian payment and SMS gateway (Strex Connect) provider. Strex withholds an e-money license and processes more than 70 million transactions every year. Strex has more than 4.2 mill customers in Norway and are owned by the Norwegian mobile network operators (Telenor, Telia and Ice). Strex Connect is based on the Target365 marketing and communication platform.
## Target365 SDK for Node
[![License](https://img.shields.io/github/license/Target365/sdk-for-node.svg?style=flat)](https://opensource.org/licenses/MIT)

### Getting started
To get started, please click here: https://strex.no/strex-connect#Prispakker and register your organisation. 
After registration you can activate the SDK by sending us an email at <sdk@strex.no> containing your EC public key in PEM-format.
You can generate your EC public/private key-pair using openssl like this:
```
openssl ecparam -name prime256v1 -genkey -noout -out private.pem
```
Use openssl to convert it to pk8 format which Node uses.
```
openssl pkcs8 -topk8 -inform pem -in private.pem -outform pem -nocrypt -out private.key
```
The file `private.key` should look something like this:
```
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgzNTTnuXqcrI5uSEa
V6REzZG7hU+TzRl0Phe56k9/gPWhRANCAAQwB42Sozmtci4mDjnegx003FBV+9PQ
eYBRvK7GScuDQo2+DjEn4hUsnKDZw9o4y+xRat+ItUGKcvVCMW8Swod5
-----END PRIVATE KEY-----
```

Use this openssl command to extract the public key:
```
openssl ec -in private.key -pubout -out public.key
```
You can then send us the `public.key` file. The file should look something like this:
```
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEuVHnFqJxiBC9I5+8a8Sx66brBCz3
Flt70WN9l7WZ8VQVN9DZt0kW5xpiO5aG7qd5K8OcHZeoJRprFJOkBwW4Fg==
-----END PUBLIC KEY-----
```

For more details on using the SDK we strongly suggest you check out our [Node User Guide](USERGUIDE.md).

### npm
```
npm install target365-sdk
```
[![npm version](https://badge.fury.io/js/target365-sdk.svg)](https://www.npmjs.com/package/target365-sdk)

### Test Environment
Our test-environment acts as a sandbox that simulates the real API as closely as possible. This can be used to get familiar with the service before going to production. Please be ware that the simulation isn't perfect and must not be taken to have 100% fidelity.

#### Url: https://test.target365.io/

### Production Environment
Our production environment is a mix of per-tenant isolated environments and a shared common environment. Contact <sdk@strex.no> if you're interested in an isolated per-tenant environment.

#### Url: https://shared.target365.io/

### Authors and maintainers
Target365 (<sdk@strex.no>)

### Issues / Bugs / Questions
Please feel free to raise an issue against this repository if you have any questions or problems.

### Contributing
New contributors to this project are welcome. If you are interested in contributing please
send an email to sdk@strex.no.

### License
This library is released under the MIT license.
