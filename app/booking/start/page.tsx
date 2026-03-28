"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StartPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  function handleNext() {
    if (!name.trim() || !phone.trim()) {
      alert("Lütfen tüm alanları doldur")
      return
    }

    router.push("/booking/staff")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Blore Barber</h1>

      <input
        type="text"
        placeholder="Ad Soyad"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full max-w-sm mb-4 rounded-xl p-3 text-black"
      />

      <input
        type="text"
        placeholder="+90 5xx xxx xx xx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full max-w-sm mb-4 rounded-xl p-3 text-black"
      />

      <button
        onClick={handleNext}
        className="rounded-xl bg-blue-600 px-6 py-3 font-semibold"
      >
        Weiter
      </button>
    </div>
  )
}