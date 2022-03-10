const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "scroll-behaviour": "smooth",
        },
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
          "scroll-behaviour": "smooth",
        },
      });
    }),
  ],
};
