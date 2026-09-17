import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF4FF",
          100: "#DCE9FF",
          200: "#B8D2FF",
          500: "#0051D5",
          600: "#0043B3",
          700: "#00348D",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          border: "rgba(198, 198, 205, 0.4)",
        },
        surface: {
          DEFAULT: "#F8F9FF",
          card: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
