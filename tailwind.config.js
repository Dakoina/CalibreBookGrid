/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      aspectRatio: {
        // Approximate common book cover ratio (width:height ~ 2:3 => 0.666)
        'book': '2 / 3',
      },
    },
  },
  plugins: [],
};
