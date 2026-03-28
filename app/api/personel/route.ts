import { store } from "@/lib/store"

export async function POST(req: Request) {
  const body = await req.json()

  const newPerson = {
    id: Date.now().toString(),
    name: body.name,
  }

  store.addPersonel(newPerson)

  return Response.json(newPerson)
}

export async function GET() {
  return Response.json(store.getPersonel())
}