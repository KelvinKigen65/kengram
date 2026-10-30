/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        ink: "#1F1F1F",
        muted: "#747474",
        ocean: "#3A86FF",
        cloud: "#EAF2FF",
        sun: "#FF9F5A",
        sage: "#137C6B",
      },
      borderRadius: {
        "4xl": "28px",
      },
    },
  },
  plugins: [],
};
