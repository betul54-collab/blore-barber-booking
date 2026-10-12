import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { writeFileSync } from "node:fs"

const raw = process.env.FIREBASE_SERVICE_ACCOUNT
if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT yok. Komutu --env-file=.env.local ile çalıştır.")
}

const db = getFirestore(initializeApp({ credential: cert(JSON.parse(raw)) }))
const SALON = "blore"
const ownerUid = process.env.ADMIN_UID || null

const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const bookings = await db.collection("bookings").get()
const settings = await db.doc("settings/shop").get()

// 1) Yedek (proje klasörünün DIŞINA yazılır)
const backup = {
  bookings: bookings.docs.map((d) => ({ id: d.id, data: d.data() })),
  settings: settings.exists ? settings.data() : null,
}
const file = `../blore-backup-${stamp}.json`
writeFileSync(file, JSON.stringify(backup, null, 2))
console.log("Yedek yazıldı:", file)
console.log("Eski randevu sayısı:", bookings.size)

// 2) Yeni yapıya kopyala (eskiler silinmez)
await db.doc(`salons/${SALON}`).set(
  { name: "Blore Barber", ownerUid, createdAt: new Date().toISOString() },
  { merge: true }
)

if (settings.exists) {
  await db.doc(`salons/${SALON}/settings/shop`).set(settings.data())
  console.log("Ayarlar kopyalandı")
} else {
  console.log("Ayar dokümanı yok, atlandı")
}

let n = 0
for (const d of bookings.docs) {
  await db.doc(`salons/${SALON}/bookings/${d.id}`).set(d.data())
  n++
}
console.log("Yeni yapıya kopyalanan randevu:", n)
console.log("Bitti.")