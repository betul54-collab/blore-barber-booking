"use client"

import { useRouter } from "next/navigation"
import { useBookingStore } from "@/lib/bookingStore"
import { useEffect } from "react"

const SERVICES = [
  { id: "s1", name: "Saç Kesimi" },
  { id: "s2", name: "Sakal Tıraşı" },
  { id: "s3", name: "Saç + Sakal" },
]

export default function ServicePage() {
  const router = useRouter()
  const { staff, setService } = useBookingStore()

  useEffect(() => {
    if (!staff) {
      router.push("/booking/staff")
    }
  }, [staff, router])

  const handleSelect = (serviceId: string) => {
    setService(serviceId)
    router.push("/booking/date")
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-6">Service wählen</h1>

      <div className="w-full max-w-md space-y-4">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => handleSelect(service.id)}
            className="w-full bg-white text-black py-4 rounded-xl hover:opacity-90 transition"
          >
            {service.name}
          </button>
        ))}
      </div>
    </div>
  )
}