"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const isLogged = localStorage.getItem("adminAuth")

    if (isLogged === "true") {
      // giriş yapılmış → takvime git
      router.replace("/admin/calendar")
    } else {
      // giriş yok → login sayfasına git
      router.replace("/admin/login")
    }
  }, [])

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f172a",
      color: "white"
    }}>
      Yönlendiriliyor...
    </div>
  )
}