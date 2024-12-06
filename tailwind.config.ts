import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        neonGreen: '#39FF14',
        neonPink: '#FF007F',
        neonBlue: '#00C2FF',
        neonPurple: '#FF00FF',
        neonYellow: '#FFFF00',
        neonOrange: '#FFA500',
      },
    },
  },
  plugins: [],
} satisfies Config;
