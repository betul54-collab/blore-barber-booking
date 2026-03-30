import { create } from "zustand"

type BookingState = {
  staff: string | null
  service: string | null
  setStaff: (staff: string) => void
  setService: (service: string) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  staff: null,
  service: null,
  setStaff: (staff) => set({ staff }),
  setService: (service) => set({ service }),
}))