const utils = require('jwks-rsa/src/utils');
const admin = require('firebase-admin');
console.log("CommonJS require('jwks-rsa/src/utils') succeeded!");
console.log("retrieveSigningKeys type:", typeof utils.retrieveSigningKeys);
console.log("firebase-admin apps:", admin.apps ? admin.apps.length : 'ok');
