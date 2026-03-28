"use client"

import { useEffect, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import dayGridPlugin from "@fullcalendar/daygrid"
import trLocale from "@fullcalendar/core/locales/tr"
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

type Service = {
  name: string
  price: number
  duration: number
}

type Booking = {
  id: string | number
  name: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  staff: string
  note?: string
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

export default function CalendarPage() {
  const calendarRef = useRef<any>(null)

  const [resources, setResources] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [openView, setOpenView] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+905")
  const [service, setService] = useState("")
  const [note, setNote] = useState("")
  const [view, setView] = useState("resourceTimeGridDay")
  const [currentDate, setCurrentDate] = useState(new Date())

  const [firebaseBookings, setFirebaseBookings] = useState<Booking[]>([])
  const [firebaseLoaded, setFirebaseLoaded] = useState(false)

  function getStaff(): string[] {
    return JSON.parse(localStorage.getItem("staff") || "[]")
  }

  function getServices(): Service[] {
    return JSON.parse(localStorage.getItem("services") || "[]")
  }

  function getBookings(): Booking[] {
    return JSON.parse(localStorage.getItem("bookings") || "[]")
  }

  function getBreaks(): BreakItem[] {
    return JSON.parse(localStorage.getItem("breaks") || "[]")
  }

  function getHolidays(): HolidayItem[] {
    return JSON.parse(localStorage.getItem("holidays") || "[]")
  }

  function getActiveBookings(): Booking[] {
    if (firebaseLoaded) return firebaseBookings
    return getBookings()
  }

  function holidayRange(item: HolidayItem) {
    const start = new Date(`${item.start}T00:00`)
    const end = new Date(`${item.end}T00:00`)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }

  function formatDateWithDay(date: Date) {
    const text = date.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  function handlePhone(value: string) {
    let digits = value.replace(/\D/g, "")
    if (!digits.startsWith("905")) digits = "905"
    digits = digits.slice(0, 12)
    setPhone("+" + digits)
  }

  function loadStaff() {
    const staff = getStaff()

    const formatted = staff.map((s, i) => ({
      id: `staff${i}`,
      title: s,
    }))

    setResources(formatted)
  }

  function loadServices() {
    setServices(getServices())
  }

  function loadEvents(currentBookings?: Booking[]) {
    const bookings = currentBookings || getActiveBookings()
    const breaks = getBreaks()
    const holidays = getHolidays()

    const bookingEvents = bookings.map((b) => {
      const start = new Date(`${b.date}T${b.time}`)
      const end = new Date(start.getTime() + b.duration * 60000)

      return {
        id: `booking-${b.id}`,
        title: `${b.name} - ${b.service}`,
        start,
        end,
        resourceId: b.staff,
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        textColor: "#ffffff",
        editable: true,
        extendedProps: {
          sourceType: "booking",
          bookingId: b.id,
          phone: b.phone,
          service: b.service,
          note: b.note || "",
        },
      }
    })

    const breakEvents = breaks.map((b, i) => ({
      id: `break-${i}`,
      title: "Mola",
      start: b.start,
      end: b.end,
      resourceId: b.staff,
      backgroundColor: "#f59e0b",
      borderColor: "#f59e0b",
      textColor: "#ffffff",
      editable: false,
      extendedProps: {
        sourceType: "break",
      },
    }))

    const holidayEvents = holidays.map((h, i) => {
      const range = holidayRange(h)

      return {
        id: `holiday-${i}`,
        title: "Tatil",
        start: range.start,
        end: range.end,
        resourceId: h.staff,
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        textColor: "#ffffff",
        editable: false,
        extendedProps: {
          sourceType: "holiday",
        },
      }
    })

    setEvents([...bookingEvents, ...breakEvents, ...holidayEvents])
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const data: Booking[] = snapshot.docs.map((item) => {
        const row = item.data() as any

        return {
          id: item.id,
          name: row.name || "",
          phone: row.phone || "",
          service: row.service || "",
          date: row.date || "",
          time: row.time || "",
          duration: Number(row.duration || 0),
          staff: row.staffId || row.staff || "",
          note: row.note || "",
        }
      })

      setFirebaseBookings(data)
      setFirebaseLoaded(true)
      loadEvents(data)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    function syncAll() {
      loadStaff()
      loadServices()
      loadEvents()
    }

    syncAll()

    window.addEventListener("settingsUpdated", syncAll)
    window.addEventListener("storage", syncAll)

    return () => {
      window.removeEventListener("settingsUpdated", syncAll)
      window.removeEventListener("storage", syncAll)
    }
  }, [firebaseBookings, firebaseLoaded])

  function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && endA > startB
  }

  function hasConflict(
    resourceId: string,
    start: Date,
    end: Date,
    ignoreBookingId?: string | number
  ) {
    const bookings = getActiveBookings()
    const breaks = getBreaks()
    const holidays = getHolidays()

    const bookingConflict = bookings.some((b) => {
      if (b.staff !== resourceId) return false
      if (ignoreBookingId && String(b.id) === String(ignoreBookingId)) return false

      const bStart = new Date(`${b.date}T${b.time}`)
      const bEnd = new Date(bStart.getTime() + b.duration * 60000)

      return overlaps(start, end, bStart, bEnd)
    })

    if (bookingConflict) return true

    const breakConflict = breaks.some((b) => {
      if (b.staff !== resourceId) return false
      const bStart = new Date(b.start)
      const bEnd = new Date(b.end)
      return overlaps(start, end, bStart, bEnd)
    })

    if (breakConflict) return true

    const holidayConflict = holidays.some((h) => {
      if (h.staff !== resourceId) return false
      const range = holidayRange(h)
      return overlaps(start, end, range.start, range.end)
    })

    return holidayConflict
  }

  async function createBookingFromCalendar() {
    const selectedService = services.find((s) => s.name === service)

    if (!selectedSlot) return
    if (!name.trim() || !selectedService) {
      alert("Ad ve servis gir")
      return
    }

    const resourceId = selectedSlot.resource?.id
    const start = new Date(selectedSlot.start)
    const end = new Date(start.getTime() + selectedService.duration * 60000)

    if (hasConflict(resourceId, start, end)) {
      alert("Bu saat dolu, mola var veya personel tatilde")
      return
    }

    const date = start.toISOString().split("T")[0]
    const time = start.toTimeString().slice(0, 5)

    await addDoc(collection(db, "bookings"), {
      name,
      phone,
      service,
      date,
      time,
      duration: selectedService.duration,
      staff: resourceId,
      staffId: resourceId,
      note,
      createdAt: new Date().toISOString(),
    })

    setName("")
    setPhone("+905")
    setService("")
    setNote("")
    setSelectedSlot(null)
    setCreateOpen(false)
  }

  async function updateBookingInStorage(
    bookingId: number | string,
    newStart: Date,
    newEnd: Date,
    resourceId: string
  ) {
    await updateDoc(doc(db, "bookings", String(bookingId)), {
      date: newStart.toISOString().split("T")[0],
      time: newStart.toTimeString().slice(0, 5),
      duration: Math.round((newEnd.getTime() - newStart.getTime()) / 60000),
      staff: resourceId,
      staffId: resourceId,
    })
  }

  async function deleteBooking(bookingId: number | string) {
    await deleteDoc(doc(db, "bookings", String(bookingId)))
    setDetailOpen(false)
    setSelectedEvent(null)
  }

  function changeView(nextView: string) {
    setView(nextView)
    setOpenView(false)
    calendarRef.current?.getApi().changeView(nextView)
  }

  function goPrev() {
    calendarRef.current?.getApi().prev()
  }

  function goNext() {
    calendarRef.current?.getApi().next()
  }

  function goToday() {
    calendarRef.current?.getApi().today()
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>📅 Takvim</h1>
        <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.72)" }}>
          {formatDateWithDay(currentDate)}
        </p>

        {new Date().toDateString() === currentDate.toDateString() && (
          <div
            style={{
              display: "inline-flex",
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(37,99,235,0.18)",
              color: "#93c5fd",
              fontSize: 13,
              fontWeight: 700,
              border: "1px solid rgba(147,197,253,0.25)",
            }}
          >
            Bugün
          </div>
        )}
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 24,
          padding: 18,
          backdropFilter: "blur(18px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={goPrev} style={roundBtn}>
              ‹
            </button>

            <button onClick={goNext} style={roundBtn}>
              ›
            </button>

            <button onClick={goToday} style={chipBtn}>
              Bugün
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={() => setOpenView(!openView)} style={chipBtn}>
              {view === "resourceTimeGridDay" && "Gün"}
              {view === "timeGridWeek" && "Hafta"}
              {view === "dayGridMonth" && "Ay"} ▼
            </button>

            {openView && (
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  overflow: "hidden",
                  zIndex: 100,
                  minWidth: 140,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                }}
              >
                <div onClick={() => changeView("resourceTimeGridDay")} style={dropdownItem}>
                  Gün
                </div>
                <div onClick={() => changeView("timeGridWeek")} style={dropdownItem}>
                  Hafta
                </div>
                <div onClick={() => changeView("dayGridMonth")} style={dropdownItem}>
                  Ay
                </div>
              </div>
            )}
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, resourceTimeGridPlugin, interactionPlugin, dayGridPlugin]}
          locale={trLocale}
          initialView={view}
          headerToolbar={false}
          allDaySlot={false}
          resources={resources}
          events={events}
          selectable={true}
          editable={true}
          eventDurationEditable={true}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          height="80vh"
          nowIndicator={true}
          datesSet={(info) => setCurrentDate(info.start)}
          dayMaxEvents={false}
          dayMaxEventRows={false}
          moreLinkClick="none"
          moreLinkContent={() => null}
          eventMaxStack={999}
          select={(info) => {
            setSelectedSlot(info)
            setCreateOpen(true)
          }}
          selectAllow={(info) => {
            const start = new Date(info.start)
            const end = new Date(info.end)
            return !hasConflict(info.resource?.id, start, end)
          }}
          eventClick={(info) => {
            setSelectedEvent(info.event)
            setDetailOpen(true)
          }}
          eventDrop={async (info) => {
            if (info.event.extendedProps?.sourceType !== "booking") {
              info.revert()
              return
            }

            const bookingId = info.event.extendedProps?.bookingId
            const resourceId =
              info.event.getResources?.()[0]?.id || info.event._def?.resourceIds?.[0]
            const start = info.event.start
            const end = info.event.end

            if (!start || !end) {
              info.revert()
              return
            }

            if (hasConflict(resourceId, new Date(start), new Date(end), bookingId)) {
              alert("Bu saat dolu, mola var veya personel tatilde")
              info.revert()
              return
            }

            try {
              await updateBookingInStorage(bookingId, new Date(start), new Date(end), resourceId)
            } catch (error) {
              console.error(error)
              info.revert()
              alert("Güncellenemedi")
            }
          }}
          eventResize={async (info) => {
            if (info.event.extendedProps?.sourceType !== "booking") {
              info.revert()
              return
            }

            const bookingId = info.event.extendedProps?.bookingId
            const resourceId =
              info.event.getResources?.()[0]?.id || info.event._def?.resourceIds?.[0]
            const start = info.event.start
            const end = info.event.end

            if (!start || !end) {
              info.revert()
              return
            }

            if (hasConflict(resourceId, new Date(start), new Date(end), bookingId)) {
              alert("Bu saat dolu, mola var veya personel tatilde")
              info.revert()
              return
            }

            try {
              await updateBookingInStorage(bookingId, new Date(start), new Date(end), resourceId)
            } catch (error) {
              console.error(error)
              info.revert()
              alert("Güncellenemedi")
            }
          }}
        />

        <style jsx global>{`
          .fc {
            color: white;
          }

          .fc-more-link,
          .fc-daygrid-more-link {
            display: none !important;
          }

          .fc-theme-standard td,
          .fc-theme-standard th,
          .fc-theme-standard .fc-scrollgrid {
            border-color: rgba(255, 255, 255, 0.08) !important;
          }

          .fc-col-header-cell {
            background: rgba(255, 255, 255, 0.05);
          }

          .fc-timegrid-slot {
            height: 60px !important;
            border-color: rgba(255, 255, 255, 0.07) !important;
          }

          .fc-timegrid-axis,
          .fc-col-header-cell-cushion,
          .fc-timegrid-slot-label-cushion {
            color: #e5e7eb !important;
          }

          .fc-col-header-cell-cushion {
            font-weight: 700 !important;
          }

          .fc-timegrid-slot-label-cushion {
            font-weight: 600 !important;
          }

          .fc-event {
            border: none !important;
            border-radius: 14px !important;
            padding: 4px 8px !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22) !important;
            font-weight: 600 !important;
            transition: all 0.2s ease;
          }

          .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28) !important;
          }

          .fc-day-today {
            background: rgba(59, 130, 246, 0.08) !important;
          }

          .fc-timegrid-col:hover {
            background: rgba(255, 255, 255, 0.03) !important;
          }

          .fc-timegrid-slot:hover {
            background: rgba(255, 255, 255, 0.02) !important;
          }

          .fc-timegrid-now-indicator-line {
            border-color: #ef4444 !important;
            border-width: 2px !important;
          }

          .fc-daygrid-day-number,
          .fc-daygrid-day-top,
          .fc-daygrid-day-frame {
            color: white !important;
          }
        `}</style>
      </div>

      {createOpen && (
        <div onClick={() => setCreateOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <h3 style={{ marginTop: 0 }}>Randevu Oluştur</h3>

            <input
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />

            <input
              value={phone}
              onChange={(e) => handlePhone(e.target.value)}
              style={inputStyle}
            />

            <select value={service} onChange={(e) => setService(e.target.value)} style={inputStyle}>
              <option value="">Servis seç</option>
              {services.map((s, i) => (
                <option key={i} value={s.name}>
                  {s.name} — {s.duration} dk
                </option>
              ))}
            </select>

            <textarea
              placeholder="Not ekle"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 12,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                minHeight: 90,
                resize: "none",
                fontFamily: "inherit",
              }}
            />

            <div style={infoBox}>
              <div>
                Seçilen saat:{" "}
                <b>
                  {selectedSlot?.start
                    ? new Date(selectedSlot.start).toLocaleString("tr-TR")
                    : "-"}
                </b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setCreateOpen(false)} style={secondaryBtn}>
                İptal
              </button>
              <button onClick={createBookingFromCalendar} style={primaryBtn}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {detailOpen && selectedEvent && (
        <div onClick={() => setDetailOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <h3 style={{ marginTop: 0 }}>{selectedEvent.title}</h3>

            <p>
              Tür: <b>{selectedEvent.extendedProps?.sourceType}</b>
            </p>

            {selectedEvent.extendedProps?.phone && (
              <p>
                Telefon: <b>{selectedEvent.extendedProps.phone}</b>
              </p>
            )}

            {selectedEvent.extendedProps?.service && (
              <p>
                Servis: <b>{selectedEvent.extendedProps.service}</b>
              </p>
            )}

            {selectedEvent.extendedProps?.note && (
              <p>
                Not: <b>{selectedEvent.extendedProps.note}</b>
              </p>
            )}

            <p>
              Başlangıç: <b>{selectedEvent.start?.toLocaleString("tr-TR")}</b>
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setDetailOpen(false)} style={secondaryBtn}>
                Kapat
              </button>

              {selectedEvent.extendedProps?.sourceType === "booking" && (
                <button
                  onClick={() => deleteBooking(selectedEvent.extendedProps.bookingId)}
                  style={dangerBtn}
                >
                  Randevuyu Sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
}

const modal: React.CSSProperties = {
  width: 420,
  background: "white",
  color: "#111827",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
}

const infoBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "#f8fafc",
  marginBottom: 16,
}

const primaryBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 999,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
}

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 999,
  border: "none",
  background: "#e5e7eb",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 700,
}

const dangerBtn: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 999,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
}

const roundBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: "none",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  cursor: "pointer",
  fontSize: 28,
  lineHeight: 1,
}

const chipBtn: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
}

const dropdownItem: React.CSSProperties = {
  padding: "12px 14px",
  cursor: "pointer",
  color: "white",
}