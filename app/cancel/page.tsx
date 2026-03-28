"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Booking = {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  duration?: number
  staff?: string
}

export default function CancelPage() {
  const router = useRouter()

  const [phone, setPhone] = useState("+905")
  const [results, setResults] = useState<Booking[]>([])
  const [searched, setSearched] = useState(false)
  const [cancelledBooking, setCancelledBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)

  function normalizePhone(value: string) {
    let digits = value.replace(/\D/g, "")

    if (!digits.startsWith("905")) {
      digits = "905"
    }

    digits = digits.slice(0, 12)

    return "+" + digits
  }

  function handlePhone(value: string) {
    setPhone(normalizePhone(value))
  }

  function formatDate(dateStr: string) {
    const d = new Date(`${dateStr}T00:00:00`)
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  async function searchBooking() {
    try {
      setLoading(true)
      setSearched(true)

      const formatted = normalizePhone(phone)
      const snapshot = await getDocs(collection(db, "bookings"))

      const found: Booking[] = snapshot.docs
        .map((item) => {
          const data = item.data() as any

          return {
            id: item.id,
            name: data.name || "",
            phone: data.phone || "",
            service: data.service || "",
            date: data.date || "",
            time: data.time || "",
            duration: data.duration,
            staff: data.staff,
          }
        })
        .filter((b) => b.phone === formatted)

      setResults(found)

      if (found.length === 0) {
        setCancelledBooking(null)
      }
    } catch (error) {
      console.error(error)
      alert("Randevular alınamadı ❌")
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(id: string) {
    try {
      setLoading(true)

      const bookingToCancel = results.find((b) => b.id === id) || null

      await deleteDoc(doc(db, "bookings", id))

      const updatedResults = results.filter((r) => r.id !== id)
      setResults(updatedResults)

      window.dispatchEvent(new Event("bookingsUpdated"))

      setCancelledBooking(bookingToCancel)

      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error) {
      console.error(error)
      alert("Randevu iptal edilemedi ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "34px",
          borderRadius: "22px",
          width: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
          position: "relative",
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
            marginBottom: 14,
          }}
        >
          Blore Barber
        </div>

        <h2
          style={{
            marginTop: 0,
            marginBottom: 10,
            fontSize: 34,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Randevu İptal
        </h2>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 22,
            lineHeight: 1.6,
          }}
        >
          Telefon numaranızı girin, randevunuzu bulun ve tek tıkla iptal edin.
        </p>

        <input
          value={phone}
          onChange={(e) => handlePhone(e.target.value)}
          placeholder="+905..."
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "14px",
            fontSize: 15,
            outline: "none",
          }}
        />

        <button
          onClick={searchBooking}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "14px",
            marginBottom: "22px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: "0 12px 30px rgba(37,99,235,0.25)",
          }}
        >
          {loading ? "Yükleniyor..." : "Randevularımı Bul"}
        </button>

        {searched && results.length === 0 && !cancelledBooking && !loading && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "14px",
              borderRadius: "14px",
              marginBottom: "16px",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Bu numaraya ait randevu bulunamadı
          </div>
        )}

        {results.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #e5e7eb",
              padding: "16px",
              borderRadius: "16px",
              marginBottom: "12px",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
              {formatDate(r.date)} — {r.time}
            </div>

            <div style={{ color: "#334155", marginBottom: 4 }}>
              <b>İsim:</b> {r.name}
            </div>

            <div style={{ color: "#334155", marginBottom: 4 }}>
              <b>Servis:</b> {r.service}
            </div>

            {r.staff && (
              <div style={{ color: "#334155", marginBottom: 12 }}>
                <b>Personel:</b> {r.staff}
              </div>
            )}

            <button
              onClick={() => cancelBooking(r.id)}
              disabled={loading}
              style={{
                marginTop: "4px",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Randevuyu İptal Et
            </button>
          </div>
        ))}

        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: "10px",
            width: "100%",
            background: "#64748b",
            color: "white",
            border: "none",
            padding: "12px 14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Ana Sayfa
        </button>
      </div>

      {cancelledBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "18px",
              width: "340px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ marginBottom: 10 }}>Randevu İptal Edildi ✅</h2>

            <p style={{ marginBottom: 6 }}>
              <b>{cancelledBooking.name}</b>
            </p>

            <p style={{ marginBottom: 6 }}>{cancelledBooking.service}</p>

            <p style={{ marginBottom: 0 }}>
              {formatDate(cancelledBooking.date)} - {cancelledBooking.time}
            </p>

            <p style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
              3 saniye sonra ana sayfaya dönülüyor...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}