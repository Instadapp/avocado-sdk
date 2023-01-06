/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./lib/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms")
  ],
}