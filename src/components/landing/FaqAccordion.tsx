"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const FAQS = [
  {
    q: "Apa yang harus dilakukan saat terjadi bencana?",
    a: "Tetap tenang, selamatkan diri ke titik aman, lalu laporkan kondisimu melalui tombol Lapor Sekarang agar relawan dapat segera merespons.",
  },
  {
    q: "Bagaimana cara mendapatkan bantuan?",
    a: "Isi formulir laporan atau datang ke posko terdekat. Data keluargamu akan dinilai dan diprioritaskan oleh relawan.",
  },
  {
    q: "Di mana saya bisa menemukan posko terdekat?",
    a: "Gunakan fitur Akses Bantuan di halaman ini atau buka Peta untuk melihat posko pengungsian di sekitar lokasimu.",
  },
  {
    q: "Apa yang harus dilakukan jika membutuhkan bantuan medis?",
    a: "Jika kamu membutuhkan bantuan medis, segera cari layanan kesehatan atau posko terdekat. Gunakan fitur Cari Bantuan untuk menemukan fasilitas medis di sekitar lokasi kamu.",
  },
  {
    q: "Bagaimana cara melaporkan kondisi darurat?",
    a: "Tekan Lapor Sekarang, isi data singkat kondisi darurat dan lokasimu. Laporan langsung diteruskan ke relawan dan posko terkait.",
  },
];

function Item({ index, open, onToggle }: { index: number; open: boolean; onToggle: () => void }) {
  const f = FAQS[index];
  return (
    <div className={`sg-q${open ? " open" : ""}`}>
      <button type="button" aria-expanded={open} aria-controls={`faq-a-${index}`} onClick={onToggle}>
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <span className="qt">{f.q}</span>
        <span className="tg" aria-hidden="true">
          {open ? <X size={12} /> : <Plus size={12} />}
        </span>
      </button>
      <div className="ans" id={`faq-a-${index}`} role="region">
        <div>
          <p>{f.a}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion() {
  // Default: pertanyaan 04 terbuka, sesuai desain.
  const [openIdx, setOpenIdx] = useState<number | null>(3);
  const toggle = (i: number) => setOpenIdx((cur) => (cur === i ? null : i));

  return (
    <div className="sg-faq-cols">
      <div className="sg-faq-col">
        {[0, 1, 2].map((i) => (
          <Item key={i} index={i} open={openIdx === i} onToggle={() => toggle(i)} />
        ))}
      </div>
      <div className="sg-faq-col">
        {[3, 4].map((i) => (
          <Item key={i} index={i} open={openIdx === i} onToggle={() => toggle(i)} />
        ))}
      </div>
    </div>
  );
}
