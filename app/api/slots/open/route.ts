import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { doc, deleteDoc } from "firebase/firestore"

export async function POST(req: Request) {
  try {
    const { staff, time } = await req.json()

    const id = `${staff}_${time}`

    await deleteDoc(doc(db, "closed_slots", id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false })
  }
}