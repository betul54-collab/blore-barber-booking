import { create } from "zustand";

type Service = {
  id: string;
  name: string;
  duration: number;
};

type Staff = {
  id: string;
  name: string;
};

type BookingState = {
  date: string | null;
  time: string | null;
  staff: Staff | null;
  services: Service[];

  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setStaff: (staff: Staff) => void;
  toggleService: (service: Service) => void;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  date: null,
  time: null,
  staff: null,
  services: [],

  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setStaff: (staff) => set({ staff }),

  toggleService: (service) => {
    const exists = get().services.find((s) => s.id === service.id);
    if (exists) {
      set({ services: get().services.filter((s) => s.id !== service.id) });
    } else {
      set({ services: [...get().services, service] });
    }
  },
}));