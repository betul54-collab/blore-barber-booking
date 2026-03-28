// lib/getAvailableSlots.ts

type Booking = {
  time: string;      // "13:00"
  duration: number;  // dakika
};

import { hasConflict } from "./checkBookingConflicts";

export function getAvailableSlots(
  allSlots: string[],
  bookings: Booking[],
  duration: number
): string[] {
  return allSlots.filter(
    (slot) => !hasConflict(bookings, slot, duration)
  );
}