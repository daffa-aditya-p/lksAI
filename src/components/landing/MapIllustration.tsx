/**
 * Ilustrasi peta statis (SVG) untuk section "Temukan Bantuan Terdekat".
 * Murni dekoratif — peta interaktif sebenarnya ada di /peta.
 */
export function MapIllustration() {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustrasi peta lokasi bantuan">
      <rect width="640" height="360" fill="#eaeff6" />
      {/* taman / area hijau */}
      <g fill="#cfe8c6">
        <rect x="40" y="30" width="110" height="70" rx="6" />
        <rect x="330" y="20" width="90" height="60" rx="6" />
        <rect x="470" y="230" width="120" height="80" rx="6" />
        <rect x="200" y="270" width="100" height="60" rx="6" />
        <rect x="560" y="60" width="60" height="70" rx="6" />
      </g>
      {/* blok bangunan */}
      <g fill="#dde4ee">
        <rect x="170" y="40" width="70" height="50" rx="4" />
        <rect x="260" y="110" width="80" height="60" rx="4" />
        <rect x="430" y="110" width="90" height="70" rx="4" />
        <rect x="60" y="210" width="90" height="60" rx="4" />
        <rect x="360" y="250" width="80" height="60" rx="4" />
      </g>
      {/* sungai */}
      <path d="M-10 250 C 80 210, 120 150, 210 150 S 330 210, 380 280 S 470 340, 560 370" fill="none" stroke="#bfe0f5" strokeWidth="26" strokeLinecap="round" />
      {/* jalan */}
      <g stroke="#ffffff" strokeLinecap="round" fill="none">
        <path d="M0 110 H640" strokeWidth="10" />
        <path d="M0 200 L640 170" strokeWidth="8" />
        <path d="M150 0 V360" strokeWidth="9" />
        <path d="M310 0 L350 360" strokeWidth="11" />
        <path d="M520 0 V360" strokeWidth="8" />
        <path d="M0 300 H640" strokeWidth="6" />
        <path d="M0 60 H640" strokeWidth="4" />
        <path d="M230 0 V360" strokeWidth="4" />
        <path d="M430 0 V360" strokeWidth="4" />
      </g>
      {/* lokasi pengguna */}
      <circle cx="178" cy="160" r="22" fill="#2f80ed" opacity=".15" />
      <circle cx="178" cy="160" r="8" fill="#2f80ed" stroke="#fff" strokeWidth="3" />
      {/* pin navy */}
      <g transform="translate(300 62)">
        <path d="M0 0 C-10 0 -14 8 -14 14 C-14 24 0 38 0 38 S14 24 14 14 C14 8 10 0 0 0Z" fill="#0b1f4b" />
        <circle cx="0" cy="14" r="5" fill="#fff" />
      </g>
      {/* pin merah */}
      <g transform="translate(68 180)">
        <path d="M0 0 C-10 0 -14 8 -14 14 C-14 24 0 38 0 38 S14 24 14 14 C14 8 10 0 0 0Z" fill="#ef4444" />
        <circle cx="0" cy="14" r="5" fill="#fff" />
      </g>
      {/* pin kuning */}
      <g transform="translate(250 190)">
        <path d="M0 0 C-12 0 -16 9 -16 16 C-16 27 0 42 0 42 S16 27 16 16 C16 9 12 0 0 0Z" fill="#ffc21a" />
        <circle cx="0" cy="16" r="6" fill="#fff" />
      </g>
    </svg>
  );
}
