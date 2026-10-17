import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const [salonId, salonName, email, password] = process.argv.slice(2)

if (!salonId || !salonName || !email) {
  console.log('Kullanim: node --env-file=.env.local scripts/create-salon.mjs <salon-id> "<Salon Adi>" <sahip-email> [sifre]')
  process.exit(1)
}
if (!/^[a-z0-9][a-z0-9-]{1,39}$/.test(salonId)) {
  console.log("Salon id sadece kucuk harf, rakam ve tire icermeli (2-40 karakter).")
  process.exit(1)
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT
if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT yok. Komutu --env-file=.env.local ile calistir.")
}

const app = initializeApp({ credential: cert(JSON.parse(raw)) })
const db = getFirestore(app)
const auth = getAuth(app)

const ref = db.collection("salons").doc(salonId)
if ((await ref.get()).exists) {
  console.log("Bu salon zaten var:", salonId)
  process.exit(1)
}

let user
try {
  user = await auth.getUserByEmail(email)
  console.log("Mevcut kullanici bulundu.")
} catch {
  if (!password || password.length < 8) {
    console.log("Yeni kullanici icin en az 8 karakterli sifre gerekli.")
    process.exit(1)
  }
  user = await auth.createUser({ email, password })
  console.log("Yeni kullanici olusturuldu.")
}

await ref.set({ name: salonName, ownerUid: user.uid, createdAt: new Date().toISOString() })
console.log("Salon olusturuldu:", salonId, "| sahip:", email)
