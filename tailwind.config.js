/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './pages/**/*.html',
    './blog/**/*.html',
    './assets/js/**/*.js'
  ],
  // chatbot.html cubierto por './*.html' (sus clases dinámicas en chatbot.js
  // siguen funcionando si alguien navega a /chatbot.html directo).
  // Snippets y admin no se incluyen en content (Tailwind v3 los ignora).
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Para que /X (opacity modifier) funcione, los colores deben estar
        // definidos como CSS variables con channels space-separated.
        // Ver input.css: :root { --c-primary: 0 119 182; ... }
        primary: {
          DEFAULT: 'rgb(var(--c-primary) / <alpha-value>)',
          50:  'rgb(var(--c-primary-50) / <alpha-value>)',
          100: 'rgb(var(--c-primary-100) / <alpha-value>)',
          200: 'rgb(var(--c-primary-200) / <alpha-value>)',
          300: 'rgb(var(--c-primary-300) / <alpha-value>)',
          400: 'rgb(var(--c-primary-400) / <alpha-value>)',
          500: 'rgb(var(--c-primary-500) / <alpha-value>)',
          600: 'rgb(var(--c-primary-600) / <alpha-value>)',
          700: 'rgb(var(--c-primary-700) / <alpha-value>)',
          800: 'rgb(var(--c-primary-800) / <alpha-value>)',
          900: 'rgb(var(--c-primary-900) / <alpha-value>)'
        },
        secondary: 'rgb(var(--c-secondary) / <alpha-value>)',
        dark: 'rgb(var(--c-dark) / <alpha-value>)',
        light: 'rgb(var(--c-light) / <alpha-value>)'
      }
    }
  },
  // Clases dinámicas que el purger no detecta en HTML (vienen de chatbot.js)
  // o arbitrary values con caracteres especiales que el extractor no parsea bien.
  safelist: [
    'animate-user-message',
    'animate-bot-message',
    'animate-new-message',
    'message-bubble',
    'copy-btn',
    'suggestion-chip',
    'sm:gap-3.5',
    'sm:gap-2.5',
    'sm:py-3.5',
    'lg:gap-2.5',
    'lg:grid-cols-[1.2fr_0.8fr]'
  ],
  plugins: []
};
