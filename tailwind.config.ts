import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Triage levels — used consistently across intake, dashboard, rujukan (JANGAN UBAH LOGIC MEDIS)
        merah: { DEFAULT: "#dc2626", soft: "#fef2f2", border: "#fecaca" },
        kuning: { DEFAULT: "#d97706", soft: "#fffbeb", border: "#fde68a" },
        hijau: { DEFAULT: "#16a34a", soft: "#f0fdf4", border: "#bbf7d0" },

        // SATU Brand Identity — Biru Terang & Kuning Oranye (Harmonis dengan Halaman User)
        pmi: { DEFAULT: "#15B2C6", dark: "#1294A8" }, // Warna utama brand: Biru Terang (Cyan/Teal)
        satuBlue: { DEFAULT: "#15B2C6", dark: "#1294A8", light: "#E6F9FC", navy: "#0D1F2D" },
        satuYellow: { DEFAULT: "#FFA800", dark: "#E69700", light: "#FFF4D8", gold: "#E5B822" },

        // User App Theme (from proto/beranda.html & proto/profil.html)
        appBg: "#FAFAFA",
        sectionLabel: "#8E8E93",
        infoCardBg: "#CBE8EC",
        infoLink: "#169DB2",
        laporCardBg: "#E4F1FA",
        laporCardBorder: "#9AB3C4",
        laporDark: "#10222E",
        cariCardBg: "#FFF4D8",
        cariCardBorder: "#F5DFB0",
        cariOrange: "#FFA800",
        iconCircleBlue: "#DBECFA",
        relawanCardBg: "#E6F9FC",
        relawanCardBorder: "#AEECF6",
        relawanTeal: "#15B2C6",
        ctaTeal: "#1294A8",

        // Profile & Notification Page Theme
        iconGold: "#E5B822",
        navTeal: "#15A6B8",
        chevronGray: "#757575",
        navyActive: "#0D1F2D",
        iconTeal: "#00ACC1",
        warningAmber: "#FFA800",
        subGray: "#8E8E93",
      },
      boxShadow: {
        "soft-tile": "0 6px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "card-float": "0 8px 24px -4px rgba(0, 0, 0, 0.07)",
        "bottom-nav": "0 -4px 20px rgba(0, 0, 0, 0.06)",
        "profile-card": "0 4px 22px rgba(0, 0, 0, 0.06)",
        "menu-card": "0 5px 25px rgba(0, 0, 0, 0.065)",
        "floating-nav": "0 4px 26px rgba(21, 166, 184, 0.16), 0 2px 10px rgba(0, 0, 0, 0.04)",
        "pill-active": "0 6px 14px rgba(13, 31, 45, 0.18)",
        "pill-inactive": "0 2px 6px rgba(0, 0, 0, 0.04)",
        "notif-card": "0 4px 18px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        blinkRed: {
          "0%, 100%": { backgroundColor: "#fef2f2" },
          "50%": { backgroundColor: "#fecaca" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blinkRed: "blinkRed 1s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
