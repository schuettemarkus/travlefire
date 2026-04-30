/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        ember: 'var(--ember)',
        horizon: 'var(--horizon)',
        mist: 'var(--mist)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        brand: 'var(--radius)',
      },
      boxShadow: {
        brand: 'var(--shadow)',
      },
      fontFamily: {
        display: ['var(--font-fraunces)'],
        sans: ['var(--font-inter)'],
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
};
