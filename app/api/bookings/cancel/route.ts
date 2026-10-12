import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { resolveSalon, bookingsCol, settingsDoc } from "@/lib/salon";

export const runtime = "nodejs"

const PHONE_RE = /^\+905\d{9}$/
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/

export async function POST(req: Request) {
  const salon = await resolveSalon(req);
  if (!salon) return Response.json({ error: "Salon bulunamadi" }, { status: 404 });
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const id = String(body?.id ?? "")
  const phone = String(body?.phone ?? "").trim()
  if (!ID_RE.test(id) || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const ref = bookingsCol(salon).doc(id)
  const snap = await ref.get()
  const data = snap.data()

  if (!snap.exists || !data || data.phone !== phone) {
    return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 })
  }

  await ref.delete()

  return NextResponse.json({
    success: true,
    booking: { service: data.service, date: data.date, time: data.time },
  })
}
