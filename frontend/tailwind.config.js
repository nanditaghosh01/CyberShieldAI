/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core 5-Color User Palette & Harmful Danger Scale
        palette: {
          navy: "#1d3557",       // Swatch 1: Deep Prussian Navy
          navyDark: "#0b1523",   // Ultra-Dark Navy Background
          navySurface: "#122035",// Surface Background
          navyCard: "#182b45",   // Card Component Surface
          navyBorder: "#274366", // Card & Divider Border
          steel: "#457b9d",      // Swatch 2: Steel Cerulean
          steelDark: "#315870",  // Muted Steel
          ice: "#a9d8de",        // Swatch 3: Ice Blue / Aqua
          iceLight: "#d8f0f3",   // Light Ice Tint
          honeydew: "#f3fbf0",   // Swatch 4: Crisp Off-White / Honeydew
          red: {
            50: "#fff1f2",
            100: "#ffe4e6",
            200: "#ffd0d4",
            300: "#fca5ac",
            400: "#f86b76",      // Soft Warning Red
            500: "#e83845",      // Swatch 5: Primary Coral Red (Harmful)
            600: "#cc2734",      // Deep Alert Red
            700: "#a81b26",      // Crimson Threat Red
            800: "#7d131c",      // Blood Red
            900: "#4c0c11",      // Dark Red Panel
            950: "#28070a",      // Harmful Danger Background
          }
        },
        // Unified Fallbacks aligned directly to the 5 Swatches
        cyan: {
          300: "#d8f0f3",
          400: "#a9d8de",      // Ice Blue
          500: "#457b9d",      // Steel Cerulean
          950: "#1d3557",      // Deep Navy
        },
        blue: {
          300: "#a9d8de",
          400: "#457b9d",      // Steel
          500: "#315870",
          600: "#1d3557",      // Prussian Navy
          950: "#122035",
        },
        red: {
          200: "#ffd0d4",
          300: "#fca5ac",
          400: "#f86b76",
          500: "#e83845",      // Harmful Coral Red
          600: "#cc2734",
          700: "#a81b26",
          800: "#7d131c",
          950: "#28070a",      // Harmful Background
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
