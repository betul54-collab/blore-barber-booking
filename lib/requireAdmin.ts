import { adminAuth } from "@/lib/firebaseAdmin"

export async function requireAdmin(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!token) return false

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const adminUid = process.env.ADMIN_UID
    return !!adminUid && decoded.uid === adminUid
  } catch {
    return false
  }
}