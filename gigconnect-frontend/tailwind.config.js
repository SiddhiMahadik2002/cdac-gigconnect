/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",     // Midnight Teal
        secondary: "#020617",   // Deep Charcoal
        accent: "#22D3EE",      // Neon Cyan
        background: "#F8FAFC",
        textDark: "#0F172A",
      },
    },
  },
  plugins: [],
};
