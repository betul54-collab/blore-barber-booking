"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.replace("/admin/calendar")
    } catch (err: any) {
      console.error("Login error:", err?.code, err?.message)
      setError(`Giriş başarısız (${err?.code || "bilinmeyen hata"})`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: 20,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "white",
          color: "#111827",
          padding: 32,
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <h1 style={{ margin: "0 0 20px", fontSize: 26, fontWeight: 800 }}>
          Admin Girişi
        </h1>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş"}
        </button>

        {error && (
          <p style={{ color: "#dc2626", marginTop: 14, marginBottom: 0, fontSize: 14 }}>
            {error}
          </p>
        )}
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 15,
  outline: "none",
}