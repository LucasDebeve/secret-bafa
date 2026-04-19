import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // App palette — mirrors the CSS variables from the original design
        app: {
          bg: "#f4f4f5",
          surface: "#ffffff",
          border: "#e4e4e7",
          border2: "#d1d1d6",
          text: "#18181b",
          text2: "#52525b",
          text3: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#0ea5e9",
          bg: "#f0f9ff",
          border: "#bae6fd",
        },
        brand: {
          green: "#10b981",
          "green-bg": "#f0fdf4",
          "green-border": "#bbf7d0",
          red: "#ef4444",
          "red-bg": "#fef2f2",
          "red-border": "#fecaca",
          amber: "#f59e0b",
          "amber-bg": "#fffbeb",
          "amber-border": "#fde68a",
          purple: "#8b5cf6",
          "purple-bg": "#f5f3ff",
          "purple-border": "#ddd6fe",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.08)",
        toast: "0 4px 16px rgba(0,0,0,.15)",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        pulseDot: "pulseDot 1.5s infinite",
        spin: "spin .7s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
