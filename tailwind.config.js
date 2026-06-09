/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // LIGHT surface theme — warm, airy, friendly
        paper: "#FBFAF6", // page background
        surface: "#FFFFFF", // cards
        border: "#ECE8DF", // hairlines / card borders
        ink: "#25313C", // primary text
        ink2: "#5E6B76", // secondary text
        faint: "#97A0A8", // tertiary / disabled
        // Stage accents (re-tuned for legibility on white)
        foundations: "#0EA5B7", // Ch 1–2  teal
        feature: "#15A864", // Ch 3–4  green
        training: "#EE9613", // Ch 5–7  amber
        inference: "#EF5C46", // Ch 8–10 coral
        operations: "#7B61E8", // Ch 11 + Appendix violet
      },
      fontFamily: {
        display: ['"Jost"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,40,50,.05), 0 10px 30px rgba(30,40,50,.06)",
        "card-hover": "0 2px 4px rgba(30,40,50,.06), 0 16px 40px rgba(30,40,50,.10)",
      },
    },
  },
  plugins: [],
};
