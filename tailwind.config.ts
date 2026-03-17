import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        ink: {
          50: "#f8f7f4",
          100: "#eeecea",
          200: "#d8d5cf",
          300: "#b8b3aa",
          400: "#938d82",
          500: "#787168",
          600: "#635c54",
          700: "#514b44",
          800: "#45403a",
          900: "#3c3733",
          950: "#201e1b",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
          },
        },
      },
      animation: {
        "breaking-scroll": "breaking-scroll 30s linear infinite",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "breaking-scroll": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
