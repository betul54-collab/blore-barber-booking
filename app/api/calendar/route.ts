import { store } from "@/lib/store"

export async function GET() {
  return Response.json({
    services: store.getServices(),
    hours: store.getHours(),
    breaks: store.getBreaks(),
    holidays: store.getHolidays(),
    personel: store.getPersonel(),
  })
}