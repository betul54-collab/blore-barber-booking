import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const { staff, time } = await req.json()

  await db.run(
    `
    DELETE FROM closed_slots
    WHERE staff=? AND time=?
    `,
    [staff, time]
  )

  return NextResponse.json({ ok: true })
}