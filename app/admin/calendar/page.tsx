"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import dayGridPlugin from "@fullcalendar/daygrid"
import trLocale from "@fullcalendar/core/locales/tr"
import { auth } from "@/lib/firebase"

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

function ymd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

function hm(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

async function authFetch(url: string, options: RequestInit = {}) {
  await auth.authStateReady()
  const token = await auth.currentUser?.getIdToken()
  if (!token) throw new Error("Giriş yapılmamış")

  return fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
}

export default function CalendarPage() {
  const calendarRef = useRef<any>(null)

  const [staffList, setStaffList] = useState<string[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [breaks, setBreaks] = useState<BreakItem[]>([])
  const [holidays, setHolidays] = useState<HolidayItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [openView, setOpenView] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+905")
  const [service, setService] = useState("")
  const [note, setNote] = useState("")
  const [pickedStaff, setPickedStaff] = useState("")
  const [view, setView] = useState("resourceTimeGridDay")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setStaffList(data.staff ?? [])
      setServices(data.services ?? [])
      setBreaks(data.breaks ?? [])
      setHolidays(data.holidays ?? [])
    } catch (error) {
      console.error(error)
    }
  }, [])

  const loadBookings = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/bookings")
      if (!res.ok) return
      setBookings(await res.json())
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    loadConfig()
    loadBookings()

    const timer = setInterval(() => {
      loadConfig()
      loadBookings()
    }, 20000)

    return () => clearInterval(timer)
  }, [loadConfig, loadBookings])

  const resources = useMemo(
    () => staffList.map((s, i) => ({ id: `staff${i}`, title: s })),
    [staffList]
  )

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

  const events = useMemo(() => {
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

    return [...bookingEvents, ...breakEvents, ...holidayEvents]
  }, [bookings, breaks, holidays])

  function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
    return startA < endB && endA > startB
  }

  function hasConflict(
    resourceId: string,
    start: Date,
    end: Date,
    ignoreBookingId?: string | number
  ) {
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

    const resourceId =
      (selectedSlot.resource?.id as string | undefined) || pickedStaff

    if (!resourceId) {
      alert("Personel seçilemedi")
      return
    }

    const start = new Date(selectedSlot.start)
    const end = new Date(start.getTime() + selectedService.duration * 60000)

    if (hasConflict(resourceId, start, end)) {
      alert("Bu saat dolu, mola var veya personel tatilde")
      return
    }

    try {
      const res = await authFetch("/api/admin/bookings", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          phone,
          service,
          note,
          date: ymd(start),
          time: hm(start),
          duration: selectedService.duration,
          staff: resourceId,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || "Kaydedilemedi")
        return
      }
    } catch (error) {
      console.error(error)
      alert("Kaydedilemedi")
      return
    }

    setName("")
    setPhone("+905")
    setService("")
    setNote("")
    setPickedStaff("")
    setSelectedSlot(null)
    setCreateOpen(false)
    await loadBookings()
  }

  async function updateBookingInStorage(
    bookingId: number | string,
    newStart: Date,
    newEnd: Date,
    resourceId: string
  ) {
    const res = await authFetch("/api/admin/bookings", {
      method: "PATCH",
      body: JSON.stringify({
        id: String(bookingId),
        date: ymd(newStart),
        time: hm(newStart),
        duration: Math.round((newEnd.getTime() - newStart.getTime()) / 60000),
        staff: resourceId,
      }),
    })

    if (!res.ok) throw new Error("update")
    await loadBookings()
  }

  async function deleteBooking(bookingId: number | string) {
    try {
      const res = await authFetch("/api/admin/bookings", {
        method: "DELETE",
        body: JSON.stringify({ id: String(bookingId) }),
      })

      if (!res.ok) {
        alert("Silinemedi")
        return
      }
    } catch (error) {
      console.error(error)
      alert("Silinemedi")
      return
    }

    setDetailOpen(false)
    setSelectedEvent(null)
    await loadBookings()
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
      className="cal-page"
      style={{
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      <div className="cal-head">
        <h1 className="cal-h1" style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>
          📅 Takvim
        </h1>
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

      <div className="cal-card">
        <div className="cal-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={goPrev} className="cal-round">
              ‹
            </button>

            <button onClick={goNext} className="cal-round">
              ›
            </button>

            <button onClick={goToday} className="cal-chip">
              Bugün
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={() => setOpenView(!openView)} className="cal-chip">
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
          longPressDelay={300}
          selectLongPressDelay={300}
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          height={isMobile ? "auto" : "80vh"}
          nowIndicator={true}
          datesSet={(info) => setCurrentDate(info.start)}
          dayMaxEvents={false}
          dayMaxEventRows={false}
          moreLinkClick="none"
          moreLinkContent={() => null}
          eventMaxStack={999}
          select={(info) => {
            setSelectedSlot(info)
            setPickedStaff("")
            setCreateOpen(true)
          }}
          selectAllow={(info) => {
            const start = new Date(info.start)
            const end = new Date(info.end)

            const resourceId = info.resource?.id
            if (!resourceId) return true

            return !hasConflict(resourceId, start, end)
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

            const bookingId = info.event.extendedProps?.bookingId as string | number | undefined
            const resourceId =
              (info.event.getResources?.()[0]?.id as string | undefined) ||
              ((info.event as any)._def?.resourceIds?.[0] as string | undefined)
            const start = info.event.start
            const end = info.event.end

            if (!start || !end || !resourceId || bookingId === undefined) {
              info.revert()
              return
            }

            if (hasConflict(resourceId, new Date(start), new Date(end), bookingId)) {
              alert("Bu saat dolu, mola var veya personel tatilde")
              info.revert()
              return
            }

            try {
              await updateBookingInStorage(
                bookingId,
                new Date(start),
                new Date(end),
                resourceId
              )
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

            const bookingId = info.event.extendedProps?.bookingId as string | number | undefined
            const resourceId =
              (info.event.getResources?.()[0]?.id as string | undefined) ||
              ((info.event as any)._def?.resourceIds?.[0] as string | undefined)
            const start = info.event.start
            const end = info.event.end

            if (!start || !end || !resourceId || bookingId === undefined) {
              info.revert()
              return
            }

            if (hasConflict(resourceId, new Date(start), new Date(end), bookingId)) {
              alert("Bu saat dolu, mola var veya personel tatilde")
              info.revert()
              return
            }

            try {
              await updateBookingInStorage(
                bookingId,
                new Date(start),
                new Date(end),
                resourceId
              )
            } catch (error) {
              console.error(error)
              info.revert()
              alert("Güncellenemedi")
            }
          }}
        />

        <style jsx global>{`
          .cal-page {
            min-height: 100vh;
          }

          .cal-head {
            margin-bottom: 18px;
          }

          .cal-card {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 18px;
            backdrop-filter: blur(18px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          }

          .cal-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            gap: 12px;
            flex-wrap: wrap;
          }

          .cal-round {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            font-size: 28px;
            line-height: 1;
          }

          .cal-chip {
            padding: 10px 16px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.08);
            color: white;
            cursor: pointer;
            font-weight: 700;
          }

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

                    .fc-col-header-cell,
          .fc .fc-scrollgrid-section-sticky > * {
            background: #1e293b !important;
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

          @media (max-width: 768px) {
            .cal-page {
              min-height: 0;
              background: transparent !important;
            }

            .cal-head {
              margin-bottom: 8px;
            }

            .cal-h1 {
              font-size: 22px !important;
            }

            .cal-card {
              padding: 6px;
              border-radius: 16px;
              border: none;
              box-shadow: none;
              backdrop-filter: none;
            }

            .cal-toolbar {
              flex-wrap: nowrap;
              margin-bottom: 8px;
              gap: 8px;
            }

            .cal-round {
              width: 38px;
              height: 38px;
              font-size: 24px;
            }

            .cal-chip {
              padding: 8px 12px;
              font-size: 14px;
            }

            .fc-timegrid-slot {
              height: 48px !important;
            }

            .fc-timegrid-axis-cushion,
            .fc-timegrid-slot-label-cushion {
              padding: 0 4px !important;
              font-size: 12px;
            }

            .fc-col-header-cell-cushion {
              font-size: 13px;
              padding: 6px 2px !important;
            }

            .fc-event {
              border-radius: 8px !important;
              padding: 2px 4px !important;
              font-size: 12px;
            }
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

            {!selectedSlot?.resource && (
              <select
                value={pickedStaff}
                onChange={(e) => setPickedStaff(e.target.value)}
                style={inputStyle}
              >
                <option value="">Personel seç</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            )}

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
                boxSizing: "border-box",
                padding: 12,
                marginBottom: 12,
                borderRadius: 12,
                border: "1px solid #d1d5db",
                minHeight: 90,
                resize: "none",
                fontFamily: "inherit",
                fontSize: 16,
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
                  onClick={() =>
                    deleteBooking(selectedEvent.extendedProps.bookingId as string | number)
                  }
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
  padding: 16,
  boxSizing: "border-box",
  zIndex: 9999,
}

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  maxHeight: "90vh",
  overflowY: "auto",
  boxSizing: "border-box",
  background: "white",
  color: "#111827",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  marginBottom: 12,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  background: "white",
  color: "#111827",
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

const dropdownItem: React.CSSProperties = {
  padding: "12px 14px",
  cursor: "pointer",
  color: "white",
}