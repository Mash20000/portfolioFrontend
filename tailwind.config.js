/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Palette: deep ink background, iridescent violet -> teal accent
        ink: { 950: "#07080f", 900: "#0b0d17", 800: "#11142a", 700: "#1a1e3a" },
        accent: { violet: "#8b7cff", teal: "#2dd4bf", rose: "#f472b6" },
      },
      backgroundImage: {
        iridescent: "linear-gradient(120deg,#8b7cff 0%,#2dd4bf 55%,#f472b6 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(8,10,30,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
        glow: "0 0 40px rgba(139,124,255,0.25)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { shimmer: "shimmer 1.6s infinite" },
    },
  },
  plugins: [],
};
