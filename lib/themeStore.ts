import { create } from "zustand";

export const useThemeStore = create<{
  theme: "dark" | "light";
  toggle: () => void;
}>((set) => ({
  theme: "dark",
  toggle: () =>
    set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
}));