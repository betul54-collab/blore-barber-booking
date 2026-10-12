import { adminDb } from "./firebaseAdmin";

export const DEFAULT_SALON = "blore";
const SALON_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function salonFromRequest(req: Request): string {
  const raw = new URL(req.url).searchParams.get("salon");
  const id = (raw || DEFAULT_SALON).trim().toLowerCase();
  return SALON_RE.test(id) ? id : "";
}

export async function salonExists(id: string): Promise<boolean> {
  const snap = await adminDb.collection("salons").doc(id).get();
  return snap.exists;
}

export async function resolveSalon(req: Request): Promise<string | null> {
  const id = salonFromRequest(req);
  if (!id) return null;
  return (await salonExists(id)) ? id : null;
}

export function bookingsCol(id: string) {
  return adminDb.collection("salons").doc(id).collection("bookings");
}

export function settingsDoc(id: string) {
  return adminDb.collection("salons").doc(id).collection("settings").doc("shop");
}