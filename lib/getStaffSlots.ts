// lib/getStaffSlots.ts
import { generateTimeSlots } from "./timeSlots"

export function getStaffSlots(
  staff: any,
  day: string
): string[] {
  const hours = staff.workingHours[day]
  if (!hours) return []

  const [start, end] = hours
  return generateTimeSlots(start, end, 30)
}