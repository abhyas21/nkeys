/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        sand: "var(--color-sand)",
        terracotta: "var(--color-terracotta)",
        moss: "var(--color-moss)",
        gold: "var(--color-gold)"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(55, 33, 20, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(201, 109, 66, 0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(66, 100, 81, 0.15), transparent 32%)"
      }
    }
  },
  plugins: []
};
