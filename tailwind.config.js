/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  important: "#app",
  theme: {
    extend: {
      colors: {
        // Base colors
        black: "#000000",
        white: "#FFFFFF",

        // Primary (Blue)
        primary: {
          25: "#F5FAFF",
          50: "#EFF8FF",
          100: "#D1E9FF",
          200: "#B2DDFF",
          300: "#84CAFF",
          400: "#53B1FD",
          500: "#2E90FA",
          600: "#1570EF",
          700: "#175CD3",
          800: "#1849A9",
          900: "#194185",
        },
        // secondary (Fuchsia)
        secondary: {
          25: "#FEFAFF",
          50: "#FDF4FF",
          100: "#FBE8FF",
          200: "#F6D0FE",
          300: "#EEAAFD",
          400: "#E478FA",
          500: "#D444F1",
          600: "#BA24D5",
          700: "#9F1AB1",
          800: "#821890",
          900: "#6F1877",
        },

        // Gray
        gray: {
          25: "#FCFCFD",
          50: "#F8FAFC",
          100: "#EEF2F6",
          200: "#E3E8EF",
          300: "#CDD5DF",
          400: "#9AA4B2",
          500: "#697586",
          600: "#4B5565",
          700: "#364152",
          800: "#202939",
          900: "#121926",
        },

        // Error (Red)
        error: {
          25: "#FFFBFA",
          50: "#FEF3F2",
          100: "#FEE4E2",
          200: "#FECDCA",
          300: "#FDA29B",
          400: "#F97066",
          500: "#F04438",
          700: "#B42318",
          800: "#912018",
          900: "#7A271A",
        },

        // Warning (Orange)
        warning: {
          25: "#FFFCF5",
          50: "#FFFAEB",
          100: "#FEF0C7",
          200: "#FEDF89",
          300: "#FEC84B",
          400: "#FDB022",
          500: "#F79009",
          600: "#DC6803",
          700: "#B54708",
          800: "#93370D",
          900: "#7A2E0E",
        },

        // Success (Green)
        success: {
          25: "#F6FEF9",
          50: "#ECFDF3",
          100: "#D1FADF",
          200: "#A6F4C5",
          300: "#6CE9A6",
          400: "#32D583",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
          800: "#05603A",
          900: "#054F31",
        },
        "qallab-blue": "#1849A9",
        "qallab-yellow": "#FEC84B",
        "qallab-blue-light": "#1570EF",
        "qallab-dashboard-bg": "#F8FAFC",
      },
      fontFamily: {
        // English font
        vietnam: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
        // Arabic font
        cairo: ['"Cairo"', "system-ui", "sans-serif"],
        // Default sans (Arabic-first for RTL)
        sans: ['"Cairo"', '"Be Vietnam Pro"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
