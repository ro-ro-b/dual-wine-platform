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
        // Vault dark theme
        "vault-bg": "#0e0e0e",
        "vault-surface": "#1a1617",
        "vault-outline": "#3d2a2e",
        "burgundy-deep": "#430a1d",
        "burgundy-accent": "#791b3a",
        "gold-primary": "#d4af37",
        "gold-dim": "#e9c349",
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
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 1.8s ease-in-out infinite",
        "ambient": "ambient-float 20s ease-in-out infinite",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(233, 195, 73, 0.1)" },
          "50%": { boxShadow: "0 0 20px rgba(233, 195, 73, 0.25)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "ambient-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
