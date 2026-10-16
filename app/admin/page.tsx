"use client"

import { salonPath } from "@/lib/salonClient";
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(salonPath("/admin/calendar"))
      } else {
        router.replace(salonPath("/admin/login"))
      }
    })

    return () => unsubscribe()
  }, [router])

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      Yönlendiriliyor...
    </div>
  )
}
