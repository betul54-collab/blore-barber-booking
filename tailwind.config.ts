import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blore: {
          bg1: "#061427",
          bg2: "#0a2c5a",
          glass: "rgba(255,255,255,0.08)",
          stroke: "rgba(255,255,255,0.16)",
          text: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.70)",
          gold: "#d8c37a",
        },
      },
      boxShadow: {
        glass: "0 12px 40px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        glass: "14px",
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
export default config;