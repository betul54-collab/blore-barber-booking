// We keep only digits user typed (without +90).
// We force TR mobile style: starts with 5 and max 10 digits (5xxxxxxxxx)

export function normalizeDigits(input: string): string {
  return (input || "").replace(/\D/g, "");
}

export function ensureTrMobileDigits(digits: string): string {
  // remove leading zeros
  digits = digits.replace(/^0+/, "");

  // if user typed country code 90, remove it
  if (digits.startsWith("90")) digits = digits.slice(2);

  // If user starts with 5 good, otherwise try to find first 5
  const idx = digits.indexOf("5");
  if (idx > 0) digits = digits.slice(idx);

  // max 10 digits for TR mobile
  return digits.slice(0, 10);
}

export function formatTrPhonePretty(digits10: string): string {
  // digits10: "5xxxxxxxxx" (max 10)
  const d = digits10.padEnd(10, "");
  const p1 = d.slice(0, 3).trim(); // 5xx
  const p2 = d.slice(3, 6).trim(); // xxx
  const p3 = d.slice(6, 8).trim(); // xx
  const p4 = d.slice(8, 10).trim(); // xx

  let out = "+90";
  if (p1) out += " " + p1;
  if (p2) out += " " + p2;
  if (p3) out += " " + p3;
  if (p4) out += " " + p4;
  return out;
}

export function toE164(digits10: string): string {
  const clean = ensureTrMobileDigits(normalizeDigits(digits10));
  return `+90${clean}`;
}