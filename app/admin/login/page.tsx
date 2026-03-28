"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (auth === "true") {
      router.replace("/admin/calendar")
    }
  }, [router])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const ADMIN_USERNAME = "admin"
    const ADMIN_PASSWORD = "123456"

    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true")
      localStorage.setItem("adminUsername", username.trim())
      router.replace("/admin/calendar")
      return
    }

    setError("Kullanıcı adı veya şifre yanlış")
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
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: 36,
          borderRadius: 20,
          width: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
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

        <h1
          style={{
            marginTop: 0,
            marginBottom: 10,
            fontSize: 34,
            fontWeight: 800,
            color: "#111827",
          }}
        >
          Admin Giriş
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          Yönetim paneline girmek için kullanıcı adı ve şifrenizi yazın.
        </p>

        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError("")
          }}
          style={inputStyle}
        />

        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={show ? "text" : "password"}
            placeholder="Şifre"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("")
            }}
            style={{
              ...inputStyle,
              marginBottom: 0,
              paddingRight: 46,
            }}
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#64748b",
              padding: 0,
            }}
          >
            {show ? "🙈" : "👁️"}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 14,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 14,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Giriş Yap
        </button>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "1px solid #d1d5db",
  marginBottom: 14,
  fontSize: 15,
  outline: "none",
}