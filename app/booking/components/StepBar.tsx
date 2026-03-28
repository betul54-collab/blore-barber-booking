export default function StepBar({ current }: { current: number }) {
  const steps = ["Hizmet", "Tarih", "Personel", "Onay"];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const active = i + 1 <= current;
        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`h-[2px] w-full ${
                active ? "bg-black" : "bg-gray-200"
              }`}
            />
            {i < steps.length - 1 && (
              <div className="w-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}