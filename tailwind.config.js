/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "Playfair Display", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "-apple-system", "sans-serif"]
      },
      colors: {
        cream: "#FAF8F5",
        "cream-card": "#FFFFFF",
        "cream-border": "#E8E4D9",
        charcoal: "#1A1918",
        "charcoal-muted": "#6E675F",
        "accent-gold": "#B08D57",
        "accent-gold-hover": "#987643",
        "accent-gold-light": "#F7F4EE",
        "dark-bg": "#121110",
        "dark-card": "#1A1816",
        "dark-border": "#2A2621",
        ink: "var(--color-ink)",
        sand: "var(--color-sand)",
        terracotta: "var(--color-terracotta)",
        moss: "var(--color-moss)",
        gold: "#B08D57"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(26, 25, 24, 0.05)",
        luxury: "0 20px 40px rgba(26, 25, 24, 0.08)",
        glow: "0 0 25px rgba(176, 141, 87, 0.25)"
      }
    }
  },
  plugins: []
};
