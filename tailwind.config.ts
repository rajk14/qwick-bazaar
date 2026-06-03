import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151713",
        leaf: "#0c8f42",
        lime: "#d9f99d",
        market: "#f5f7f2"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 38, 24, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
