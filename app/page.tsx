"use client"
import { addBookingToDb } from "@/lib/bookings"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)

  function goBooking() {
    setLoadingBooking(true)

    setTimeout(() => {
      router.push("/booking")
    }, 250)
  }

  function goCancel() {
    setLoadingCancel(true)

    setTimeout(() => {
      router.push("/cancel")
    }, 250)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "white",
          transition: "all 0.3s ease",
        }}
      >
        <h1
          style={{
            fontSize: 64,
            marginBottom: 16,
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          Blore Barber
        </h1>

        <p
          style={{
            fontSize: 22,
            opacity: 0.92,
            marginBottom: 30,
          }}
        >
          Online randevunuzu hızlıca oluşturun
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            alignItems: "center",
          }}
        >
          <button
            onClick={goBooking}
            disabled={loadingBooking}
            style={{
              minWidth: 240,
              padding: "16px 28px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: loadingBooking
                ? "rgba(255,255,255,0.18)"
                : "linear-gradient(135deg,#7dd3fc,#38bdf8)",
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              cursor: loadingBooking ? "default" : "pointer",
              boxShadow: "0 20px 40px rgba(56,189,248,0.28)",
              transition: "all 0.3s ease",
            }}
          >
            {loadingBooking ? "Yönlendiriliyor..." : "Randevu Al"}
          </button>

          <button
            onClick={goCancel}
            disabled={loadingCancel}
            style={{
              minWidth: 240,
              padding: "14px 24px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: loadingCancel
                ? "rgba(255,255,255,0.18)"
                : "rgba(255,255,255,0.10)",
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              cursor: loadingCancel ? "default" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {loadingCancel ? "Açılıyor..." : "Randevu İptal"}
          </button>
        </div>
      </div>
    </div>
  )
}