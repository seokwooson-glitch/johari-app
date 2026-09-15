import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F1EA",
        panel: "#FCFBF7",
        ink: "#2C2B33",
        sub: "#77747F",
        faint: "#A6A2AC",
        line: "#E6E1D5",
        accent: "#4C4CA6",
        open: "#B5842A",
        blind: "#2E8A8E",
        hidden: "#7A5AA6",
        unknown: "#7B828C",
      },
    },
  },
  plugins: [],
};
export default config;
