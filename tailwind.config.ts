import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta exacta de Art & Ink Tattoo
        background: "#000000",
        "dark-bg": "#0A0A0A",
        "dark-card": "#1A1A1A",
        "dark-border": "#333333",
        primary: "#000000",
        secondary: "#1A1A1A",
        // Tonos bronceados/dorados apagados (como Art & Ink)
        gold: "#C9B896",           // Dorado apagado principal
        "gold-light": "#D4C4A8",   // Dorado claro
        "gold-dark": "#B8A886",    // Dorado oscuro
        bronze: "#B8A886",         // Bronce apagado
        accent: "#C9B896",         // Acento principal
        // Textos
        "text-primary": "#E5E5E5", // Blanco suave (no puro)
        "text-secondary": "#C9B896", // Dorado apagado
        "text-muted": "#8A8A8A",   // Gris medio
        "text-dark": "#666666",    // Gris oscuro
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #C9B896 0%, #B8A886 100%)",
        "gradient-dark": "linear-gradient(135deg, #000000 0%, #1A1A1A 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

