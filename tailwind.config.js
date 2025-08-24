/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Web app (Next.js App Router)
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",

    // (optional) keep these if you also want Tailwind in your extension popup:
    "./popup.html",
    "./popup.js"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [],
};
