"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBupAA2F6DQa18sY-vhVzcSHJDCDT4NOYE",
  authDomain: "blore-barberbook.firebaseapp.com",
  projectId: "blore-barberbook",
  storageBucket: "blore-barberbook.firebasestorage.app",
  messagingSenderId: "932664395544",
  appId: "1:932664395544:web:469251d17f992b8726806d",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

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

export default function ConfirmPage() {
  const router = useRouter()

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("bookingData")

    if (saved) {
      setBooking(JSON.parse(saved))
    }
  }, [])

  async function handleConfirm() {
    if (!booking) return

    try {
      setLoading(true)

      await addDoc(collection(db, "bookings"), {
        name: booking.name,
        phone: booking.phone,
        service: booking.service,
        price: booking.price,
        duration: booking.duration,
        date: booking.date,
        time: booking.time,
        staff: booking.staff,
        staffId: booking.staffId || "",
        createdAt: new Date().toISOString(),
      })

      router.push("/booking/success")
    } catch (error) {
      console.error(error)
      alert("Randevu kaydedilemedi ❌")
    } finally {
      setLoading(false)
    }
  }

  if (!booking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
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
        justifyContent: "center",
        alignItems: "center",
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
          Randevu Onayı
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Bilgileri kontrol edin ve randevunuzu onaylayın.
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 18,
            padding: 20,
            display: "grid",
            gap: 12,
            marginBottom: 24,
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

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.back()}
            disabled={loading}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: "none",
              background: "#e5e7eb",
              color: "#111827",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Geri
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Kaydediliyor..." : "Randevuyu Onayla"}
          </button>
        </div>
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
      <span style={{ color: "#111827", fontWeight: 700, textAlign: "right" }}>
        {value}
      </span>
    </div>
  )
}