import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \n from env vars stored as literal \n strings
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("[firebase-admin] Initialization error:", error);
  }
}

// Export adminAuth only if an app exists (i.e., initialization succeeded)
let adminAuth: ReturnType<typeof getAuth>;
try {
  adminAuth = getAuth(getApps().length ? getApp() : undefined as any);
} catch (error) {
  console.error("[firebase-admin] getAuth() error:", error);
  adminAuth = null as any;
}

export { adminAuth };

