/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF1ED",
        surface: "#FFFFFF",
        ink: "#1F2E2B",
        primary: {
          DEFAULT: "#355E56",
          dark: "#234039",
          light: "#5C8A80",
        },
        accent: {
          DEFAULT: "#D98E48",
          dark: "#B8732F",
        },
        muted: "#8A9590",
        line: "#DDE3DE",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
