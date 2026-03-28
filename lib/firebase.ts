import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBupAA2F6DQa18sY-vhVzcSHJDCDT4NOYE",
  authDomain: "blore-barberbook.firebaseapp.com",
  projectId: "blore-barberbook",
  storageBucket: "blore-barberbook.firebasestorage.app",
  messagingSenderId: "932664395544",
  appId: "1:932664395544:web:469251d17f992b8726806d",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)