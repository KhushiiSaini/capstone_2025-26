/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          700: "#6B1C3D",
          800: "#4A1328",
        },
        pink: {
          50: "#FDF2F8",
          600: "#DB2777",
          700: "#BE1856",
        },
      },
    },
  },
  plugins: [],
};
