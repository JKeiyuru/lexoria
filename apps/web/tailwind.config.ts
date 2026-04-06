import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1923',
        surface: '#1A2535',
        card: '#243044',
        primary: '#4F9EFF',
        accent: '#FFD700',
        success: '#2ECC71',
        textPrimary: '#F0F4FF',
        textSecondary: '#8A9BB5',
        textMuted: '#4A5A72',
        border: '#2A3A52',
      },
    },
  },
  plugins: [],
}

export default config