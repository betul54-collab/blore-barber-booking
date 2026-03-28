// lib/timeSlots.ts
export function generateTimeSlots(
  start = "10:00",
  end = "18:00",
  step = 30
): string[] {
  const slots: string[] = []

  let current = toMinutes(start)
  const endMin = toMinutes(end)

  while (current + step <= endMin) {
    slots.push(fromMinutes(current))
    current += step
  }

  return slots
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function fromMinutes(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`
}