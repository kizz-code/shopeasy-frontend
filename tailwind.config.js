/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50: "#fef7ee",
          100: "#fdedd8",
          200: "#fbd7b0",
          300: "#f8b97d",
          400: "#f49048",
          500: "#f17023",
          600: "#e25519",
          700: "#bb3f16",
          800: "#953319",
          900: "#782c18",
          950: "#41130a",
        },
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a27",
          600: "#22223a",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: 0, transform: "translateY(-10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { "0%": { opacity: 0, transform: "scale(0.95)" }, "100%": { opacity: 1, transform: "scale(1)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
