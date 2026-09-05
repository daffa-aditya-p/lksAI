import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { InteractiveDashboard } from "@/components/landing/InteractiveDashboard";
import { 
  ArrowRight, 
  QrCode, 
  ChevronRight, 
  Check, 
  Building2, 
  Cpu,
  Stethoscope,
  ScanLine,
  Bot,
  MapPinned,
  FileWarning,
  TreePine,
  CloudRain,
  HeartHandshake,
  Sprout,
  Banknote
} from "lucide-react";

const ARTICLES = [
  {
    id: 1,
    date: "August 24, 2024",
    title: "10 Bencana Alam Terbesar di Indonesia, Pernah Tewaskan Sebagian Besar....",
    excerpt: "BENCANA alam seringkali melanda Indonesia. Dikutip dari situs Badan Nasional Penanggulangan Bencana...",
    image: "/Berita%20Images/image%20(3).png",
    url: "https://bpbd.bogorkab.go.id/berita/Seputar-OPD/10-bencana-alam-terbesar-di-indonesia-pernah-tewaskan-sebagian-besar-penduduk-bumi",
  },
  {
    id: 2,
    date: "July 31, 2026",
    title: "Gorontalo Siaga Darurat Bencana Kekeringan, 5.388 Warga Krisis Air....",
    excerpt: "Gorontalo - Badan Penanggulangan Bencana Daerah (BPBD) Provinsi Gorontalo melaporkan 5.388 jiwa dari 2.381...",
    image: "/Berita%20Images/image%20(4).png",
    url: "https://www.detik.com/tag/bencana-alam",
  },
  {
    id: 3,
    date: "January 19, 2009",
    title: "Tanah Longsor di Lombok Disebabkan oleh Tingginya Curah Hujan.",
    excerpt: "Peristiwa banjir dan tanah longsor di Kabupaten Lombok Barat, Lombok Tengah, Lombok Utara, dan Kabupaten...",
    image: "/Berita%20Images/image%20(11).png",
    url: "https://www.esdm.go.id/id/media-center/arsip-berita/tanah-longsor-di-lombok-disebabkan-oleh-tingginya-curah-hujan",
  },
  {
    id: 4,
    date: "March 30, 2022",
    title: "Kejadian Bencana Alam di Kabupaten Magelang Tahun 2020.",
    excerpt: "Bencana adalah peristiwa atau rangkaian peristiwa yang mengancam dan mengganggu kehidupan dan peng...",
    image: "/Berita%20Images/image%20(6).png",
    url: "https://pusaka.magelangkab.go.id/data-bicara/oglX98Dw7vMpyObvOZQY0PRexAb6m1",
  },
  {
    id: 5,
    date: "April 02, 2026",
    title: "Maret 2026 Aceh Dilanda 26 Kejadian Bencana, Kebakaran Pemukiman....",
    excerpt: "Badan Penanggulangan Bencana Alam (BPBA) mencatat bencana alam yang terjadi di Aceh Periode Maret seba...",
    image: "/Berita%20Images/image%20(7).png",
    url: "https://bpba.acehprov.go.id/berita/kategori/bencana/maret-2026-aceh-dilanda-26-kejadian-bencana-kebakaran-pemukiman-masih-dominan",
  },
  {
    id: 6,
    date: "February 04, 2026",
    title: "Banjir Bandang Terjang Pakis-Pecoro Jember, Satu Warga Tewas dan....",
    excerpt: "Banjir bandang melanda wilayah Kabupaten Jember, Jawa Timur, pada Senin (2/2/2026) malam, akibat hujan...",
    image: "/Berita%20Images/image%20(10).png",
    url: "https://ppid.jemberkab.go.id/berita/banjir-bandang-terjang-pakis-pecoro-jember-satu-warga-tewas-dan-puluhan-rumah-terdampak-20260204",
  },
  {
    id: 7,
    date: "February 03, 2026",
    title: "Gunungkidul Catat 129 Kejadian Bencana pada Januari 2026, Cuaca....",
    excerpt: "Dari total kejadian tersebut, bencana cuaca ekstrem menyumbang 58,9% dari seluruh insiden, diikuti oleh tanah...",
    image: "/Berita%20Images/image%20(8).png",
    url: "https://bpbd.gunungkidulkab.go.id/2026/02/03/gunungkidul-catat-129-kejadian-bencana-pada-januari-2026-cuaca-ekstrem-dominasi/",
  },
  {
    id: 8,
    date: "July 24, 2026",
    title: "BANJIR BANDANG TERJANG GAYO LUES, BPBD LAKUKAN PENANGANAN DAN....",
    excerpt: "Gayo Lues, 24 Juli 2026, 00.15 WIB - Hujan dengan intensitas sedang hingga lebat yang mengguyur wilayah Kabupaten...",
    image: "/Berita%20Images/image%20(9).png",
    url: "https://bpba.acehprov.go.id/berita/kategori/bencana/banjir-bandang-terjang-gayo-lues-bpbd-lakukan-penanganan-dan-pendataan-warga-terdampak",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/intake");
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 overflow-x-hidden selection:bg-pmi selection:text-white">
      {/* Navbar Minimalis */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size={32} withWordmark />
          
          <div className="flex items-center gap-6">
            <Link
              href="/mandiri/POSKO01"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-pmi"
            >
              Lapor Mandiri
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-pmi px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pmi-dark active:scale-98"
            >
              Masuk Sistem
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero informasi — placeholder foto sampai aset dokumentasi lapangan tersedia. */}
      <section className="relative overflow-hidden bg-white px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-pmi sm:text-4xl lg:text-[42px] lg:leading-tight">
            Kenali Risiko, Siapkan Diri, Lindungi Sesama
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-pmi sm:text-base">
            Kami menyediakan layanan informasi dan panduan tanggap bencana yang membantu masyarakat meningkatkan kesiapsiagaan dan mendapatkan pertolongan dengan cepat.
          </p>

          <div className="mosaic-grid mx-auto mt-12 max-w-5xl" aria-label="Dokumentasi tanggap bencana">
            <figure className="mosaic-card mosaic-left"><Image src="/images/rescue/evakuasi-lapangan.png" alt="Tim relawan membawa tandu saat evakuasi di area bencana" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-ruins"><Image src="/images/rescue/asesmen-dampak.png" alt="Area perkotaan terdampak reruntuhan bencana" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-medics"><Image src="/images/rescue/layanan-medis.png" alt="Petugas PMI memberikan layanan medis di lapangan" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-main"><Image src="/images/rescue/koordinasi-relawan.png" alt="Relawan berkoordinasi di area pencarian dan penyelamatan" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-tent"><Image src="/images/rescue/posko-bantuan.png" alt="Relawan PMI bertugas di posko bantuan" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-building"><Image src="/images/rescue/pemulihan.png" alt="Bangunan terdampak bencana menunggu pemulihan" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
            <figure className="mosaic-card mosaic-right"><Image src="/images/rescue/respon-cepat.png" alt="Tim penyelamat membawa tandu dalam respons cepat" fill sizes="(max-width: 639px) 30vw, 160px" /></figure>
          </div>
        </div>
      </section>

      {/* Sistem manajemen & triage */}
      <section className="system-section relative flex flex-col justify-center bg-white px-4 pb-20 sm:px-6 lg:px-8">
        <div className="system-frame mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Hero Left: Text & Action */}
          <div className="system-copy flex flex-col text-left lg:col-span-6 lg:order-2">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl md:leading-[1.15]">
              Sistem Manajemen <br />
              & <span className="text-pmi">Triage Pengungsi</span>
            </h1>

            <p className="mb-8 max-w-xl text-base text-slate-600 sm:text-lg leading-relaxed">
              Aplikasi pendataan korban bencana alam dan klasifikasi tingkat kerentanan keluarga berbasis kecerdasan buatan untuk mempercepat penanganan medis dan alokasi logistik di posko lapangan PMI.
            </p>
            <p className="mb-8 max-w-xl text-base text-slate-600 sm:text-lg leading-relaxed">
              Sistem ini mendukung proses penanganan medis serta alokasi logistik di posko lapangan agar bantuan dapat diberikan sesuai kebutuhan dan kondisi korban.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-lg bg-pmi px-6 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-pmi-dark active:scale-98"
              >
                Masuk Sesi Relawan
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/mandiri/POSKO01"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors active:scale-98"
              >
                Isi Formulir Mandiri (Demo)
              </Link>
            </div>

          </div>

          {/* Hero Right: Table Preview Mockup */}
          <div className="w-full lg:col-span-6 lg:order-1">
            <InteractiveDashboard />
          </div>

        </div>
      </section>

      {/* Fitur utama — komposisi 6 kartu sesuai Figma. */}
      <section className="feature-section bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight text-pmi sm:text-4xl">Fitur Utama Sistem SIGAP</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Membantu mempercepat koordinasi, mulai dari proses pencatatan korban di lapangan hingga rujukan pelayanan medis lanjutan.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <article className="feature-card">
              <span className="feature-icon"><Stethoscope /></span>
              <h3>Smart Medical Classification</h3>
              <p>Klasifikasi prioritas triage otomatis dari laporan kondisi medis untuk membantu respons pertama.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><ScanLine /></span>
              <h3>Digital Check-In</h3>
              <p>Pendataan keluarga melalui formulir digital dan QR untuk mempercepat proses kedatangan di posko.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><Bot /></span>
              <h3>AI Assistant</h3>
              <p>Ringkasan laporan dan dukungan analisis cepat agar relawan dapat fokus pada penanganan korban.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><Building2 /></span>
              <h3>Pemantauan Rujukan</h3>
              <p>Monitor ketersediaan layanan rujukan untuk korban prioritas dan kebutuhan penanganan lanjutan.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><MapPinned /></span>
              <h3>Posko Pemetaan</h3>
              <p>Peta lintas-posko untuk melihat sebaran kebutuhan, area terdampak, dan koordinasi bantuan.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><FileWarning /></span>
              <h3>Lapor Cepat</h3>
              <p>Kirim laporan situasi lapangan secara ringkas agar kebutuhan mendesak segera ditindaklanjuti.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Edukasi risiko dan dampak bencana — struktur sesuai Figma. */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="risk-layout">
            <article className="risk-headline">
              <p className="risk-kicker">KESIAPSIAGAAN BERSAMA</p>
              <h2>Namun, Mengapa Tingkat Bencana di Indonesia Terus Meningkat?</h2>
            </article>
            <div className="risk-factors">
              <article>
                <TreePine aria-hidden="true" />
                <p>
                  <span className="risk-factor-lead">Penyebab utama<br />risiko bencana yaitu</span>
                  <strong>PERUBAHAN<br />LINGKUNGAN</strong>
                  <span className="risk-factor-tail">dan kurangnya<br />mitigasi bencana</span>
                </p>
              </article>
              <article>
                <CloudRain aria-hidden="true" />
                <p>
                  <span className="risk-factor-lead">Faktor pendukung tingginya<br />dampak bencana yaitu</span>
                  <strong>PERUBAHAN<br />IKLIM</strong>
                  <span className="risk-factor-tail">dan kerusakan<br />ekosistem</span>
                </p>
              </article>
            </div>
            <Link href="/peta" className="risk-more">
              Cari tau lebih lanjut? <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Edukasi dampak bencana — panel putih + 3 kartu overlapping foto, sesuai Figma */}
        <div className="impact-stage mt-16 sm:mt-20" aria-labelledby="impact-title">
          <Image className="impact-photo" src="/images/rescue/dampak-bencana.png" alt="Tim relawan melakukan evakuasi dan penanganan darurat di lapangan" fill priority sizes="100vw" />
          <div className="impact-panel">
            <header className="impact-copy">
              <h2 id="impact-title">DAMPAK<br />BENCANA</h2>
              <p>Bencana dapat menimbulkan korban jiwa, kerusakan lingkungan, kerugian ekonomi, dan mengganggu kehidupan masyarakat.</p>
            </header>
            <div className="impact-cards">
              <article className="impact-card is-active">
                <b>Kehidupan Masyarakat</b>
                <small>Bencana dapat menghambat aktivitas sehari-hari, mengganggu layanan publik, serta menyebabkan masyarakat harus mengungsi dari tempat tinggalnya. Dampak sosial dan psikologis juga dapat dirasakan oleh masyarakat dalam proses pemulihan pascabencana.</small>
              </article>
              <article className="impact-card">
                <b>Kerusakan Lingkungan</b>
                <small>Bencana dapat menyebabkan kerusakan pada ekosistem, pencemaran lingkungan, serta perubahan kondisi alam di wilayah terdampak. Kerusakan ini dapat memengaruhi kualitas hidup masyarakat dan mengganggu keseimbangan lingkungan.</small>
              </article>
              <article className="impact-card">
                <b>Kerugian Ekonomi</b>
                <small>Bencana dapat menimbulkan kerusakan pada rumah, fasilitas umum, infrastruktur, serta aset masyarakat. Selain itu, aktivitas ekonomi seperti perdagangan, pekerjaan, dan usaha dapat terganggu sehingga menyebabkan kerugian finansial.</small>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Section Artikel Terkini */}
      <section className="article-section bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="article-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6 sm:mb-8">
            Artikel Terkini
          </h2>

          <div className="article-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8">
            {ARTICLES.map((article) => (
              <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="flex flex-col group cursor-pointer">
                <div className="article-image relative w-full aspect-[1.05/1] overflow-hidden rounded-xl mb-4 bg-slate-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <time className="article-date text-xs text-slate-400 font-medium mb-1.5">
                  {article.date}
                </time>
                <h3 className="article-title text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-pmi transition-colors">
                  {article.title}
                </h3>
                <p className="article-excerpt text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* Alur Kerja Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16 text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Alur Operasional Lapangan
            </h2>
          </div>

          <div className="relative">
            {/* Center Line (Desktop Only) */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-slate-200 md:left-1/2 md:-ml-0.5"></div>
            
            <div className="space-y-12">
              
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row md:items-center">
                <div className="pl-12 md:pl-0 md:w-1/2 md:pr-12 md:text-right">
                  <span className="inline-flex rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 mb-2">
                    Tahap 1
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Laporan Mandiri / Wawancara</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Pengungsi mengisi form mandiri secara digital atau relawan melakukan wawancara langsung pada meja kedatangan posko bencana.
                  </p>
                </div>
                <div className="absolute left-1.5 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-pmi shadow md:left-1/2 md:-ml-4.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row-reverse md:items-center">
                <div className="pl-12 md:w-1/2 md:pl-12 md:text-left">
                  <span className="inline-flex rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 mb-2">
                    Tahap 2
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Klasifikasi Otomatis</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Data masukan diproses oleh sistem untuk mengukur tingkat kerentanan keluarga korban bencana dan menugaskan level Triage medis secara instan.
                  </p>
                </div>
                <div className="absolute left-1.5 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-pmi shadow md:left-1/2 md:-ml-4.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </div>
                <div className="md:w-1/2 md:pr-12"></div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row md:items-center">
                <div className="pl-12 md:pl-0 md:w-1/2 md:pr-12 md:text-right">
                  <span className="inline-flex rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 mb-2">
                    Tahap 3
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Verifikasi QR Code</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Saat korban tiba di posko pusat, admin memindai QR Code untuk memvalidasi dan mengimpor data terverifikasi ke basis data induk.
                  </p>
                </div>
                <div className="absolute left-1.5 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-pmi shadow md:left-1/2 md:-ml-4.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row-reverse md:items-center">
                <div className="pl-12 md:w-1/2 md:pl-12 md:text-left">
                  <span className="inline-flex rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 mb-2">
                    Tahap 4
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">Rujukan & Penanganan</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Korban dengan triage prioritas Merah langsung diarahkan ke tenda medis utama posko atau didaftarkan rujukan ke rumah sakit terdekat.
                  </p>
                </div>
                <div className="absolute left-1.5 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-pmi shadow md:left-1/2 md:-ml-4.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </div>
                <div className="md:w-1/2 md:pr-12"></div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-message">
            <p>
              Melalui Website <strong>SIGAP</strong> kita membangun kesadaran dan kesiapsiagaan menghadapi bencana.
              <br />
              Setiap langkah persiapan hari ini menjadi perlindungan bagi kehidupan di masa depan
            </p>
            <form className="landing-footer-form">
              <label className="sr-only" htmlFor="footer-email">Masukan Email Kamu</label>
              <input id="footer-email" type="email" placeholder="Masukan Email Kamu" />
              <button type="submit">Kirim</button>
            </form>
          </div>

          <div className="landing-footer-about">
            <h2>ABOUT COMPANY</h2>
            <p>
              Kami adalah pengembang website dari SMK Negeri Mandiri<br />
              26 Jakarta yang mengikuti perlombaan ITECHNOP 2026.
            </p>
            <div className="landing-footer-socials" aria-label="Media sosial SIGAP">
              <a href="#twitter" aria-label="Twitter"><i className="fa-brands fa-twitter" /></a>
              <a href="#facebook" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              <a href="#instagram" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
              <a href="#linkedin" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
            </div>
          </div>
        </div>
        <p className="landing-footer-copyright">Copyright © 2026 WALAU HEBAT</p>
      </footer>
    </main>
  );
}
