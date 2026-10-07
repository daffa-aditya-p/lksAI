import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Poppins } from "next/font/google";
import { auth } from "@/auth";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { MapIllustration } from "@/components/landing/MapIllustration";
import "./landing.css";
import {
  Bot,
  Brain,
  Building2,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartHandshake,
  MapPin,
  MapPinned,
  Navigation,
  Package,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

/** Nama produk di copy landing — ubah di sini bila branding berganti. */
const BRAND = "SATU";

const FEATURES = [
  { Icon: Stethoscope, title: "Klasifikasi Kebutuhan", desc: "Mengidentifikasi kebutuhan dan layanan yang masuk." },
  { Icon: ScanLine, title: "Digital Check-In", desc: "Mempermudah pendataan warga secara digital." },
  { Icon: Bot, title: "AI Assistant", desc: "Membantu mengolah informasi dan laporan." },
  { Icon: Building2, title: "Pemantauan Rujukan", desc: "Memantau kebutuhan layanan rujukan." },
  { Icon: MapPinned, title: "Peta & Posko", desc: "Menemukan akses bantuan dan posko." },
  { Icon: FileText, title: "Lapor Cepat", desc: "Mengirim laporan kondisi darurat." },
  { Icon: Package, title: "Kebutuhan & Logistik", desc: "Melihat kebutuhan banyak yang diperlukan." },
  { Icon: Users, title: "Koordinasi Relawan", desc: "Menghubungkan relawan dengan kebutuhan di lapangan." },
];

const STEPS = [
  { Icon: ClipboardList, title: "Laporan", desc: "Sampaikan kondisi atau kebutuhan yang sedang terjadi melalui form." },
  { Icon: Brain, title: "Analisis", desc: "Sistem membantu mengelompokkan informasi dan mengidentifikasi kebutuhan dari laporan yang masuk." },
  { Icon: ShieldCheck, title: "Verifikasi", desc: "Relawan atau petugas memeriksa laporan memastikan informasi dan kebutuhan valid." },
  { Icon: HeartHandshake, title: "Tindak Lanjut", desc: "Bantuan dan layanan dikoordinasikan sesuai dengan kebutuhan yang telah diverifikasi." },
];

const NEWS = [
  { img: "/images/rescue/evakuasi-lapangan.png", loc: "Bali, Indonesia" },
  { img: "/images/rescue/asesmen-dampak.png", loc: "Bali, Indonesia" },
  { img: "/images/rescue/layanan-medis.png", loc: "Bali, Indonesia" },
  { img: "/images/rescue/respon-cepat.png", loc: "Bali, Indonesia" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/intake");
  }

  return (
    <main className={`sg ${poppins.className}`} style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}>
      {/* ───────────── HERO ───────────── */}
      <section className="sg-hero" id="home">
        <header className="sg-nav">
          <div className="sg-wrap sg-nav-inner">
            <Link href="/" aria-label={`${BRAND} — beranda`}>
              <Image src="/logo-no-background.png" alt={`Logo ${BRAND}`} width={44} height={44} priority style={{ objectFit: "contain" }} />
            </Link>
            <nav className="sg-nav-links" aria-label="Navigasi utama">
              <a href="#home" className="is-active keep">Home</a>
              <a href="#situasi">Situasi</a>
              <a href="#posko">Posko</a>
              <a href="#informasi">Informasi</a>
              <Link href="/login" className="hide-md">Masuk</Link>
              <Link href="/mandiri/POSKO01" className="sg-btn-orange">Lapor Sekarang</Link>
            </nav>
          </div>
        </header>

        <div className="sg-hero-photo" aria-hidden="true">
          <Image src="/images/landing/hero-ruins.jpg" alt="" fill priority sizes="62vw" />
        </div>

        <div className="sg-wrap sg-hero-body">
          <h1>
            <span className="l1">Cepat<br />merespons.</span>
            <span className="l2">Tepat<br />membantu.</span>
          </h1>
          <p className="lead">
            {BRAND} hadir untuk menghubungkan masyarakat dengan informasi, bantuan, posko, dan layanan yang dibutuhkan dalam situasi darurat.
          </p>

          <form className="sg-search" action="/peta" method="get" role="search">
            <label className="sg-field">
              <Search aria-hidden="true" size={13} />
              <input name="q" type="text" placeholder="Cari lokasi atau layanan" aria-label="Cari lokasi atau layanan" />
            </label>
            <label className="sg-field">
              <Calendar aria-hidden="true" size={13} />
              <select name="wilayah" aria-label="Pilih wilayah" defaultValue="">
                <option value="">Pilih wilayah</option>
                <option value="jakarta">Jakarta</option>
                <option value="jawa-barat">Jawa Barat</option>
                <option value="jawa-tengah">Jawa Tengah</option>
                <option value="jawa-timur">Jawa Timur</option>
                <option value="bali">Bali</option>
              </select>
            </label>
            <label className="sg-field">
              <Calendar aria-hidden="true" size={13} />
              <select name="kebutuhan" aria-label="Jenis kebutuhan" defaultValue="">
                <option value="">Jenis kebutuhan</option>
                <option value="medis">Bantuan medis</option>
                <option value="logistik">Logistik</option>
                <option value="air">Air bersih</option>
                <option value="evakuasi">Evakuasi</option>
              </select>
            </label>
            <button type="submit" className="sg-btn-orange">Cari</button>
          </form>
        </div>
      </section>

      {/* ───────────── TENTANG KAMI ───────────── */}
      <section className="sg-about" id="tentang">
        <div className="sg-wrap sg-about-grid">
          <div>
            <span className="sg-pill">Tentang Kami</span>
            <h2>
              Satu platform untuk<br />saling terhubung<br />dan <em>membantu.</em>
            </h2>
            <p>
              {BRAND} hadir untuk menghubungkan masyarakat, relawan, posko, dan layanan bantuan dalam satu platform. Dengan informasi yang lebih terarah, bantuan dapat dialokasikan dan dikoordinasikan dengan lebih cepat.
            </p>
          </div>
          <div className="sg-about-visual">
            <span className="circle" aria-hidden="true" />
            <div className="photo">
              <Image src="/images/landing/volunteers-group.jpg" alt="Relawan saling merangkul bersama" fill sizes="(max-width: 900px) 90vw, 440px" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FITUR UTAMA ───────────── */}
      <section className="sg-feat" id="fitur">
        <div className="sg-wrap">
          <h2>Fitur Utama Sistem {BRAND}</h2>
          <p className="sub">
            Membantu mempercepat koordinasi, mulai dari proses pencatatan korban di lapangan hingga rujukan pelayanan medis lanjutan.
          </p>
          <div className="sg-feat-grid">
            <div className="sg-feat-photo">
              <Image src="/images/landing/volunteer-pointing.jpg" alt="Relawan menunjuk ke daftar fitur" fill sizes="330px" />
            </div>
            <div className="sg-feat-cards">
              {FEATURES.map(({ Icon, title, desc }) => (
                <article className="sg-fcard" key={title}>
                  <span className="sg-ficon"><Icon aria-hidden="true" /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CARA KERJA ───────────── */}
      <section className="sg-how" id="cara-kerja">
        <div className="sg-wrap">
          <span className="sg-pill">Bagaimana Satu Bekerja</span>
          <h2>Dari laporan hingga bantuan,<br />semuanya terhubung.</h2>
          <p className="sub">
            {BRAND} membantu menghubungkan setiap langkah agar informasi dapat diproses, diverifikasi, dan ditindaklanjuti dengan lebih terarah.
          </p>
          <div className="sg-steps">
            {STEPS.map(({ Icon, title, desc }) => (
              <article className="sg-step" key={title}>
                <span className="ic"><Icon aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── SITUASI TERKINI ───────────── */}
      <section className="sg-news" id="situasi">
        <div className="sg-wrap">
          <h2>Situasi Terkini</h2>
          <div className="sg-news-grid">
            {NEWS.map((n, i) => (
              <Link href="/peta" className="sg-ncard" key={i}>
                <Image src={n.img} alt="Relawan menyalurkan bantuan untuk warga terdampak" fill sizes="(max-width: 900px) 50vw, 270px" />
                <div className="cap">
                  <small>{n.loc}</small>
                  <b>Relawan Salurkan Bantuan untuk Warga Terdampak</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── AKSES BANTUAN ───────────── */}
      <section className="sg-access" id="posko">
        <div className="sg-wrap">
          <span className="sg-pill">Akses Bantuan</span>
          <h2>Temukan Bantuan Terdekat</h2>
          <p className="sub">Temukan posko, layanan medis, dan titik bantuan di sekitar lokasi kamu.</p>

          <div className="sg-access-grid">
            <div className="sg-map">
              <MapIllustration />
              <div className="sg-zoom">
                <button type="button" aria-label="Perbesar peta">+</button>
                <button type="button" aria-label="Perkecil peta">−</button>
              </div>
            </div>

            <aside className="sg-panel" aria-label="Bantuan di sekitarmu">
              <h3>Bantuan di Sekitarmu</h3>

              <Link href="/peta" className="sg-place">
                <span className="dot navy"><Building2 size={13} aria-hidden="true" /></span>
                <span className="txt">
                  <b>Posko Pengungsian RW 05</b>
                  <span><MapPin size={7} aria-hidden="true" style={{ display: "inline" }} /> 1,2 km <span className="sg-tag">Tersedia</span></span>
                </span>
                <ChevronRight className="chev" size={12} aria-hidden="true" />
              </Link>

              <Link href="/peta" className="sg-place">
                <span className="dot red"><Plus size={13} aria-hidden="true" /></span>
                <span className="txt">
                  <b>Puskesmas Kecamatan</b>
                  <span><MapPin size={7} aria-hidden="true" style={{ display: "inline" }} /> 1,8 km <span className="sg-tag blue">Layanan Medis</span></span>
                </span>
                <ChevronRight className="chev" size={12} aria-hidden="true" />
              </Link>

              <Link href="/peta" className="sg-place">
                <span className="dot yel"><Truck size={13} aria-hidden="true" /></span>
                <span className="txt">
                  <b>Titik Bantuan Medis</b>
                  <span><MapPin size={7} aria-hidden="true" style={{ display: "inline" }} /> 2,4 km <span className="sg-tag green">Bantuan Medis</span></span>
                </span>
                <ChevronRight className="chev" size={12} aria-hidden="true" />
              </Link>

              <Link href="/peta" className="sg-btn-orange">
                <Navigation size={12} aria-hidden="true" /> Gunakan Lokasi Saya
              </Link>
              <Link href="/peta" className="sg-btn-outline">
                Lihat Semua <ChevronRight size={12} aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="sg-faq-wrap" id="informasi">
        <div className="sg-wrap">
          <div className="sg-faq-box">
            <h2>Pertanyaan Cepat</h2>
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="sg-footer">
        <div className="sg-wrap">
          <div className="sg-footer-grid">
            <div>
              <p className="sg-footer-msg">
                Melalui Website <strong>SIGAP</strong> kita membangun kesadaran dan kesiapsiagaan menghadapi bencana.
                <br />
                Setiap langkah persiapan hari ini menjadi perlindungan bagi kehidupan di masa depan
              </p>
              <form className="sg-footer-form">
                <label className="sr-only" htmlFor="footer-email">Masukan Email Kamu</label>
                <input id="footer-email" type="email" placeholder="Masukan Email Kamu" />
                <button type="submit">Kirim</button>
              </form>
            </div>

            <div className="sg-footer-about">
              <h2>ABOUT COMPANY</h2>
              <p>
                Kami adalah pengembang website dari SMK Negeri Mandiri 26 Jakarta yang mengikuti perlombaan ITECHNO CUP 2026.
              </p>
              <div className="sg-socials" aria-label="Media sosial">
                <a href="#twitter" aria-label="Twitter"><i className="fa-brands fa-twitter" /></a>
                <a href="#facebook" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
                <a href="#instagram" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
                <a href="#linkedin" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
              </div>
            </div>
          </div>
          <p className="sg-copy">Copyright © 2026 Walau Hebat</p>
        </div>
      </footer>
    </main>
  );
}
