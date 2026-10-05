import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? ""
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 })
  }

  const snap = await adminDb.collection("bookings").where("date", "==", date).get()
  const taken = snap.docs.map((d) => {
    const b = d.data()
    return { time: b.time, duration: Number(b.duration || 0), staff: b.staffId || b.staff || "" }
  })

  return NextResponse.json(taken)
}
