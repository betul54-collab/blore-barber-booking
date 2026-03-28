const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
const SLOT = 15; // dakika

export function getAvailableTimes(duration: number): string[] {
  const times: string[] = [];

  const start = OPEN_HOUR * 60;
  const end = CLOSE_HOUR * 60 - duration;

  for (let m = start; m <= end; m += SLOT) {
    // servis süresine uymayanları ele
    if (m % duration !== 0 && duration > SLOT) continue;

    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const min = String(m % 60).padStart(2, "0");
    times.push(`${h}:${min}`);
  }

  return times;
}