import { store } from "@/lib/store"

export async function POST(req: Request) {
  const body = await req.json()

  if (body.services) store.setServices(body.services)
  if (body.hours) store.setHours(body.hours)
  if (body.breaks) store.setBreaks(body.breaks)
  if (body.holidays) store.setHolidays(body.holidays)
  if (body.personel) body.personel.forEach((p: any) => store.addPersonel(p))

  return Response.json({ ok: true })
}

export async function GET() {
  return Response.json({
    services: store.getServices(),
    hours: store.getHours(),
    breaks: store.getBreaks(),
    holidays: store.getHolidays(),
    personel: store.getPersonel(),
  })
}