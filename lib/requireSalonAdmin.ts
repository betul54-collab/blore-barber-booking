import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// Gecer: platform yoneticisi (ADMIN_UID) veya salonun sahibi (salons/{id}.ownerUid)
export async function requireSalonAdmin(req: Request, salon: string): Promise<boolean> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    const platformAdmin = process.env.ADMIN_UID;
    if (platformAdmin && decoded.uid === platformAdmin) return true;

    const snap = await adminDb.collection("salons").doc(salon).get();
    const owner = snap.exists ? snap.data()?.ownerUid : undefined;
    return !!owner && decoded.uid === owner;
  } catch {
    return false;
  }
}
