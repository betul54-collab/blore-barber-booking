import { NextResponse } from "next/server"

let bookings:any[] = []

export async function GET() {
  return NextResponse.json(bookings)
}

export async function POST(req:Request) {

  const body = await req.json()

  const booking = {
    id: Date.now(),
    name: body.name,
    phone: body.phone,
    service: body.service,
    staff: body.staff,
    date: body.date,
    time: body.time
  }

  bookings.push(booking)

  return NextResponse.json({
    success:true,
    booking
  })
}