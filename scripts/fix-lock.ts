import fs from 'fs';
const lock = JSON.parse(fs.readFileSync('./package-lock.json', 'utf8'));

// Delete nested jose
delete lock.packages['node_modules/jwks-rsa/node_modules/jose'];

// Add overrides to root package in lockfile
if (lock.packages['']) {
  lock.packages[''].overrides = {
    jose: '4.15.9'
  };
}

fs.writeFileSync('./package-lock.json', JSON.stringify(lock, null, 2));
console.log("Updated package-lock.json");
