import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { hasConflict } from "@/lib/checkBookingConflicts"

export const runtime = "nodejs"

const PHONE_RE = /^\+905\d{9}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function todayIstanbul() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date())
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return bad("Geçersiz istek")
  }

  const name = String(body?.name ?? "").trim()
  const phone = String(body?.phone ?? "").trim()
  const service = String(body?.service ?? "").trim()
  const staff = String(body?.staff ?? "").trim()
  const staffId = String(body?.staffId ?? "").trim()
  const date = String(body?.date ?? "")
  const time = String(body?.time ?? "")
  const duration = Number(body?.duration)
  const price = Number(body?.price)

  if (name.length < 2 || name.length > 80) return bad("Geçersiz isim")
  if (!PHONE_RE.test(phone)) return bad("Geçersiz telefon")
  if (!service || service.length > 100) return bad("Geçersiz hizmet")
  if (!staff && !staffId) return bad("Personel seçilmedi")
  if (!DATE_RE.test(date) || date < todayIstanbul()) return bad("Geçersiz tarih")
  if (!TIME_RE.test(time)) return bad("Geçersiz saat")
  if (!Number.isFinite(duration) || duration < 5 || duration > 480) return bad("Geçersiz süre")
  if (!Number.isFinite(price) || price < 0) return bad("Geçersiz fiyat")

  const staffKey = staffId || staff
  const ref = adminDb.collection("bookings").doc()

  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(adminDb.collection("bookings").where("date", "==", date))
      const sameStaff = snap.docs
        .map((d) => d.data())
        .filter((b) => (b.staffId || b.staff || "") === staffKey)
        .map((b) => ({ time: String(b.time), duration: Number(b.duration || 0) }))

      if (hasConflict(sameStaff, time, duration)) throw new Error("CONFLICT")

      tx.set(ref, {
        name, phone, service, price, duration, date, time, staff, staffId,
        createdAt: new Date().toISOString(),
      })
    })
  } catch (e: any) {
    if (e?.message === "CONFLICT") {
      return NextResponse.json({ error: "Bu saat dolu" }, { status: 409 })
    }
    console.error(e)
    return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: ref.id })
}