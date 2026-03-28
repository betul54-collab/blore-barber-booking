"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  title: string;
  duration: number;
  price: number;
};

const SERVICES: Service[] = [
  { id: "hair", title: "Saç Kesimi", duration: 30, price: 300 },
  { id: "beard", title: "Sakal Tıraşı", duration: 20, price: 200 },
  { id: "hair-beard", title: "Saç + Sakal", duration: 45, price: 450 },
];

export default function ServicePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Service | null>(null);

  function handleNext() {
    if (!selected) return;
    localStorage.setItem("service", JSON.stringify(selected));
    router.push("/booking/staff");
  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-20 bg-gradient-to-b from-[#0b1220] to-[#1b2a4a]">
      <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Servis Seçimi
        </h1>
        <p className="text-white/70 mb-6">
          Lütfen almak istediğiniz hizmeti seçin
        </p>

        <div className="space-y-3">
          {SERVICES.map((service) => {
            const active = selected?.id === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setSelected(service)}
                className={`
                  w-full text-left rounded-xl border px-4 py-3 transition
                  ${active
                    ? "bg-blue-600/30 border-blue-400 text-white"
                    : "bg-white/10 border-white/30 text-white/90 hover:bg-white/20"}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{service.title}</div>
                    <div className="text-sm text-white/70">
                      Süre: {service.duration} dk
                    </div>
                  </div>
                  <div className="font-semibold">{service.price} ₺</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className={`
            mt-6 w-full rounded-xl py-3 font-medium transition
            ${selected
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/20 text-white/40 cursor-not-allowed"}
          `}
        >
          Devam Et
        </button>
      </div>
    </div>
  );
}