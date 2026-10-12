"use client"

import { withSalon, salonPath } from "@/lib/salonClient";
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Service = {
  name: string
  price: number
  duration: number
}

type Booking = {
  date: string
  time: string
  duration: number
  staff: string
}

type BreakItem = {
  staff: string
  start: string
  end: string
}

type HolidayItem = {
  staff: string
  start: string
  end: string
}

type WorkDay = {
  day: string
  start: string
  end: string
  closed: boolean
}

export default function BookingPage() {
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<string[]>([])
  const [breaks, setBreaks] = useState<BreakItem[]>([])
  const [holidays, setHolidays] = useState<HolidayItem[]>([])
  const [workHours, setWorkHours] = useState<WorkDay[]>([])
  const [configLoaded, setConfigLoaded] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+905")
  const [selectedStaff, setSelectedStaff] = useState("")
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [accepted, setAccepted] = useState(false)

  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(withSalon("/api/config"), { cache: "no-store" })
        if (!res.ok) throw new Error("config")
        const data = await res.json()

        setServices(data.services ?? [])
        setStaff(data.staff ?? [])
        setBreaks(data.breaks ?? [])
        setHolidays(data.holidays ?? [])
        setWorkHours(data.workHours ?? [])
        setConfigLoaded(true)
      } catch (error) {
        console.error(error)
        alert("Ayarlar yüklenemedi, sayfayı yenileyin")
      }
    }

    loadConfig()
  }, [])

  useEffect(() => {
    if (!date) {
      setBookings([])
      return
    }

    let cancelled = false

    async function loadTaken() {
      try {
        const res = await fetch(withSalon(`/api/slots?date=${date}`), { cache: "no-store" })
        if (!res.ok) return

        const list: { time: string; duration: number; staff: string }[] = await res.json()

        if (!cancelled) {
          setBookings(list.map((b) => ({ ...b, date })))
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadTaken()
    const timer = setInterval(loadTaken, 20000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [date])

  const selectedService = useMemo(
    () => services.find((s) => s.name === service),
    [services, service]
  )

  function handlePhone(value: string) {
    let digits = value.replace(/\D/g, "")
    if (!digits.startsWith("905")) digits = "905"
    digits = digits.slice(0, 12)
    setPhone("+" + digits)
  }

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  function minutesToTime(minutes: number) {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0")
    const m = (minutes % 60).toString().padStart(2, "0")
    return `${h}:${m}`
  }

  function getDayName(dateString: string) {
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ]
    const d = new Date(`${dateString}T00:00:00`)
    return days[d.getDay()]
  }

  function isSalonClosed(dateString: string) {
    const dayName = getDayName(dateString)
    const found = workHours.find((d) => d.day === dayName)
    return found?.closed ?? false
  }

  function getDayHours(dateString: string) {
    const dayName = getDayName(dateString)
    return workHours.find((d) => d.day === dayName)
  }

  function isStaffOnHoliday(dateString: string) {
    return holidays.some(
      (h) => h.staff === selectedStaff && dateString >= h.start && dateString <= h.end
    )
  }

  function generateTimesForDay(dateString: string) {
    const dayHours = getDayHours(dateString)
    if (!dayHours || dayHours.closed) return []

    const startMinutes = timeToMinutes(dayHours.start)
    const endMinutes = timeToMinutes(dayHours.end)

    const list: string[] = []

    for (let t = startMinutes; t < endMinutes; t += 30) {
      list.push(minutesToTime(t))
    }

    return list
  }

  function hasBreakConflict(dateString: string, startTime: string, duration: number) {
    const start = new Date(`${dateString}T${startTime}`)
    const end = new Date(start.getTime() + duration * 60000)

    return breaks.some((b) => {
      if (b.staff !== selectedStaff) return false

      const bStart = new Date(b.start)
      const bEnd = new Date(b.end)

      return start < bEnd && end > bStart
    })
  }

  function hasBookingConflict(dateString: string, startTime: string, duration: number) {
    const start = new Date(`${dateString}T${startTime}`)
    const end = new Date(start.getTime() + duration * 60000)

    return bookings.some((b) => {
      if (b.staff !== selectedStaff) return false
      if (b.date !== dateString) return false

      const bStart = new Date(`${b.date}T${b.time}`)
      const bEnd = new Date(bStart.getTime() + b.duration * 60000)

      return start < bEnd && end > bStart
    })
  }

  function exceedsWorkingHours(dateString: string, startTime: string, duration: number) {
    const dayHours = getDayHours(dateString)
    if (!dayHours) return true

    const start = timeToMinutes(startTime)
    const end = start + duration
    const workEnd = timeToMinutes(dayHours.end)

    return end > workEnd
  }

  function getAvailableTimes(dateString: string) {
    if (!selectedStaff || !selectedService) return []

    if (isSalonClosed(dateString)) return []
    if (isStaffOnHoliday(dateString)) return []

    const allTimes = generateTimesForDay(dateString)

    return allTimes.filter((slot) => {
      if (exceedsWorkingHours(dateString, slot, selectedService.duration)) return false
      if (hasBreakConflict(dateString, slot, selectedService.duration)) return false
      if (hasBookingConflict(dateString, slot, selectedService.duration)) return false
      return true
    })
  }

  useEffect(() => {
    if (date && selectedStaff && selectedService) {
      const times = getAvailableTimes(date)
      setAvailableTimes(times)

      if (time && !times.includes(time)) {
        setTime("")
      }
    } else {
      setAvailableTimes([])
      setTime("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedStaff, service, bookings, breaks, holidays, workHours])

  function handleContinue() {
    if (!name.trim() || !phone.trim() || !selectedStaff || !selectedService || !date || !time) {
      alert("Lütfen tüm alanları doldurun")
      return
    }

    if (!accepted) {
      alert("Devam etmek için Datenschutzerklärung'u kabul edin")
      return
    }

    setLoading(true)

    const staffIndex = Number(selectedStaff.replace("staff", ""))
    const staffName = staff[staffIndex] || selectedStaff

    const bookingData = {
      name: name.trim(),
      phone: phone.trim(),
      service: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date,
      time,
      staff: staffName,
      staffId: selectedStaff,
    }

    // Sadece onay sayfasına geçiş için geçici tutulur
    localStorage.setItem("bookingData", JSON.stringify(bookingData))

    setTimeout(() => {
      router.push(salonPath("/booking/confirm"))
    }, 250)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          boxSizing: "border-box",
          background: "white",
          borderRadius: 24,
          padding: 30,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "8px 14px",
            borderRadius: 999,
            background: "#eff6ff",
            color: "#2563eb",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Blore Barber
        </div>

        <h1
          style={{
            marginTop: 0,
            marginBottom: 10,
            fontSize: 34,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Randevu Al
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Bilgilerinizi girin, personelinizi ve saatinizi seçin.
        </p>

        <input
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => handlePhone(e.target.value)}
          style={inputStyle}
        />

        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={inputStyle}
        >
          <option value="">Personel seç</option>
          {staff.map((s, i) => (
            <option key={i} value={`staff${i}`}>
              {s}
            </option>
          ))}
        </select>

        {configLoaded && staff.length === 0 && (
          <div style={errorBox}>Şu an randevu için uygun personel yok</div>
        )}

        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          style={inputStyle}
        >
          <option value="">Servis seç</option>
          {services.map((s, i) => (
            <option key={i} value={s.name}>
              {s.name} — {s.price} TL — {s.duration} dk
            </option>
          ))}
        </select>

        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 6 }}>
          Tarih seç
        </div>

        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker()
            } catch {
              // eski tarayıcılarda sessizce geç
            }
          }}
          style={{ ...inputStyle, cursor: "pointer" }}
        />

        {date && isSalonClosed(date) && (
          <div style={errorBox}>Salon kapalı</div>
        )}

        {date && !isSalonClosed(date) && isStaffOnHoliday(date) && (
          <div style={errorBox}>Bu personel tatilde</div>
        )}

        {date &&
          selectedStaff &&
          selectedService &&
          !isSalonClosed(date) &&
          !isStaffOnHoliday(date) && (
            <>
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 6 }}>
                  Seçilen bilgiler
                </div>
                <div style={{ color: "#111827", fontWeight: 700 }}>
                  Personel: {staff[Number(selectedStaff.replace("staff", ""))] || "-"}
                </div>
                <div style={{ color: "#111827", fontWeight: 700, marginTop: 4 }}>
                  Servis: {selectedService.name}
                </div>
              </div>

              {availableTimes.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {availableTimes.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: time === slot ? "2px solid #2563eb" : "1px solid #d1d5db",
                        background: time === slot ? "#eff6ff" : "white",
                        color: "#111827",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={errorBox}>Uygun saat yok</div>
              )}
            </>
          )}

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 16,
            color: "#374151",
            fontSize: 14,
            lineHeight: 1.5,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
          />
          <span>
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontWeight: 700 }}
            >
              Datenschutzerklärung
            </a>
            &apos;u okudum ve kabul ediyorum.
          </span>
        </label>

        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Devam ediliyor..." : "Devam Et"}
        </button>

        <button
          onClick={() => router.push(salonPath("/"))}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 10,
            borderRadius: 14,
            border: "none",
            background: "#64748b",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  display: "block",
  minHeight: 50,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #d1d5db",
  marginBottom: 14,
  fontSize: 16,
  outline: "none",
  background: "white",
  color: "#111827",
}

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  padding: 14,
  borderRadius: 14,
  textAlign: "center",
  fontWeight: 700,
  marginBottom: 16,
}
