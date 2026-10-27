export default {
  plugins: {
    tailwindcss: {},
    // Keep the -webkit- prefixes already in the CSS (backdrop-filter, mask-composite) for older Safari.
    autoprefixer: { remove: false },
  },
};
