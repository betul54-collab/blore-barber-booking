"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

type StaffDoc = {
  id: string;
  name: string;
  workingHours: { start: string; end: string };
  daysOff: string[];
};

export default function AdminStaffPage() {
  const [items, setItems] = useState<StaffDoc[]>([]);
  const [newName, setNewName] = useState("");

  async function load() {
    const snap = await getDocs(collection(db, "staff"));
    const data = snap.docs.map((d) => {
      const v = d.data() as any;
      return {
        id: d.id,
        name: v.name ?? "İsimsiz",
        workingHours: v.workingHours ?? { start: "09:00", end: "17:00" },
        daysOff: Array.isArray(v.daysOff) ? v.daysOff : [],
      } as StaffDoc;
    });
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function addStaff() {
    if (!newName.trim()) return alert("Personel adı boş olamaz");
    await addDoc(collection(db, "staff"), {
      name: newName.trim(),
      workingHours: { start: "09:00", end: "17:00" },
      daysOff: [],
    });
    setNewName("");
    load();
  }

  async function removeStaff(id: string) {
    if (!confirm("Bu personeli silmek istiyor musun?")) return;
    await deleteDoc(doc(db, "staff", id));
    load();
  }

  async function saveHours(id: string, start: string, end: string) {
    await updateDoc(doc(db, "staff", id), {
      workingHours: { start, end },
    });
    load();
  }

  async function addDayOff(id: string, date: string) {
    if (!date) return alert("Tarih seç");
    const current = items.find((x) => x.id === id);
    if (!current) return;
    const next = Array.from(new Set([...(current.daysOff ?? []), date]));
    await updateDoc(doc(db, "staff", id), { daysOff: next });
    load();
  }

  async function removeDayOff(id: string, date: string) {
    const current = items.find((x) => x.id === id);
    if (!current) return;
    const next = (current.daysOff ?? []).filter((d) => d !== date);
    await updateDoc(doc(db, "staff", id), { daysOff: next });
    load();
  }

  return (
    <div>
      <h2>Personel</h2>

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Yeni personel adı"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ padding: 10, width: 240 }}
        />
        <button onClick={addStaff} style={{ marginLeft: 8, padding: "10px 14px" }}>
          Ekle
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {items.map((s) => (
          <div key={s.id} style={{ border: "1px solid #ddd", padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{s.name}</b>
              <button onClick={() => removeStaff(s.id)} style={{ color: "red" }}>
                Sil
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <label>Başlangıç: </label>
              <input
                type="time"
                value={s.workingHours.start}
                onChange={(e) => saveHours(s.id, e.target.value, s.workingHours.end)}
              />
              <label style={{ marginLeft: 12 }}>Bitiş: </label>
              <input
                type="time"
                value={s.workingHours.end}
                onChange={(e) => saveHours(s.id, s.workingHours.start, e.target.value)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <b>İzin günleri</b>
              <div style={{ marginTop: 6 }}>
                <input
                  type="date"
                  onChange={(e) => addDayOff(s.id, e.target.value)}
                />
              </div>

              <div style={{ marginTop: 8 }}>
                {(s.daysOff ?? []).length === 0 ? (
                  <div style={{ opacity: 0.7 }}>Yok</div>
                ) : (
                  (s.daysOff ?? []).map((d) => (
                    <div key={d}>
                      {d}{" "}
                      <button onClick={() => removeDayOff(s.id, d)} style={{ marginLeft: 6 }}>
                        Sil
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}