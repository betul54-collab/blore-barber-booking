import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { requireAdmin } from "@/lib/requireAdmin"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const PHONE_RE = /^\+905\d{9}$/

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function validSlot(date: any, time: any, duration: any, staff: any) {
  return (
    typeof date === "string" && DATE_RE.test(date) &&
    typeof time === "string" && TIME_RE.test(time) &&
    typeof duration === "number" && duration >= 5 && duration <= 600 &&
    typeof staff === "string" && staff.length > 0 && staff.length <= 100
  )
}

async function saveWithCheck(
  id: string | null,
  data: { date: string; time: string; duration: number; staff: string },
  extra: Record<string, any>
) {
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(adminDb.collection("bookings").where("date", "==", data.date))
    const start = toMin(data.time)
    const end = start + data.duration

    const conflict = snap.docs.some((d) => {
      if (id && d.id === id) return false
      const b = d.data() as any
      if ((b.staffId || b.staff) !== data.staff) return false
      const bs = toMin(b.time)
      const be = bs + Number(b.duration || 0)
      return start < be && end > bs
    })

    if (conflict) return { conflict: true as const, id: "" }

    if (id) {
      tx.update(adminDb.collection("bookings").doc(id), {
        date: data.date,
        time: data.time,
        duration: data.duration,
        staff: data.staff,
        staffId: data.staff,
      })
      return { conflict: false as const, id }
    }

    const ref = adminDb.collection("bookings").doc()
    tx.set(ref, {
      ...extra,
      date: data.date,
      time: data.time,
      duration: data.duration,
      staff: data.staff,
      staffId: data.staff,
      createdAt: new Date().toISOString(),
    })
    return { conflict: false as const, id: ref.id }
  })
}

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const snap = await adminDb.collection("bookings").get()
  const list = snap.docs.map((d) => {
    const b = d.data() as any
    return {
      id: d.id,
      name: b.name || "",
      phone: b.phone || "",
      service: b.service || "",
      date: b.date || "",
      time: b.time || "",
      duration: Number(b.duration || 0),
      staff: b.staffId || b.staff || "",
      note: b.note || "",
    }
  })

  return NextResponse.json(list)
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const { name, phone, service, note, date, time, duration, staff } = body

  if (typeof name !== "string" || !name.trim() || name.length > 100) {
    return NextResponse.json({ error: "Ad geçersiz" }, { status: 400 })
  }
  if (typeof phone !== "string" || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Telefon geçersiz (+905XXXXXXXXX)" }, { status: 400 })
  }
  if (typeof service !== "string" || !service.trim() || service.length > 100) {
    return NextResponse.json({ error: "Servis geçersiz" }, { status: 400 })
  }
  if (!validSlot(date, time, duration, staff)) {
    return NextResponse.json({ error: "Tarih/saat geçersiz" }, { status: 400 })
  }

  const result = await saveWithCheck(
    null,
    { date, time, duration, staff },
    {
      name: name.trim(),
      phone,
      service,
      note: typeof note === "string" ? note.slice(0, 500) : "",
    }
  )

  if (result.conflict) {
    return NextResponse.json({ error: "Bu saat dolu" }, { status: 409 })
  }

  return NextResponse.json({ success: true, id: result.id })
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const { id, date, time, duration, staff } = body

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id yok" }, { status: 400 })
  }
  if (!validSlot(date, time, duration, staff)) {
    return NextResponse.json({ error: "Tarih/saat geçersiz" }, { status: 400 })
  }

  const exists = await adminDb.collection("bookings").doc(id).get()
  if (!exists.exists) {
    return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 })
  }

  const result = await saveWithCheck(id, { date, time, duration, staff }, {})

  if (result.conflict) {
    return NextResponse.json({ error: "Bu saat dolu" }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const id = body?.id

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "id yok" }, { status: 400 })
  }

  await adminDb.collection("bookings").doc(id).delete()
  return NextResponse.json({ success: true })
}