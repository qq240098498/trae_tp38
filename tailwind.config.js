/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF3ED",
          100: "#FFE2D4",
          200: "#FFC4A8",
          300: "#FFA77D",
          400: "#FF8951",
          500: "#FF6B35",
          600: "#E85A26",
          700: "#C94A1E",
          800: "#A83D17",
          900: "#873012",
        },
        secondary: {
          50: "#E8F7F5",
          100: "#C1EBE5",
          200: "#9ADFD5",
          300: "#72D3C5",
          400: "#4BC7B5",
          500: "#2EC4B6",
          600: "#249E93",
          700: "#1C7A71",
          800: "#14554F",
          900: "#0D312E",
        },
        cream: {
          50: "#FFFDF8",
          100: "#FFFAF0",
          200: "#FFF3DB",
          300: "#FFEBC6",
          400: "#FFE4B1",
          500: "#FFDC9C",
        },
        warmGray: {
          50: "#FAF8F5",
          100: "#F5F1EB",
          200: "#E8E2D9",
          300: "#D4CCC0",
          400: "#B8AD9C",
          500: "#9C8E79",
          600: "#7D7160",
          700: "#5E5548",
          800: "#3F3930",
          900: "#201D18",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px -6px rgba(0, 0, 0, 0.12)",
        glow: "0 0 20px rgba(255, 107, 53, 0.3)",
      },
      animation: {
        "bounce-in": "bounceIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(255, 107, 53, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};
