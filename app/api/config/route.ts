import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { resolveSalon, bookingsCol, settingsDoc } from "@/lib/salon";
import { requireSalonAdmin } from "@/lib/requireSalonAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const STAFF_RE = /^staff\d{1,2}$/

const defaults = {
  staff: ["Personel 1", "Personel 2"] as string[],
  services: [
    { name: "Saç", price: 500, duration: 30 },
    { name: "Sakal", price: 300, duration: 15 },
    { name: "Saç + Sakal", price: 800, duration: 45 },
    { name: "Saç Açma Boyama", price: 1500, duration: 90 },
  ],
  workHours: DAYS.map((day) => ({ day, start: "09:00", end: "18:00", closed: day === "Pazar" })),
  breaks: [] as any[],
  holidays: [] as any[],
}

const isStr = (v: any, max = 80) => typeof v === "string" && v.trim().length > 0 && v.length <= max
const isNum = (v: any, min: number, max: number) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max

function clean(b: any) {
  if (!b || typeof b !== "object") return null
  const { staff, services, workHours, breaks, holidays } = b

  if (!Array.isArray(staff) || staff.length > 30 || !staff.every((s) => isStr(s, 60))) return null

  if (!Array.isArray(services) || services.length > 50) return null
  for (const s of services) {
    if (!isStr(s?.name, 80) || !isNum(s?.price, 0, 100000) || !isNum(s?.duration, 5, 480)) return null
  }

  if (!Array.isArray(workHours) || workHours.length !== 7) return null
  for (const d of workHours) {
    if (!DAYS.includes(d?.day) || !TIME_RE.test(d?.start) || !TIME_RE.test(d?.end) || typeof d?.closed !== "boolean") return null
  }

  if (!Array.isArray(breaks) || breaks.length > 500) return null
  for (const x of breaks) {
    if (!STAFF_RE.test(x?.staff) || !DT_RE.test(x?.start) || !DT_RE.test(x?.end)) return null
  }

  if (!Array.isArray(holidays) || holidays.length > 500) return null
  for (const x of holidays) {
    if (!STAFF_RE.test(x?.staff) || !DATE_RE.test(x?.start) || !DATE_RE.test(x?.end)) return null
  }

  return {
    staff: staff.map((s: string) => s.trim()),
    services: services.map((s: any) => ({ name: s.name.trim(), price: s.price, duration: s.duration })),
    workHours: workHours.map((d: any) => ({ day: d.day, start: d.start, end: d.end, closed: d.closed })),
    breaks: breaks.map((x: any) => ({ staff: x.staff, start: x.start, end: x.end })),
    holidays: holidays.map((x: any) => ({ staff: x.staff, start: x.start, end: x.end })),
  }
}

export async function GET(req: Request) {
  const salon = await resolveSalon(req);
  if (!salon) return Response.json({ error: "Salon bulunamadi" }, { status: 404 });
  const snap = await settingsDoc(salon).get()
  return NextResponse.json(snap.exists ? { ...defaults, ...snap.data() } : defaults)
}

export async function PUT(req: Request) {
  const salon = await resolveSalon(req);
  if (!salon) return Response.json({ error: "Salon bulunamadi" }, { status: 404 });
  if (!(await requireSalonAdmin(req, salon))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const data = clean(body)
  if (!data) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 })

  await settingsDoc(salon).set(data)
  return NextResponse.json({ ok: true })
}