"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Service = {
  name: string
  price: number
  duration: number
}

type WorkDay = {
  day: string
  start: string
  end: string
  closed: boolean
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

export default function SettingsPage() {
  const router = useRouter()

  const defaultServices: Service[] = [
    { name: "Saç", price: 500, duration: 30 },
    { name: "Sakal", price: 300, duration: 15 },
    { name: "Saç + Sakal", price: 800, duration: 45 },
    { name: "Saç Açma Boyama", price: 1500, duration: 90 },
  ]

  const days = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ]

  const [staff, setStaff] = useState<string[]>([])
  const [newStaff, setNewStaff] = useState("")
  const [editStaff, setEditStaff] = useState<number | null>(null)

  const [services, setServices] = useState<Service[]>([])
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceDuration, setServiceDuration] = useState("30")

  const [workHours, setWorkHours] = useState<WorkDay[]>([])

  const [selectedStaff, setSelectedStaff] = useState("")
  const [breakStart, setBreakStart] = useState("")
  const [breakEnd, setBreakEnd] = useState("")
  const [breaks, setBreaks] = useState<BreakItem[]>([])

  const [holidayStart, setHolidayStart] = useState("")
  const [holidayEnd, setHolidayEnd] = useState("")
  const [holidays, setHolidays] = useState<HolidayItem[]>([])

  useEffect(() => {
    const savedStaff = localStorage.getItem("staff")
    const savedServices = localStorage.getItem("services")
    const savedHours = localStorage.getItem("workHours")
    const savedBreaks = localStorage.getItem("breaks")
    const savedHolidays = localStorage.getItem("holidays")

    if (savedStaff) {
      setStaff(JSON.parse(savedStaff))
    }

    if (savedServices) {
      setServices(JSON.parse(savedServices))
    } else {
      setServices(defaultServices)
      localStorage.setItem("services", JSON.stringify(defaultServices))
    }

    if (savedHours) {
      setWorkHours(JSON.parse(savedHours))
    } else {
      const defaultHours = days.map((day) => ({
        day,
        start: "09:00",
        end: "18:00",
        closed: false,
      }))
      setWorkHours(defaultHours)
      localStorage.setItem("workHours", JSON.stringify(defaultHours))
    }

    if (savedBreaks) {
      setBreaks(JSON.parse(savedBreaks))
    }

    if (savedHolidays) {
      setHolidays(JSON.parse(savedHolidays))
    }
  }, [])

  function updateCalendar() {
    window.dispatchEvent(new Event("settingsUpdated"))
  }

  function saveStaff(list: string[]) {
    setStaff(list)
    localStorage.setItem("staff", JSON.stringify(list))
  }

  function addStaff() {
    if (!newStaff.trim()) return

    const updated = [...staff, newStaff.trim()]
    saveStaff(updated)
    setNewStaff("")
    updateCalendar()
  }

  function deleteStaff(index: number) {
    const updated = staff.filter((_, i) => i !== index)
    saveStaff(updated)

    const filteredBreaks = breaks.filter((b) => b.staff !== `staff${index}`)
    const filteredHolidays = holidays.filter((h) => h.staff !== `staff${index}`)

    setBreaks(filteredBreaks)
    setHolidays(filteredHolidays)

    localStorage.setItem("breaks", JSON.stringify(filteredBreaks))
    localStorage.setItem("holidays", JSON.stringify(filteredHolidays))

    updateCalendar()
  }

  function updateStaff(index: number, value: string) {
    const updated = [...staff]
    updated[index] = value
    saveStaff(updated)
  }

  function saveServices(list: Service[]) {
    setServices(list)
    localStorage.setItem("services", JSON.stringify(list))
  }

  function addService() {
    if (!serviceName.trim() || !servicePrice) return

    const newService: Service = {
      name: serviceName.trim(),
      price: Number(servicePrice),
      duration: Number(serviceDuration),
    }

    const updated = [...services, newService]
    saveServices(updated)

    setServiceName("")
    setServicePrice("")
    setServiceDuration("30")

    updateCalendar()
  }

  function deleteService(index: number) {
    const updated = services.filter((_, i) => i !== index)
    saveServices(updated)
    updateCalendar()
  }

  function updateService(index: number, key: string, value: any) {
    const updated: any = [...services]
    updated[index][key] = key === "name" ? value : Number(value)
    saveServices(updated)
  }

  function updateHours(index: number, key: string, value: any) {
    const updated: any = [...workHours]
    updated[index][key] = value
    setWorkHours(updated)
    localStorage.setItem("workHours", JSON.stringify(updated))
  }

  function addBreak() {
    if (!selectedStaff || !breakStart || !breakEnd) {
      alert("Personel ve saat seç")
      return
    }

    const newBreak: BreakItem = {
      staff: selectedStaff,
      start: breakStart,
      end: breakEnd,
    }

    const updated = [...breaks, newBreak]
    setBreaks(updated)
    localStorage.setItem("breaks", JSON.stringify(updated))

    setBreakStart("")
    setBreakEnd("")

    updateCalendar()
  }

  function deleteBreak(index: number) {
    const updated = breaks.filter((_, i) => i !== index)
    setBreaks(updated)
    localStorage.setItem("breaks", JSON.stringify(updated))
    updateCalendar()
  }

  function addHoliday() {
    if (!selectedStaff || !holidayStart || !holidayEnd) {
      alert("Personel ve tarih seç")
      return
    }

    const newHoliday: HolidayItem = {
      staff: selectedStaff,
      start: holidayStart,
      end: holidayEnd,
    }

    const updated = [...holidays, newHoliday]
    setHolidays(updated)
    localStorage.setItem("holidays", JSON.stringify(updated))

    setHolidayStart("")
    setHolidayEnd("")

    updateCalendar()
  }

  function deleteHoliday(index: number) {
    const updated = holidays.filter((_, i) => i !== index)
    setHolidays(updated)
    localStorage.setItem("holidays", JSON.stringify(updated))
    updateCalendar()
  }

  function saveAll() {
    localStorage.setItem("staff", JSON.stringify(staff))
    localStorage.setItem("services", JSON.stringify(services))
    localStorage.setItem("workHours", JSON.stringify(workHours))
    localStorage.setItem("breaks", JSON.stringify(breaks))
    localStorage.setItem("holidays", JSON.stringify(holidays))

    updateCalendar()
    alert("Kaydedildi ✅")
  }

  function logout() {
    router.push("/")
  }

  function staffLabel(staffId: string) {
    const index = Number(staffId.replace("staff", ""))
    return staff[index] || staffId
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 30,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700 }}>⚙️ Ayarlar</h1>
        <div style={{ color: "#64748b", marginTop: 8 }}>
          Personel, servis, çalışma saatleri, mola ve tatil yönetimi
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>👨‍💼 Personel</h3>

        <div style={row}>
          <input
            placeholder="Personel adı"
            value={newStaff}
            onChange={(e) => setNewStaff(e.target.value)}
            style={input}
          />

          <button onClick={addStaff} style={primaryBtn}>
            Ekle
          </button>
        </div>

        {staff.length === 0 && <div style={emptyText}>Henüz personel yok</div>}

        {staff.map((s, i) => (
          <div key={i} style={listRow}>
            {editStaff === i ? (
              <input
                value={s}
                onChange={(e) => updateStaff(i, e.target.value)}
                onBlur={() => setEditStaff(null)}
                style={smallInput}
              />
            ) : (
              <span>{s}</span>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditStaff(i)} style={secondaryBtn}>
                Düzenle
              </button>

              <button onClick={() => deleteStaff(i)} style={dangerBtn}>
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>✂️ Servisler</h3>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 16 }}>
          <input
            placeholder="Servis adı"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            style={input}
          />

          <input
            placeholder="Fiyat"
            value={servicePrice}
            onChange={(e) => setServicePrice(e.target.value)}
            style={input}
          />

          <select
            value={serviceDuration}
            onChange={(e) => setServiceDuration(e.target.value)}
            style={input}
          >
            <option value="15">15 dk</option>
            <option value="30">30 dk</option>
            <option value="45">45 dk</option>
            <option value="60">60 dk</option>
            <option value="90">90 dk</option>
            <option value="120">120 dk</option>
          </select>

          <button onClick={addService} style={primaryBtn}>
            Ekle
          </button>
        </div>

        {services.map((s, i) => (
          <div key={i} style={serviceRow}>
            <input
              value={s.name}
              onChange={(e) => updateService(i, "name", e.target.value)}
              style={smallInput}
            />

            <input
              value={s.price}
              onChange={(e) => updateService(i, "price", e.target.value)}
              style={smallInput}
            />

            <input
              value={s.duration}
              onChange={(e) => updateService(i, "duration", e.target.value)}
              style={smallInput}
            />

            <button onClick={() => deleteService(i)} style={dangerBtn}>
              Sil
            </button>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>⏰ Çalışma Saatleri</h3>

        {workHours.map((d, i) => (
          <div key={i} style={hoursRow}>
            <span style={{ width: 120, fontWeight: 500 }}>{d.day}</span>

            <input
              type="time"
              value={d.start}
              onChange={(e) => updateHours(i, "start", e.target.value)}
              style={smallInput}
            />

            <input
              type="time"
              value={d.end}
              onChange={(e) => updateHours(i, "end", e.target.value)}
              style={smallInput}
            />

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={d.closed}
                onChange={(e) => updateHours(i, "closed", e.target.checked)}
              />
              Kapalı
            </label>
          </div>
        ))}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>🧑‍🔧 Personel Ayarları</h3>

        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          style={{ ...input, maxWidth: 300, marginBottom: 20 }}
        >
          <option value="">Personel seç</option>
          {staff.map((s, i) => (
            <option key={i} value={`staff${i}`}>
              {s}
            </option>
          ))}
        </select>

        <div style={subCard}>
          <h4 style={subTitle}>☕ Mola</h4>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <input
              type="datetime-local"
              value={breakStart}
              onChange={(e) => setBreakStart(e.target.value)}
              style={input}
            />

            <input
              type="datetime-local"
              value={breakEnd}
              onChange={(e) => setBreakEnd(e.target.value)}
              style={input}
            />

            <button onClick={addBreak} style={warningBtn}>
              Mola ekle
            </button>
          </div>

          {breaks.length === 0 && <div style={emptyText}>Henüz mola eklenmedi</div>}

          {breaks.map((b, i) => (
            <div key={i} style={listRow}>
              <span>
                {staffLabel(b.staff)} → {b.start} / {b.end}
              </span>

              <button onClick={() => deleteBreak(i)} style={dangerBtn}>
                Sil
              </button>
            </div>
          ))}
        </div>

        <div style={subCard}>
          <h4 style={subTitle}>🏖️ Tatil</h4>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <input
              type="date"
              value={holidayStart}
              onChange={(e) => setHolidayStart(e.target.value)}
              style={input}
            />

            <input
              type="date"
              value={holidayEnd}
              onChange={(e) => setHolidayEnd(e.target.value)}
              style={input}
            />

            <button onClick={addHoliday} style={dangerBtn}>
              Tatil ekle
            </button>
          </div>

          {holidays.length === 0 && <div style={emptyText}>Henüz tatil eklenmedi</div>}

          {holidays.map((h, i) => (
            <div key={i} style={listRow}>
              <span>
                {staffLabel(h.staff)} → {h.start} / {h.end}
              </span>

              <button onClick={() => deleteHoliday(i)} style={dangerBtn}>
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={saveAll} style={successBtn}>
          Kaydet
        </button>

        <button onClick={logout} style={darkBtn}>
          Admin Çıkış
        </button>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 18,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
}

const subCard: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 16,
  marginTop: 16,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 20,
  fontWeight: 700,
}

const subTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
  fontWeight: 700,
}

const row: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 12,
}

const input: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
}

const smallInput: React.CSSProperties = {
  padding: 8,
  borderRadius: 10,
  border: "1px solid #d1d5db",
}

const listRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid #e5e7eb",
}

const serviceRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr auto",
  gap: 10,
  alignItems: "center",
  marginBottom: 10,
}

const hoursRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 12,
  flexWrap: "wrap",
}

const emptyText: React.CSSProperties = {
  color: "#64748b",
  fontSize: 14,
}

const primaryBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  cursor: "pointer",
}

const secondaryBtn: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  borderRadius: 999,
  padding: "8px 14px",
  cursor: "pointer",
}

const dangerBtn: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "8px 14px",
  cursor: "pointer",
}

const warningBtn: React.CSSProperties = {
  background: "#f59e0b",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  cursor: "pointer",
}

const successBtn: React.CSSProperties = {
  background: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  cursor: "pointer",
}

const darkBtn: React.CSSProperties = {
  background: "#111827",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  cursor: "pointer",
}