/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#040d1f",
          900: "#071530",
          800: "#0d2149",
          700: "#103060",
        },
        slate: {
          850: "#172033",
        },
        gain: "#22c55e",
        loss: "#ef4444",
        accent: "#3b82f6",
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
