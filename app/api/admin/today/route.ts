import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  const { closed } = await req.json();

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ref = doc(db, "availability", today);

  if (closed) {
    // Bugün kapalı
    await setDoc(ref, { closed: true }, { merge: true });
  } else {
    // Bugünü aç
    await setDoc(ref, { closed: false }, { merge: true });
  }

  return NextResponse.json({ ok: true });
}