import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { doc, setDoc } from "firebase/firestore"

export async function POST(req: Request) {
  try {
    const { staff, time } = await req.json()

    const id = `${staff}_${time}`

    await setDoc(doc(db, "closed_slots", id), {
      staff,
      time,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false })
  }
}