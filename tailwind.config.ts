import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#430a1d",
        "primary-consumer": "#791b3a",
        accent: "#d4af37",
        "background-light": "#faf7f3",
        surface: "#ffffff",
        wine: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4a9ba",
          400: "#ec7896",
          500: "#df4d74",
          600: "#cc2d5c",
          700: "#ab1f4a",
          800: "#8f1d41",
          900: "#7a1c3c",
          950: "#440a1d",
        },
        gold: {
          50: "#fdfaef",
          100: "#faf1d0",
          200: "#f5e19e",
          300: "#eecb65",
          400: "#e8b73e",
          500: "#d4af37",
          600: "#b8860b",
          700: "#a35618",
          800: "#86441b",
          900: "#6f3919",
          950: "#3f1c0a",
        },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
