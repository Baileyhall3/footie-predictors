/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: [
    'p-datepicker',
    'p-datepicker-panel',
    'p-datepicker-header',
    'p-datepicker-day',
    'p-datepicker-day-selected'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
