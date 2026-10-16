"use client"

import { salonPath } from "@/lib/salonClient";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError("")
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.replace(salonPath("/admin/calendar"))
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
          boxSizing: "border-box",
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
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Şifre"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: 0, paddingRight: 84 }}
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "#e5e7eb",
              color: "#111827",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>

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

        <button
          type="button"
          onClick={() => router.push(salonPath("/"))}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 10,
            borderRadius: 12,
            border: "none",
            background: "#64748b",
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Ana Sayfaya Dön
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
  boxSizing: "border-box",
  padding: 14,
  marginBottom: 14,
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  outline: "none",
  background: "white",
  color: "#111827",
}