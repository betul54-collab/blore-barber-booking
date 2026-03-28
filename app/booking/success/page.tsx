"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type BookingData = {
  name: string
  phone: string
  service: string
  price: number
  duration: number
  date: string
  time: string
  staff: string
  staffId?: string
}

export default function SuccessPage() {
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const saved = localStorage.getItem("bookingData")

    if (saved) {
      setBooking(JSON.parse(saved))
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          localStorage.removeItem("bookingData")
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  if (!booking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: 20,
        }}
      >
        Randevu bilgisi bulunamadı
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          borderRadius: 24,
          padding: 30,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 74,
            height: 74,
            borderRadius: "50%",
            background: "#dcfce7",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 800,
            margin: "0 auto 18px",
          }}
        >
          ✓
        </div>

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
          Randevunuz Oluşturuldu
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Randevu bilgileriniz aşağıdadır.
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 18,
            padding: 20,
            display: "grid",
            gap: 12,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <Row label="Ad Soyad" value={booking.name} />
          <Row label="Telefon" value={booking.phone} />
          <Row label="Personel" value={booking.staff} />
          <Row label="Servis" value={booking.service} />
          <Row label="Fiyat" value={`${booking.price} TL`} />
          <Row label="Süre" value={`${booking.duration} dk`} />
          <Row label="Tarih" value={booking.date} />
          <Row label="Saat" value={booking.time} />
        </div>

        <div
          style={{
            marginBottom: 18,
            color: "#64748b",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {countdown} saniye sonra ana sayfaya dönülecek
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("bookingData")
            router.push("/")
          }}
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
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 10,
      }}
    >
      <span style={{ color: "#64748b", fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#111827", fontWeight: 700, textAlign: "right" }}>{value}</span>
    </div>
  )
}