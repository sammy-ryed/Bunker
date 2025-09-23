/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bunker: {
          bg: "#0a0a0a",    // dark black
          card: "#1a1a1a",  // slightly lighter for contrast
          accent: "#9f1239", // dark blood-red
          glow: "#e11d48",   // brighter red
        }
      }
    }
  },
  plugins: [],
}
