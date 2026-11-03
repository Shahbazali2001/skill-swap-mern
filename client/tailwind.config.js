/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E3A8A',
          light: '#DBEAFE',
        },
        teal: {
          DEFAULT: '#0D9488',
          light: '#CCFBF1',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        pink: {
          DEFAULT: '#DB2777',
          light: '#FCE7F3',
        },
      },
    },
  },
  plugins: [],
};
