// lib/checkBookingConflicts.ts

type Booking = {
  time: string;      // "13:00"
  duration: number;  // dakika
};

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function hasConflict(
  existingBookings: Booking[],
  selectedTime: string,
  duration: number
): boolean {
  const start = toMinutes(selectedTime);
  const end = start + duration;

  return existingBookings.some((booking) => {
    const bookingStart = toMinutes(booking.time);
    const bookingEnd = bookingStart + booking.duration;

    return start < bookingEnd && end > bookingStart;
  });
}