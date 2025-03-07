import { heroui } from "@heroui/react";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", ...fontFamily.sans],
      },
      colors: {
        black: "#101C1B",
        primary: "#0D4EE8",
        secondary: "#02B8F8"
      }
    },
  },
  plugins: [heroui()],
} satisfies Config;
