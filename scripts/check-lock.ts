import fs from 'fs';
const lock = JSON.parse(fs.readFileSync('./package-lock.json', 'utf8'));

console.log("jwks-rsa in packages:", lock.packages['node_modules/jwks-rsa']);
console.log("nested jose:", lock.packages['node_modules/jwks-rsa/node_modules/jose']);
console.log("root jose:", lock.packages['node_modules/jose']);
