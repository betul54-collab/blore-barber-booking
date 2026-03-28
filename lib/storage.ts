export type CustomerInfo = {
  firstName: string;
  lastName: string;
  phoneE164: string; // +905xxxxxxxxx
  phonePretty: string; // +90 5xx xxx xx xx
};

export type BookingDraft = {
  customer: CustomerInfo;
  staffId?: string;
  staffName?: string;
  dateISO?: string; // YYYY-MM-DD
  time?: string; // HH:mm
};

const KEY = "blore_booking_draft_v1";

export function loadDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: BookingDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}