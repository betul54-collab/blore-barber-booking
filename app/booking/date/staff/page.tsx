'use client'

import { useRouter } from 'next/navigation'
import BookingLayout from '../../components/BookingLayout'

export default function StaffPage() {
  const router = useRouter()

  return (
    <BookingLayout
      title="Personel Seçimi"
      buttonText="Devam et"
      onNext={() => router.push('/booking/confirm')}
    >
      <p>👤 Mehmet Bey</p>
      <p>👤 Ali Bey</p>
    </BookingLayout>
  )
}