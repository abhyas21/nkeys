/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241812",
        sand: "#ead8c4",
        terracotta: "#c96d42",
        moss: "#426451",
        gold: "#c8964d"
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
