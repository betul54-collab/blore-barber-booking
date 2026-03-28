"use client";

import { Booking, BookingStatus, useBookingStore } from "@/lib/bookingStore";

const glass =
  "bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-xl";

const statusLabels: Record<BookingStatus, string> = {
  planned: "Planlandı",
  completed: "Tamamlandı",
  early_finished: "Erken bitti",
  no_show: "Gelmedi",
  canceled: "İptal",
};

export default function BookingPopup({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const { updateBookingStatus, deleteBooking } = useBookingStore();

  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [actualEnd, setActualEnd] = useState<string>(
    booking.actualEnd || ""
  );

  function save() {
    if (status === "early_finished" && !actualEnd) {
      alert("Erken bitti için bitiş saati giriniz");
      return;
    }

    updateBookingStatus(
      booking.id,
      status,
      status === "early_finished" ? actualEnd : null
    );
    onClose();
  }

  function remove() {
    if (confirm("Randevu tamamen silinsin mi?")) {
      deleteBooking(booking.id);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`${glass} w-[360px] p-5 text-white`}>
        <h2 className="text-lg font-semibold mb-3">Randevu Detayı</h2>

        <div className="text-sm space-y-1 text-white/80">
          <div>
            <b>Müşteri:</b> {booking.clientName}
          </div>
          <div>
            <b>Telefon:</b> {booking.phone}
          </div>
          <div>
            <b>Saat:</b> {booking.start} – {booking.end}
          </div>
          <div>
            <b>Hizmet:</b> {booking.serviceNames.join(", ")}
          </div>
        </div>

        <hr className="my-4 border-white/20" />

        <label className="text-sm font-medium">
          Durum
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className="mt-2 w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key} className="text-black">
                {label}
              </option>
            ))}
          </select>
        </label>

        {status === "early_finished" && (
          <label className="mt-3 block text-sm font-medium">
            Gerçek Bitiş Saati
            <input
              type="time"
              value={actualEnd}
              onChange={(e) => setActualEnd(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white"
            />
          </label>
        )}

        <div className="mt-5 flex justify-between items-center">
          <button
            onClick={remove}
            className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm"
          >
            Randevuyu Sil
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
            >
              Kapat
            </button>
            <button
              onClick={save}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm"
            >
              Kaydet
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/50">
          Not: “Erken bitti” seçilirse gerçek bitiş saati girilmelidir.
        </p>
      </div>
    </div>
  );
}