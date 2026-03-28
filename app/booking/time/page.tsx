"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function TimePage(){

const router = useRouter()
const params = useSearchParams()

const name = params.get("name") || ""
const phone = params.get("phone") || ""
const service = params.get("service") || ""
const staff = params.get("staff") || ""
const date = params.get("date") || ""

const hours = [
"09:00","09:30",
"10:00","10:30",
"11:00","11:30",
"12:00","12:30",
"13:00","13:30",
"14:00","14:30",
"15:00","15:30",
"16:00","16:30",
"17:00","17:30",
"18:00"
]

const [takenSlots,setTakenSlots] = useState<string[]>([])
const [closedSlots,setClosedSlots] = useState<string[]>([])

useEffect(()=>{

fetch("/api/bookings")
.then(res=>res.json())
.then(data=>{

const filtered = data
.filter((b:any)=> b.staff===staff && b.date===date)
.map((b:any)=> b.time)

setTakenSlots(filtered)

})

fetch("/api/slots/closed")
.then(res=>res.json())
.then(data=>{

const filtered = data
.filter((s:any)=> s.staff===staff && s.date===date)
.map((s:any)=> s.time)

setClosedSlots(filtered)

})

},[staff,date])

function selectTime(time:string){

router.push(
`/booking/confirm?name=${name}&phone=${phone}&service=${service}&staff=${staff}&date=${date}&time=${time}`
)

}

return(

<div style={{
minHeight:"100vh",
background:"linear-gradient(180deg,#0f172a,#1e3a8a)",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>

<div style={{
background:"white",
padding:"30px",
borderRadius:"10px",
width:"350px"
}}>

<h2 style={{marginBottom:"20px"}}>
Saat Seç
</h2>

{hours.map((hour)=>{

if(takenSlots.includes(hour)) return null
if(closedSlots.includes(hour)) return null

return(

<button
key={hour}
onClick={()=>selectTime(hour)}
style={{
display:"block",
width:"100%",
padding:"10px",
marginBottom:"10px",
border:"1px solid #ccc",
borderRadius:"6px",
cursor:"pointer"
}}
>

{hour}

</button>

)

})}

</div>

</div>

)

}