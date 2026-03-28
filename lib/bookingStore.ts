import { create } from "zustand"

type BookingState = {
  selectedStaff: string | null
  setStaff: (id: string) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedStaff: null,
  setStaff: (id) => set({ selectedStaff: id }),
}))