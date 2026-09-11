import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F5F7",
        surface: "#FFFFFF",
        ink: "#171B21",
        "ink-soft": "#565D6B",
        border: "#E4E6EA",
        steel: {
          DEFAULT: "#1B2430",
          light: "#28323F",
          dark: "#10151C",
        },
        brand: {
          DEFAULT: "#E2472C",
          dark: "#B93521",
          light: "#FCE6E1",
        },
        paid: { DEFAULT: "#2E9E5B", bg: "#E4F5EB" },
        due: { DEFAULT: "#B9790A", bg: "#FDF1DA" },
        overdue: { DEFAULT: "#D64550", bg: "#FBE3E3" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,27,33,0.06), 0 1px 1px rgba(23,27,33,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
