// lib/services.ts
import { collection, getDocs } from "firebase/firestore"
import { db } from "./firebase"

export type Service = {
  id: string
  name: string
  duration: number // dakika
}

// 🔹 Tüm hizmetleri getir
export async function getServices(): Promise<Service[]> {
  const snap = await getDocs(collection(db, "services"))

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Service, "id">),
  }))
}