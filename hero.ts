import { heroui } from "@heroui/theme";

export default heroui({
  themes: {
    light: {
      colors: {
        background: "#fafaf9", // Off-white for reduced eye strain
        foreground: "#1e293b", // Slate-800
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af", // Primary brand color
          900: "#1e3a8a",
          DEFAULT: "#1e40af",
          foreground: "#ffffff",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Emerald for high ratings
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Amber for medium ratings
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e", // Rose for low ratings
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
      },
    },
    dark: {
      colors: {
        background: "#0f172a", // Slate-900
        foreground: "#f8fafc", // Slate-50
        primary: {
          50: "#1e3a8a",
          100: "#1e40af",
          200: "#1d4ed8",
          300: "#2563eb",
          400: "#3b82f6",
          500: "#60a5fa",
          600: "#93c5fd",
          700: "#bfdbfe",
          800: "#dbeafe",
          900: "#eff6ff",
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#f43f5e",
          foreground: "#ffffff",
        },
      },
    },
  },
  layout: {
    radius: {
      small: "8px",
      medium: "12px",
      large: "16px",
    },
  },
});
