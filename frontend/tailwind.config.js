/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#64748b",
        cloud: "#f8fafc",
        sand: "#f6efe5",
        brand: {
          50: "#eef9f7",
          100: "#d4f2ec",
          500: "#0f766e",
          600: "#0b625d",
          900: "#123c38"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        float: "0 30px 80px rgba(15, 23, 42, 0.14)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        tech: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
};

