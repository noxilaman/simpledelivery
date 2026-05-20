import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        leaf: "#167A5B",
        chili: "#D84C2F",
        rice: "#FAF7F0",
        ink: "#17211D",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(23, 33, 29, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
