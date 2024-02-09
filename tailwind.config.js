/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.html`], // all .html files
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["nord"],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

