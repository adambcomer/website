/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html'],
  theme: {
    extend: {},
    fontFamily: {
      sans: ['Roboto', 'Arial', 'Helvetica', 'sans-serif'],
      mono: ["'Roboto Mono'"],
      sc: ["'Noto Sans SC'"]
    }
  },
  plugins: ['postcss-import', 'tailwindcss/nesting', 'tailwindcss', 'autoprefixer']
}
