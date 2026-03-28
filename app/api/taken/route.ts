import { NextResponse } from "next/server"

let taken:any[] = []

export async function GET(){

return NextResponse.json(taken)

}

export async function POST(req:Request){

const data = await req.json()

taken.push({

date:data.date,
time:data.time

})

return NextResponse.json({ok:true})

}