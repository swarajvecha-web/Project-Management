/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        atlassian: {
          blue: '#2684FF',
          dark: '#1D2125',
          darker: '#161A1D',
          hover: '#A6C5E229', // Alpha for hover states
        }
      }
    },
  },
  plugins: [],
}
