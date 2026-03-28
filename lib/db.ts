// lib/db.ts

import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase config (kendi bilgilerini koy)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
}

// App init (çift init engel)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

// Firestore export (ÖNEMLİ)
export const db = getFirestore(app)