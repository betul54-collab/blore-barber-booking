"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isLoginPage = pathname === "/admin/login"
    const auth = localStorage.getItem("adminAuth")

    if (isLoginPage) {
      setReady(true)
      return
    }

    if (auth !== "true") {
      router.replace("/admin/login")
      return
    }

    setReady(true)
  }, [pathname, router])

  function logout() {
    localStorage.removeItem("adminAuth")
    localStorage.removeItem("adminUsername")
    router.replace("/admin/login")
  }

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
        }}
      >
        Yükleniyor...
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          width: 240,
          background: "rgba(15,23,42,0.88)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ color: "white", marginTop: 0 }}>Blore</h2>

          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            <Link href="/admin/calendar" style={menuLink}>
              📅 Takvim
            </Link>

            <Link href="/admin/settings" style={menuLink}>
              ⚙️ Ayarlar
            </Link>
          </div>
        </div>

        <button onClick={logout} style={logoutBtn}>
          Çıkış
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            height: 70,
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            color: "white",
          }}
        >
          <h3 style={{ margin: 0 }}>Admin Panel</h3>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 14,
            }}
          >
            {localStorage.getItem("adminUsername") || "Admin"}
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>{children}</div>
      </div>
    </div>
  )
}

const menuLink: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  fontWeight: 600,
}

const logoutBtn: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  cursor: "pointer",
  fontWeight: 700,
}