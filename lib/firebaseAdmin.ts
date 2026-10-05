import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function init() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT tanımlı değil");
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

const app = init();
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);