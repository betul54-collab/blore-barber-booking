import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type Booking = {
  id?: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  staff: string
  createdAt?: string
}

const bookingsRef = collection(db, "bookings")

export async function getBookingsFromDb(): Promise<Booking[]> {
  const snapshot = await getDocs(bookingsRef)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<Booking, "id">),
  }))
}

export async function addBookingToDb(data: Booking) {
  const docRef = await addDoc(bookingsRef, {
    ...data,
    createdAt: new Date().toISOString(),
  })

  return docRef.id
}

export async function deleteBookingFromDb(id: string) {
  await deleteDoc(doc(db, "bookings", id))
}

export async function updateBookingInDb(
  id: string,
  data: Partial<Booking>
) {
  await updateDoc(doc(db, "bookings", id), data)
}