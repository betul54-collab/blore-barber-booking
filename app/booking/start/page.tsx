import { create } from "zustand";

type Client = {
  name: string;
  phone: string;
};

type BookingState = {
  client: Client | null;
  staffId: string | null;
  date: string | null;
  time: string | null;

  setClient: (name: string, phone: string) => void;
  setStaff: (staffId: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  client: null,
  staffId: null,
  date: null,
  time: null,

  setClient: (name, phone) =>
    set({
      client: { name, phone },
    }),

  setStaff: (staffId) => set({ staffId }),
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),

  reset: () =>
    set({
      client: null,
      staffId: null,
      date: null,
      time: null,
    }),
}));