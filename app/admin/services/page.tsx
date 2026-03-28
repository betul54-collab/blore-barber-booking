"use client";

import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/bookingStore";
import { useEffect } from "react";

const SERVICES = [
  { id: "s1", name: "Saç Kesimi" },
  { id: "s2", name: "Sakal Tıraşı" },
  { id: "s3", name: "Saç + Sakal" },
];

export default function ServicePage() {
  const router = useRouter();
  const { staff, setService } = useBookingStore();

  useEffect(() => {
    if (!staff) {
      router.push("/booking/staff");
    }
  }, [staff, router]);

  const selectService = (service: { id: string; name: string }) => {
    setService(service);
    router.push("/booking/date"); // 🔥 DEVAM BURASI
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Hizmet Seç</h2>

      <ul style={{ marginTop: 16 }}>
        {SERVICES.map((s) => (
          <li key={s.id} style={{ marginBottom: 12 }}>
            <button
              onClick={() => selectService(s)}
              style={{
                padding: "10px 14px",
                width: "100%",
                cursor: "pointer",
              }}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}