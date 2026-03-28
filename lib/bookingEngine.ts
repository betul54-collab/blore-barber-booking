// === MODELLER ===
export type Staff = {
  id: string;
  name: string;
  workStart: string;
  workEnd: string;
};

export type Booking = {
  staffId: string;
  time: string;
  duration: number;
};

// === PERSONELLER (ADMIN TANIMLAR) ===
export const STAFF: Staff[] = [
  { id: "p1", name: "Ali", workStart: "09:00", workEnd: "18:00" },
  { id: "p2", name: "Mehmet", workStart: "10:00", workEnd: "19:00" },
];

// === YARDIMCI ===
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// === SLOT BUL ===
function findSlot(
  staff: Staff,
  bookings: Booking[],
  duration: number
) {
  const start = toMin(staff.workStart);
  const end = toMin(staff.workEnd);

  const busy = bookings
    .filter(b => b.staffId === staff.id)
    .map(b => ({
      start: toMin(b.time),
      end: toMin(b.time) + b.duration,
    }));

  for (let t = start; t + duration <= end; t += 15) {
    const clash = busy.some(b =>
      t < b.end && t + duration > b.start
    );

    if (!clash) {
      return {
        staffId: staff.id,
        time: `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
      };
    }
  }

  return null;
}

// === ANA MOTOR ===
export function createBooking(
  bookings: Booking[],
  duration: number
) {
  for (const staff of STAFF) {
    const slot = findSlot(staff, bookings, duration);
    if (slot) return slot;
  }
  return null;
}