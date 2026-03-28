"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Service = {
  id: string
  name: string
  durationMin: number
  price?: number
}

type Staff = {
  id: string
  name: string
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

function formatHHMM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/**
 * Basit zaman slot üretimi:
 * - çalışma saatleri: 09:00 - 19:00
 * - adım: 30 dk
 * - öğle arası: 13:00 - 14:00 (slot üretme)
 * Not: İstersen bunu admin settings'ten okuyacak hale de getiririz.
 */
function buildSlots(stepMin = 30) {
  const slots: string[] = []
  const start = new Date()
  start.setHours(9, 0, 0, 0)
  const end = new Date()
  end.setHours(19, 0, 0, 0)

  let cur = new Date(start)
  while (cur < end) {
    const hh = cur.getHours()
    const mm = cur.getMinutes()

    // 13:00 - 14:00 öğle arası
    const inLunch =
      (hh === 13) ||
      (hh === 14 && mm === 0) // 14:00 slotu olsun istiyorsan kaldır
    if (!inLunch) slots.push(formatHHMM(cur))

    cur = addMinutes(cur, stepMin)
  }

  return slots
}

export default function RandevuPage() {
  const router = useRouter()

  // Demo data (istersen sonra /api/services ve /api/staff'dan çekebiliriz)
  const staffList: Staff[] = useMemo(
    () => [
      { id: "s1", name: "Personel 1" },
      { id: "s2", name: "Personel 2" },
      { id: "s3", name: "Personel 3" },
      { id: "s4", name: "Personel 4" },
    ],
    []
  )

  const services: Service[] = useMemo(
    () => [
      { id: "svc1", name: "Saç", durationMin: 30, price: 350 },
      { id: "svc2", name: "Sakal", durationMin: 20, price: 250 },
      { id: "svc3", name: "Saç + Sakal", durationMin: 45, price: 700 },
      { id: "svc4", name: "Çocuk", durationMin: 30, price: 300 },
    ],
    []
  )

  const allSlots = useMemo(() => buildSlots(30), [])

  const [date, setDate] = useState<string>(() => toYmd(new Date()))
  const [time, setTime] = useState<string>("")
  const [staffId, setStaffId] = useState<string>("s1")
  const [serviceId, setServiceId] = useState<string>("svc3")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>("")

  // seçili gün için, seçili personelin dolu saatlerini çek
  const [taken, setTaken] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setMsg("")
        setTaken([])
        // Eğer sende /api/taken varsa:
        // GET /api/taken?date=YYYY-MM-DD&staff=s1
        const res = await fetch(`/api/taken?date=${encodeURIComponent(date)}&staff=${encodeURIComponent(staffId)}`, {
          cache: "no-store",
        })
        if (!res.ok) return
        const data = await res.json()
        // beklenen format: { taken: ["10:00","10:30"] } veya direkt ["10:00", ...]
        const arr = Array.isArray(data) ? data : Array.isArray(data?.taken) ? data.taken : []
        if (!cancelled) setTaken(arr)
      } catch {
        // sorun olursa boş geçsin
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [date, staffId])

  const availableSlots = useMemo(() => {
    const set = new Set(taken)
    return allSlots.filter((s) => !set.has(s))
  }, [allSlots, taken])

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId])
  const selectedStaff = useMemo(() => staffList.find((s) => s.id === staffId), [staffList, staffId])

  async function submit() {
    setMsg("")
    if (!firstName.trim() || !lastName.trim()) return setMsg("Lütfen ad ve soyad girin.")
    if (!phone.trim()) return setMsg("Lütfen telefon girin.")
    if (!email.trim()) return setMsg("Lütfen e-posta girin.")
    if (!date) return setMsg("Lütfen tarih seçin.")
    if (!time) return setMsg("Lütfen saat seçin.")
    if (!serviceId) return setMsg("Lütfen servis seçin.")
    if (!staffId) return setMsg("Lütfen personel seçin.")

    setLoading(true)
    try {
      const payload = {
        date,
        time,
        staff: selectedStaff?.name ?? staffId,
        staffId,
        service: selectedService?.name ?? serviceId,
        serviceId,
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        email: email.trim(),
        note: note.trim(),
        createdAt: new Date().toISOString(),
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const t = await res.text().catch(() => "")
        throw new Error(t || "Kayıt başarısız.")
      }

      setMsg("✅ Randevunuz oluşturuldu.")
      // istersen temizle:
      // setTime("")
      // setNote("")
      // router.push("/randevu/basarili") gibi
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Bir hata oluştu."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Blore Barber
            </h1>
            <p className="text-white/80 mt-2">
              Online randevu oluşturun
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-white/80 hover:text-white text-sm underline underline-offset-4"
            type="button"
          >
            Ana sayfa
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Ad</label>
            <input
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Betül"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Soyad</label>
            <input
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Erol"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Telefon</label>
            <input
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5xx xxx xx xx"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">E-posta</label>
            <input
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Tarih</label>
            <input
              type="date"
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Personel</label>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Servis</label>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name}
                  {typeof s.price === "number" ? ` — ${s.price}₺` : ""}
                  {typeof s.durationMin === "number" ? ` — ${s.durationMin} dk` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Saat</label>
            <select
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="" className="text-black">
                Saat seçin
              </option>
              {availableSlots.map((s) => (
                <option key={s} value={s} className="text-black">
                  {s}
                </option>
              ))}
            </select>
            {taken.length > 0 ? (
              <p className="text-xs text-white/60 mt-1">
                Dolu saatler otomatik gizlenir (seçili gün + personel).
              </p>
            ) : (
              <p className="text-xs text-white/60 mt-1">
                Not: /api/taken yoksa tüm saatler açık görünür.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-white/80 mb-1">Not</label>
            <textarea
              className="w-full min-h-[90px] rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Saç kısa olsun, sakal çizgi..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-sm text-white/80">
            <div>
              <span className="text-white/60">Seçim:</span>{" "}
              <span className="text-white">
                {selectedService?.name ?? "-"} / {selectedStaff?.name ?? "-"} / {date} {time || ""}
              </span>
            </div>
            {msg ? <div className="mt-2 text-white">{msg}</div> : null}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-lg px-5 py-2.5 bg-yellow-400/90 hover:bg-yellow-400 text-black font-medium disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Randevu Oluştur"}
          </button>
        </div>
      </div>
    </div>
  )
}