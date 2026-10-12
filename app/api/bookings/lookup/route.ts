import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { resolveSalon, bookingsCol, settingsDoc } from "@/lib/salon";

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PHONE_RE = /^\+905\d{9}$/

function todayIstanbul() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date())
}

export async function POST(req: Request) {
  const salon = await resolveSalon(req);
  if (!salon) return Response.json({ error: "Salon bulunamadi" }, { status: 404 });
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const phone = String(body?.phone ?? "").trim()
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Geçersiz telefon" }, { status: 400 })
  }

  const snap = await bookingsCol(salon).where("phone", "==", phone).get()
  const today = todayIstanbul()

  const list = snap.docs
    .map((d) => {
      const b = d.data()
      return {
        id: d.id,
        date: String(b.date || ""),
        time: String(b.time || ""),
        service: String(b.service || ""),
        staff: String(b.staff || ""),
        duration: Number(b.duration || 0),
      }
    })
    .filter((b) => b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  return NextResponse.json(list)
}
