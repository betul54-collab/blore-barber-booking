"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function TimeContent() {
  const searchParams = useSearchParams()

  const staff = searchParams.get("staff")
  const service = searchParams.get("service")
  const date = searchParams.get("date")

  return (
    <div style={{ padding: 20 }}>
      <h1>Saat Seç</h1>

      <p><b>Personel:</b> {staff}</p>
      <p><b>Servis:</b> {service}</p>
      <p><b>Tarih:</b> {date}</p>

      {/* Buraya saat listeni sonra bağlayacağız */}
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <TimeContent />
    </Suspense>
  )
}