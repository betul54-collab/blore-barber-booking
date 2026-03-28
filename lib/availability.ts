// Basit, genişletilebilir uygunluk mantığı
// Gerçek Firestore bağlanınca bu dosya değişmeden kullanılacak

export type DayKey = "today" | "tomorrow" | "d2" | "d3";

export const DAYS: { key: DayKey; label: string }[] = [
  { key: "today", label: "Bugün" },
  { key: "tomorrow", label: "Yarın" },
  { key: "d2", label: "2 gün sonra" },
  { key: "d3", label: "3 gün sonra" },
];

// Çalışma saatleri (örnek)
const WORK_START = 10; // 10:00
const WORK_END = 18;   // 18:00
const SLOT_MIN = 30;   // 30 dk

// Örnek dolu saatler (ileride Firestore’dan gelecek)
const BUSY: Record<DayKey, string[]> = {
  today: ["11:00", "14:30"],
  tomorrow: ["10:00", "13:30"],
  d2: [],
  d3: ["15:00"],
};

export function getSlots(day: DayKey): { time: string; disabled: boolean }[] {
  const slots: { time: string; disabled: boolean }[] = [];
  for (let h = WORK_START; h < WORK_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MIN) {
      const mm = m === 0 ? "00" : String(m);
      const t = `${String(h).padStart(2, "0")}:${mm}`;
      slots.push({ time: t, disabled: BUSY[day]?.includes(t) ?? false });
    }
  }
  return slots;
}