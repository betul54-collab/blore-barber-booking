"use client"

type Booking = {
  id: string
  name: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  staff: string
  note?: string
  status?: string
}

export default function BookingPopup({ booking }: { booking: Booking }) {
  if (!booking) return null

  return (
    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold mb-4">Randevu Detayı</h2>

      <p><b>Ad:</b> {booking.name}</p>
      <p><b>Telefon:</b> {booking.phone}</p>
      <p><b>Servis:</b> {booking.service}</p>
      <p><b>Tarih:</b> {booking.date}</p>
      <p><b>Saat:</b> {booking.time}</p>
      <p><b>Süre:</b> {booking.duration} dk</p>
      <p><b>Personel:</b> {booking.staff}</p>

      {booking.note && <p><b>Not:</b> {booking.note}</p>}
      {booking.status && <p><b>Durum:</b> {booking.status}</p>}
    </div>
  )
}