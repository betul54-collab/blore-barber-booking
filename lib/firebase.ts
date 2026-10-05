import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBupAA2F6DQa18sY-vhVzcSHJDCDT4NOYE",
  authDomain: "blore-barberbook.firebaseapp.com",
  projectId: "blore-barberbook",
  storageBucket: "blore-barberbook.firebasestorage.app",
  messagingSenderId: "932664395544",
  appId: "1:932664395544:web:469251d17f992b8726806d",
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
