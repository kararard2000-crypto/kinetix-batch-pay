import type { Config } from "tailwindcss";
export default {
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: { colors: { ink: "#05080F", base: "#0A0E17", neon: "#00F5D4", emerald: "#10B981" } } },
} satisfies Config;
