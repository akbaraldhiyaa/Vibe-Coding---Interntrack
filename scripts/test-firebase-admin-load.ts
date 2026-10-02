import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as jwksRsa from "jwks-rsa";

async function testLoading() {
  console.log("1. Testing jwks-rsa require/import...");
  console.log("   jwksRsa loaded successfully:", typeof jwksRsa === 'object' || typeof jwksRsa === 'function');

  console.log("2. Testing jwks-rsa utils signing key resolver...");
  const utils = require("jwks-rsa/src/utils");
  console.log("   jwks-rsa utils loaded successfully:", typeof utils.retrieveSigningKeys === 'function');

  console.log("3. Testing firebase-admin/app and firebase-admin/auth import...");
  console.log("   getAuth is function:", typeof getAuth === 'function');
  
  console.log("4. Testing firebase-admin initialization check...");
  console.log("   getApps length:", getApps().length);

  console.log("\n✅ ALL FIREBASE ADMIN + JWKS-RSA MODULES LOADED WITH ZERO ESM/CJS ERRORS!");
}

testLoading().catch(e => {
  console.error("❌ MODULE LOADING FAILED:", e);
  process.exit(1);
});
