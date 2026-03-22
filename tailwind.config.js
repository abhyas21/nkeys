/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141414",
        sand: "#f4efe8",
        terracotta: "#cc6a3d",
        moss: "#3f6755",
        gold: "#c8a15a"
      },
      boxShadow: {
        soft: "0 22px 55px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(204, 106, 61, 0.16), transparent 30%), radial-gradient(circle at bottom left, rgba(63, 103, 85, 0.12), transparent 32%)"
      }
    }
  },
  plugins: []
};
