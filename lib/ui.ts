export function glass(className: string = "") {
  return [
    // “liquid glass” hissi (Tailwind)
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
    "shadow-[0_8px_30px_rgba(0,0,0,0.20)]",
    className,
  ].join(" ");
}