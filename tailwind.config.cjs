/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        5.5: "22px",
        6.25: "25px",
        6.5: "26px",
        7.5: "30px",
      },
      borderRadius: {
        5: "20px",
        5.5: "25px",
        10: "40px",
        7.5: "30px",
      },
      colors: {
        red: {
          alert: "#EB5757",
        },
        gray: {
          850: "#161E2D",
          950: "#111827",
        },
        slate: {
          150: "#E9EDF4",
          750: "#2A3850",
        },
        yellow: {
          DEFAULT: "#F2C94C",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}