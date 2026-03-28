"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
  "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
  "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"
];

export default function DatePage() {
  const router = useRouter();
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(year, month, 1).getDay() || 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d < new Date(today.setHours(0, 0, 0, 0));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1220] to-[#0e1a33] text-white">
      
      {/* KART */}
      <div className="w-[360px] rounded-2xl border border-white/20 p-6">

        {/* AY / YIL */}
        <div className="text-center mb-6">
          <div className="text-4xl tracking-widest font-light">
            {MONTHS[month]} {year}
          </div>
          <div className="text-sm text-white/60 mt-1">
            Uygun günleri seçin
          </div>
        </div>

        {/* GÜN İSİMLERİ */}
        <div className="grid grid-cols-7 text-center text-xs text-white/40 mb-2">
          {["P", "P", "S", "Ç", "P", "C", "C"].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* TAKVİM */}
        <div className="grid grid-cols-7 gap-2 justify-items-center mb-6">
          {Array.from({ length: firstDay - 1 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const disabled = isPast(day);
            const selected = selectedDay === day;

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => setSelectedDay(day)}
                className={`
                  w-10 h-10 rounded-full text-sm transition
                  ${disabled ? "text-white/20 cursor-not-allowed" : "hover:bg-white/10"}
                  ${selected ? "bg-white text-black font-semibold" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* DEVAM */}
        <button
          disabled={!selectedDay}
          onClick={() => {
            const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
            router.push(`/booking/time?date=${date}`);
          }}
          className={`
            w-full py-3 rounded-xl transition font-medium
            ${selectedDay
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/20 text-white/40 cursor-not-allowed"}
          `}
        >
          Devam
        </button>

      </div>
    </div>
  );
}