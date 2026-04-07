/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#0F172A",
        quiet: "#1E293B",
        glow: "#818CF8",
        accent: "#10B981",
      },
      transitionTimingFunction: {
        cosmic: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(129, 140, 248, 0.35)",
      },
    },
  },
  plugins: [],
};
