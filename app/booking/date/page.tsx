"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DatePage(){

const router = useRouter()
const [selected,setSelected] = useState<number | null>(null)

const days = [
1,2,3,4,5,6,7,
8,9,10,11,12,13,14,
15,16,17,18,19,20,21,
22,23,24,25,26,27,28,
29,30,31
]

return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#081a33] to-[#0e2b55] text-white">

<div className="w-[900px] bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl p-10">

<h1 className="text-7xl text-center font-serif mb-4">MART</h1>

<p className="text-center opacity-70 mb-8">
2026 • Uygun günleri seçin
</p>

<div className="grid grid-cols-7 gap-4 mb-8">

{days.map((d)=>(
<button
key={d}
onClick={()=>setSelected(d)}
className={`py-3 rounded-full transition
${selected===d
?"bg-white/40 ring-2 ring-white"
:"bg-white/10 hover:bg-white/20"}
`}
>
{d}
</button>
))}

</div>

<button
disabled={!selected}
onClick={()=>{

localStorage.setItem("date",String(selected))
router.push("/booking/time")

}}
className={`w-full py-4 rounded-full font-semibold
${selected
?"bg-[#e7c98f] text-black"
:"bg-white/20 text-white/40"}
`}
>

Devam Et

</button>

</div>
</div>

)
}