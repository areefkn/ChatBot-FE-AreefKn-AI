/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Pastikan baris ini ada dan diatur ke 'class'
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ... ekstensi tema Anda lainnya
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // ... plugin Anda lainnya
  ],
}
