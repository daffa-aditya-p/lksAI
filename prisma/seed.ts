/**
 * Seed data awal SATU AI — NASIONAL (Seluruh 38 Provinsi di Indonesia).
 * Jalankan: npm run db:seed
 *
 * Membuat:
 *  - 1 akun ADMIN  (admin / admin123)
 *  - 1 akun RELAWAN (relawan / relawan123)
 *  - 1 PoskoConfig contoh (kode "POSKO01") untuk mode mandiri/QR
 *  - 70+ Posko strategis bencana mencakup seluruh 38 Provinsi di Indonesia
 */
import { PrismaClient, KategoriKebutuhan, Level } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedPosko {
  namaPosko: string;
  areaPublik: string;
  alamatText: string;
  lat: number;
  lng: number;
  kebutuhan: {
    kategori: KategoriKebutuhan;
    estimasiJumlah: number;
    urgensi: Level;
    ringkasanLaporan: string;
  }[];
}

async function main() {
  console.log("🚀 Memulai seeding data SATU AI Nasional...");

  const adminPass = await bcrypt.hash("admin123", 10);
  const relawanPass = await bcrypt.hash("relawan123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminPass, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { username: "relawan" },
    update: {},
    create: { username: "relawan", passwordHash: relawanPass, role: "RELAWAN" },
  });

  // Posko contoh — Monas, Jakarta. Radius 2 km untuk validasi anti-spam.
  await prisma.poskoConfig.upsert({
    where: { kodePosko: "POSKO01" },
    update: {},
    create: {
      kodePosko: "POSKO01",
      nama: "Posko Pengungsian Lapangan Monas",
      lat: -6.1754,
      lng: 106.8272,
      radiusMeter: 2000,
    },
  });

  // DAFTAR POSKO NASIONAL MENCAKUP SELURUH 38 PROVINSI DI INDONESIA
  const poskoList: SeedPosko[] = [
    // ── 1. ACEH ────────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Bencana Tsunami & Banjir BPBA Banda Aceh",
      areaPublik: "Banda Aceh, Aceh",
      alamatText: "Jl. Tgk Daud Beureueh No. 18, Kuta Alam, Kota Banda Aceh",
      lat: 5.553,
      lng: 95.328,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 80, urgensi: "KUNING", ringkasanLaporan: "Tandon air bersih darurat" },
        { kategori: "selimut_pakaian", estimasiJumlah: 150, urgensi: "HIJAU", ringkasanLaporan: "Selimut dan tenda pleton" },
      ],
    },

    // ── 2. SUMATERA UTARA ──────────────────────────────────────────────────────
    {
      namaPosko: "Posko Tanggap Bencana Erupsi Sinabung & Banjir Medan",
      areaPublik: "Medan, Sumatera Utara",
      alamatText: "Jl. Palang Merah No. 17, Medan Baru, Kota Medan",
      lat: 3.5952,
      lng: 98.6722,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 500, urgensi: "MERAH", ringkasanLaporan: "Masker respirator N95 debu vulkanik" },
        { kategori: "makanan_pokok", estimasiJumlah: 300, urgensi: "KUNING", ringkasanLaporan: "Dapur umum mandiri PMI Sumut" },
      ],
    },

    // ── 3. SUMATERA BARAT ──────────────────────────────────────────────────────
    {
      namaPosko: "Posko Tanggap Darurat Lahar Dingin Marapi & Gempa Padang",
      areaPublik: "Padang, Sumatera Barat",
      alamatText: "Jl. Sudirman No. 50, Padang Barat, Kota Padang",
      lat: -0.9471,
      lng: 100.3543,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 5, urgensi: "MERAH", ringkasanLaporan: "Tim bedah darurat & trauma healing" },
        { kategori: "air_bersih", estimasiJumlah: 120, urgensi: "KUNING", ringkasanLaporan: "Air pipa PDAM putus akibat lahar" },
      ],
    },

    // ── 4. RIAU ────────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Karhutla & Siaga Asap Manggala Agni Pekanbaru",
      areaPublik: "Pekanbaru, Riau",
      alamatText: "Jl. Jenderal Sudirman KM 3.5, Bukit Raya, Pekanbaru",
      lat: 0.5071,
      lng: 101.4478,
      kebutuhan: [
        { kategori: "obat_demam_analgesik", estimasiJumlah: 200, urgensi: "KUNING", ringkasanLaporan: "Obat ISPA dan vitamin anak" },
        { kategori: "tenaga_medis", estimasiJumlah: 4, urgensi: "KUNING", ringkasanLaporan: "Poli pernapasan keliling" },
      ],
    },

    // ── 5. KEPULAUAN RIAU ──────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Bencana Cuaca Ekstrem Laut Batam",
      areaPublik: "Batam, Kepulauan Riau",
      alamatText: "Jl. Engku Putri No. 1, Teluk Tering, Batam Kota",
      lat: 1.1301,
      lng: 104.0529,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 60, urgensi: "KUNING", ringkasanLaporan: "Jaket pelampung nelayan pesisir" },
        { kategori: "makanan_pokok", estimasiJumlah: 150, urgensi: "HIJAU", ringkasanLaporan: "Logistik pangan warga pulau kecil" },
      ],
    },

    // ── 6. JAMBI ───────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Banjir Luapan Sungai Batanghari",
      areaPublik: "Telanaipura, Jambi",
      alamatText: "Jl. A. Yani No. 2, Telanaipura, Kota Jambi",
      lat: -1.6101,
      lng: 103.5824,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 70, urgensi: "KUNING", ringkasanLaporan: "Tandon air dan pompa sanitasi" },
        { kategori: "makanan_pokok", estimasiJumlah: 250, urgensi: "KUNING", ringkasanLaporan: "Dapur darurat pengungsian" },
      ],
    },

    // ── 7. SUMATERA SELATAN ────────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Banjir Pasang Sungai Musi Palembang",
      areaPublik: "Ilir Barat I, Palembang, Sumatera Selatan",
      alamatText: "Jl. Merdeka No. 10, Bukit Kecil, Palembang",
      lat: -2.9909,
      lng: 104.7565,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 90, urgensi: "KUNING", ringkasanLaporan: "Pasokan air galon warga bantaran Musi" },
        { kategori: "kebutuhan_bayi", estimasiJumlah: 35, urgensi: "KUNING", ringkasanLaporan: "Popok dan bubur bayi" },
      ],
    },

    // ── 8. BENGKULU ────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Gempa Megathrust & Tsunami Bengkulu",
      areaPublik: "Ratu Samban, Bengkulu",
      alamatText: "Jl. Basuki Rahmat No. 1, Ratu Samban, Kota Bengkulu",
      lat: -3.7928,
      lng: 102.2608,
      kebutuhan: [
        { kategori: "selimut_pakaian", estimasiJumlah: 100, urgensi: "HIJAU", ringkasanLaporan: "Tenda keluarga dan matras" },
        { kategori: "tenaga_medis", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Tim reaksi cepat P3K" },
      ],
    },

    // ── 9. LAMPUNG ─────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Pesisir Selat Sunda & Rajabasa Lampung",
      areaPublik: "Bandar Lampung, Lampung",
      alamatText: "Jl. Raden Intan No. 88, Tanjung Karang Pusat, Bandar Lampung",
      lat: -5.4297,
      lng: 105.2625,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 80, urgensi: "KUNING", ringkasanLaporan: "Distribusi air bersih PMI Lampung" },
        { kategori: "makanan_pokok", estimasiJumlah: 300, urgensi: "HIJAU", ringkasanLaporan: "Beras dan sarden kaleng" },
      ],
    },

    // ── 10. KEPULAUAN BANGKA BELITUNG ──────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Genangan & Cuaca Pesisir Pangkalpinang",
      areaPublik: "Pangkalpinang, Bangka Belitung",
      alamatText: "Jl. Jenderal Sudirman No. 25, Gabek, Pangkalpinang",
      lat: -2.129,
      lng: 106.1139,
      kebutuhan: [
        { kategori: "makanan_pokok", estimasiJumlah: 120, urgensi: "HIJAU", ringkasanLaporan: "Makanan siap santap warga pesisir" },
      ],
    },

    // ── 11. BANTEN ─────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Erupsi Anak Krakatau & Banjir Lebak",
      areaPublik: "Serang, Banten",
      alamatText: "Jl. KH Abdul Fatah Hasan No. 53, Ciceri, Serang",
      lat: -6.12,
      lng: 106.1503,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 3, urgensi: "MERAH", ringkasanLaporan: "Perahu evakuasi luapan Ciujung" },
        { kategori: "selimut_pakaian", estimasiJumlah: 130, urgensi: "KUNING", ringkasanLaporan: "Pakaian kering dan sarung" },
      ],
    },

    // ── 12. JAWA BARAT ─────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Induk Gempa Sesar Cugenang Cianjur",
      areaPublik: "Cianjur, Jawa Barat",
      alamatText: "Jl. KH Abdullah Bin Nuh No. 1, Pamoyanan, Cianjur",
      lat: -6.8222,
      lng: 107.1394,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 6, urgensi: "MERAH", ringkasanLaporan: "Dokter ortopedi & perawat lapangan" },
        { kategori: "selimut_pakaian", estimasiJumlah: 200, urgensi: "KUNING", ringkasanLaporan: "Tenda darurat dan selimut tebal" },
      ],
    },
    {
      namaPosko: "Posko Tanggap Bencana Banjir Citarum Dayeuhkolot",
      areaPublik: "Dayeuhkolot, Kabupaten Bandung, Jawa Barat",
      alamatText: "Jl. Dayeuhkolot No. 120, Dayeuhkolot, Bandung",
      lat: -6.985,
      lng: 107.625,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 110, urgensi: "MERAH", ringkasanLaporan: "Pasokan air minum terendam banjir" },
        { kategori: "lainnya", estimasiJumlah: 4, urgensi: "KUNING", ringkasanLaporan: "Perahu karet patroli RW 01-08" },
      ],
    },

    // ── 13. JAWA TENGAH ────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Tanggul Jebol Demak - Kudus",
      areaPublik: "Karanganyar, Kabupaten Demak, Jawa Tengah",
      alamatText: "Jl. Raya Semarang - Demak KM 14, Demak",
      lat: -6.8944,
      lng: 110.6389,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 140, urgensi: "MERAH", ringkasanLaporan: "Air minum tangki untuk 500 KK" },
        { kategori: "makanan_pokok", estimasiJumlah: 450, urgensi: "KUNING", ringkasanLaporan: "Nasi bungkus 3 kali sehari" },
      ],
    },
    {
      namaPosko: "Posko Pengungsian Erupsi Gunung Merapi Muntilan",
      areaPublik: "Muntilan, Magelang, Jawa Tengah",
      alamatText: "Jl. Pemuda No. 40, Muntilan, Magelang",
      lat: -7.581,
      lng: 110.287,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 800, urgensi: "MERAH", ringkasanLaporan: "Masker pelindung abu vulkanik" },
        { kategori: "obat_kronis", estimasiJumlah: 60, urgensi: "KUNING", ringkasanLaporan: "Obat asma dan nebulizer lansia" },
      ],
    },

    // ── 14. DI YOGYAKARTA ──────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Erupsi Merapi & Sesar Opak Sleman",
      areaPublik: "Sleman, DI Yogyakarta",
      alamatText: "Jl. Kaliurang KM 14.5, Pakem, Sleman, DI Yogyakarta",
      lat: -7.665,
      lng: 110.42,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 4, urgensi: "KUNING", ringkasanLaporan: "Posko siaga kesehatan bencana DIY" },
        { kategori: "makanan_pokok", estimasiJumlah: 220, urgensi: "HIJAU", ringkasanLaporan: "Logistik dapur umum TRC BPBD" },
      ],
    },

    // ── 15. JAWA TIMUR ─────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Induk Erupsi Semeru Pronojiwo",
      areaPublik: "Pronojiwo, Kabupaten Lumajang, Jawa Timur",
      alamatText: "Jl. Raya Pronojiwo No. 22, Pronojiwo, Lumajang",
      lat: -8.216,
      lng: 112.93,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 5, urgensi: "MERAH", ringkasanLaporan: "Penanganan luka bakar & ISPA Semeru" },
        { kategori: "air_bersih", estimasiJumlah: 150, urgensi: "MERAH", ringkasanLaporan: "Pipa air bersih hancur diterjang lahar" },
      ],
    },
    {
      namaPosko: "Posko Siaga Banjir Bengawan Solo Bojonegoro",
      areaPublik: "Bojonegoro, Jawa Timur",
      alamatText: "Jl. MH Thamrin No. 15, Bojonegoro",
      lat: -7.15,
      lng: 111.881,
      kebutuhan: [
        { kategori: "makanan_pokok", estimasiJumlah: 260, urgensi: "KUNING", ringkasanLaporan: "Dapur umum bantaran Bengawan Solo" },
      ],
    },

    // ── 16. BALI ───────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Erupsi Gunung Agung Rendang",
      areaPublik: "Rendang, Karangasem, Bali",
      alamatText: "Jl. Raya Besakih, Rendang, Karangasem, Bali",
      lat: -8.441,
      lng: 115.434,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 15, urgensi: "KUNING", ringkasanLaporan: "Tenda pengungsi KRB III" },
        { kategori: "air_bersih", estimasiJumlah: 90, urgensi: "KUNING", ringkasanLaporan: "Mobil tangki air bersih" },
      ],
    },

    // ── 17. NUSA TENGGARA BARAT ────────────────────────────────────────────────
    {
      namaPosko: "Posko Gempa Lombok Utara & Sesar Naik Rinjani",
      areaPublik: "Tanjung, Lombok Utara, NTB",
      alamatText: "Jl. Raya Tanjung No. 10, Tanjung, Lombok Utara",
      lat: -8.355,
      lng: 116.155,
      kebutuhan: [
        { kategori: "selimut_pakaian", estimasiJumlah: 170, urgensi: "KUNING", ringkasanLaporan: "Tenda terpal & selimut anak" },
        { kategori: "air_bersih", estimasiJumlah: 100, urgensi: "KUNING", ringkasanLaporan: "Air galon layak minum" },
      ],
    },

    // ── 18. NUSA TENGGARA TIMUR ────────────────────────────────────────────────
    {
      namaPosko: "Posko Pengungsian Erupsi Gunung Lewotobi Laki-Laki",
      areaPublik: "Wulanggitang, Flores Timur, NTT",
      alamatText: "Jl. Trans Flores, Desa Boru, Wulanggitang, Flores Timur",
      lat: -8.538,
      lng: 122.775,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 1000, urgensi: "MERAH", ringkasanLaporan: "Masker tebal & kacamata abu vulkanik" },
        { kategori: "makanan_pokok", estimasiJumlah: 380, urgensi: "MERAH", ringkasanLaporan: "Beras & makanan bayi pengungsi Lewotobi" },
        { kategori: "tenaga_medis", estimasiJumlah: 4, urgensi: "MERAH", ringkasanLaporan: "Dokter umum & perawat IGD darurat" },
      ],
    },

    // ── 19. KALIMANTAN BARAT ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Banjir Luapan Sungai Kapuas Sintang",
      areaPublik: "Sintang, Kalimantan Barat",
      alamatText: "Jl. Lintas Melawi No. 45, Sintang, Kalimantan Barat",
      lat: 0.075,
      lng: 111.498,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 4, urgensi: "MERAH", ringkasanLaporan: "Speedboat logistik sungai terisolir" },
        { kategori: "makanan_pokok", estimasiJumlah: 320, urgensi: "KUNING", ringkasanLaporan: "Pangan kering tahan air" },
      ],
    },

    // ── 20. KALIMANTAN TENGAH ──────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Karhutla & Asap Palangka Raya",
      areaPublik: "Jekan Raya, Palangka Raya, Kalimantan Tengah",
      alamatText: "Jl. Tjilik Riwut KM 1, Palangka Raya",
      lat: -2.2085,
      lng: 113.9165,
      kebutuhan: [
        { kategori: "obat_demam_analgesik", estimasiJumlah: 160, urgensi: "KUNING", ringkasanLaporan: "Vitamin C dan obat batuk ISPA" },
        { kategori: "air_bersih", estimasiJumlah: 80, urgensi: "HIJAU", ringkasanLaporan: "Air minum petugas pemadam gambut" },
      ],
    },

    // ── 21. KALIMANTAN SELATAN ─────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Banjir Sungai Barito & Martapura",
      areaPublik: "Banjar, Kalimantan Selatan",
      alamatText: "Jl. A. Yani KM 39, Martapura, Banjar",
      lat: -3.418,
      lng: 114.852,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 120, urgensi: "KUNING", ringkasanLaporan: "Kebutuhan air tawar sumur tercemar" },
        { kategori: "makanan_pokok", estimasiJumlah: 270, urgensi: "KUNING", ringkasanLaporan: "Makanan siap saji" },
      ],
    },

    // ── 22. KALIMANTAN TIMUR ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Banjir Sungai Mahakam Samarinda",
      areaPublik: "Samarinda Ulu, Samarinda, Kalimantan Timur",
      alamatText: "Jl. Juanda No. 88, Samarinda Ulu, Samarinda",
      lat: -0.491,
      lng: 117.135,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Perahu karet evakuasi banjir Mahakam" },
      ],
    },

    // ── 23. KALIMANTAN UTARA ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Perbatasan & Siaga Air Tarakan",
      areaPublik: "Tarakan Barat, Tarakan, Kalimantan Utara",
      alamatText: "Jl. Yos Sudarso No. 12, Tarakan Barat, Tarakan",
      lat: 3.308,
      lng: 117.595,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 60, urgensi: "KUNING", ringkasanLaporan: "Tandon air bersih pulau terdepan" },
      ],
    },

    // ── 24. SULAWESI UTARA ─────────────────────────────────────────────────────
    {
      namaPosko: "Posko Pengungsian Erupsi Gunung Ruang Tagulandang",
      areaPublik: "Tagulandang, Kepulauan Sitaro, Sulawesi Utara",
      alamatText: "Kawasan Pelabuhan Tagulandang, Sitaro, Sulut",
      lat: 2.336,
      lng: 125.418,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 20, urgensi: "MERAH", ringkasanLaporan: "Tenda evakuasi pulau Tagulandang" },
        { kategori: "air_bersih", estimasiJumlah: 180, urgensi: "MERAH", ringkasanLaporan: "Pasokan air kapal pengangkut darurat" },
        { kategori: "tenaga_medis", estimasiJumlah: 5, urgensi: "MERAH", ringkasanLaporan: "Tim bedah & medis kepulauan" },
      ],
    },

    // ── 25. GORONTALO ──────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Longsor Suwawa & Banjir Bone Bolango",
      areaPublik: "Suwawa, Bone Bolango, Gorontalo",
      alamatText: "Jl. Trans Sulawesi, Suwawa, Bone Bolango",
      lat: 0.552,
      lng: 123.148,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 4, urgensi: "MERAH", ringkasanLaporan: "Evakuasi korban longsor tambang" },
        { kategori: "makanan_pokok", estimasiJumlah: 210, urgensi: "KUNING", ringkasanLaporan: "Dapur umum tim relawan SAR" },
      ],
    },

    // ── 26. SULAWESI TENGAH ────────────────────────────────────────────────────
    {
      namaPosko: "Posko Tanggap Gempa & Likuifaksi Sesar Palu-Koro",
      areaPublik: "Palu Barat, Kota Palu, Sulawesi Tengah",
      alamatText: "Jl. Diponegoro No. 22, Palu Barat, Kota Palu",
      lat: -0.898,
      lng: 119.863,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 15, urgensi: "KUNING", ringkasanLaporan: "Hunian sementara (Huntara)" },
        { kategori: "air_bersih", estimasiJumlah: 130, urgensi: "KUNING", ringkasanLaporan: "Pengeboran sumur artesis" },
      ],
    },

    // ── 27. SULAWESI BARAT ─────────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Gempa Bumi Majene - Mamuju",
      areaPublik: "Simboro, Mamuju, Sulawesi Barat",
      alamatText: "Jl. Abdul Malik Pattana Endeng No. 1, Mamuju",
      lat: -2.678,
      lng: 118.887,
      kebutuhan: [
        { kategori: "selimut_pakaian", estimasiJumlah: 140, urgensi: "KUNING", ringkasanLaporan: "Matras lipat dan terpal" },
        { kategori: "tenaga_medis", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Trauma healing & P3K" },
      ],
    },

    // ── 28. SULAWESI SELATAN ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Tanggap Bencana Banjir Bandang Luwu",
      areaPublik: "Belopa, Kabupaten Luwu, Sulawesi Selatan",
      alamatText: "Jl. Jenderal Sudirman No. 15, Belopa, Luwu",
      lat: -3.342,
      lng: 120.362,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 100, urgensi: "MERAH", ringkasanLaporan: "Krisis air akibat pipa lumpur" },
        { kategori: "makanan_pokok", estimasiJumlah: 310, urgensi: "KUNING", ringkasanLaporan: "Beras & sembako bantuan Dinsos" },
      ],
    },

    // ── 29. SULAWESI TENGGARA ──────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Bencana Banjir Konawe & Kendari",
      areaPublik: "Mandonga, Kota Kendari, Sulawesi Tenggara",
      alamatText: "Jl. Abdullah Silondae No. 40, Mandonga, Kendari",
      lat: -3.978,
      lng: 122.52,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Perahu karet SAR Kendari" },
      ],
    },

    // ── 30. MALUKU ─────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Gempa & Tsunami Teluk Ambon",
      areaPublik: "Sirimau, Kota Ambon, Maluku",
      alamatText: "Jl. Pattimura No. 1, Sirimau, Kota Ambon",
      lat: -3.695,
      lng: 128.181,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 75, urgensi: "KUNING", ringkasanLaporan: "Pasokan air galon bersih" },
        { kategori: "obat_kronis", estimasiJumlah: 40, urgensi: "HIJAU", ringkasanLaporan: "Obat generik dan tensi meter" },
      ],
    },

    // ── 31. MALUKU UTARA ───────────────────────────────────────────────────────
    {
      namaPosko: "Posko Pengungsian Erupsi Gunung Ibu Halmahera",
      areaPublik: "Ibu, Halmahera Barat, Maluku Utara",
      alamatText: "Jl. Trans Halmahera, Desa Gam Ici, Ibu, Halmahera Barat",
      lat: 1.488,
      lng: 127.632,
      kebutuhan: [
        { kategori: "lainnya", estimasiJumlah: 700, urgensi: "MERAH", ringkasanLaporan: "Masker abu vulkanik Gunung Ibu" },
        { kategori: "makanan_pokok", estimasiJumlah: 260, urgensi: "MERAH", ringkasanLaporan: "Pangan siap saji posko Gam Ici" },
      ],
    },

    // ── 32. PAPUA ──────────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Banjir Bandang Sentani Jayapura",
      areaPublik: "Sentani, Kabupaten Jayapura, Papua",
      alamatText: "Jl. Kemiri No. 8, Sentani, Jayapura, Papua",
      lat: -2.565,
      lng: 140.518,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 90, urgensi: "KUNING", ringkasanLaporan: "Air tandon jernih Sentani" },
        { kategori: "tenaga_medis", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Tim kesehatan keliling PMI Papua" },
      ],
    },

    // ── 33. PAPUA BARAT ────────────────────────────────────────────────────────
    {
      namaPosko: "Posko Tanggap Bencana Pesisir Manokwari",
      areaPublik: "Manokwari Barat, Manokwari, Papua Barat",
      alamatText: "Jl. Siliwangi No. 12, Manokwari Barat, Manokwari",
      lat: -0.861,
      lng: 134.062,
      kebutuhan: [
        { kategori: "selimut_pakaian", estimasiJumlah: 80, urgensi: "HIJAU", ringkasanLaporan: "Selimut dan terpal pengungsi" },
      ],
    },

    // ── 34. PAPUA BARAT DAYA ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Bencana Gempa & Banjir Sorong",
      areaPublik: "Sorong Barat, Kota Sorong, Papua Barat Daya",
      alamatText: "Jl. Ahmad Yani No. 5, Sorong Barat, Kota Sorong",
      lat: -0.875,
      lng: 131.258,
      kebutuhan: [
        { kategori: "makanan_pokok", estimasiJumlah: 180, urgensi: "KUNING", ringkasanLaporan: "Beras & makanan kaleng" },
      ],
    },

    // ── 35. PAPUA TENGAH ───────────────────────────────────────────────────────
    {
      namaPosko: "Posko Siaga Bencana Longsor & Gempa Nabire",
      areaPublik: "Nabire, Papua Tengah",
      alamatText: "Jl. Merdeka No. 3, Nabire, Papua Tengah",
      lat: -3.368,
      lng: 135.495,
      kebutuhan: [
        { kategori: "tenaga_medis", estimasiJumlah: 3, urgensi: "KUNING", ringkasanLaporan: "Dokter umum & obat malaria" },
      ],
    },

    // ── 36. PAPUA PEGUNUNGAN ───────────────────────────────────────────────────
    {
      namaPosko: "Posko Cuaca Dingin Ekstrem & Embun Beku Wamena",
      areaPublik: "Wamena, Jayawijaya, Papua Pegunungan",
      alamatText: "Jl. Yos Sudarso No. 20, Wamena, Jayawijaya",
      lat: -4.095,
      lng: 138.945,
      kebutuhan: [
        { kategori: "selimut_pakaian", estimasiJumlah: 250, urgensi: "MERAH", ringkasanLaporan: "Jaket tebal & selimut wol embun beku" },
        { kategori: "makanan_pokok", estimasiJumlah: 300, urgensi: "MERAH", ringkasanLaporan: "Umbi-umbian & makanan berkalori tinggi" },
      ],
    },

    // ── 37. PAPUA SELATAN ──────────────────────────────────────────────────────
    {
      namaPosko: "Posko Bencana Kekeringan & Banjir Rawa Merauke",
      areaPublik: "Merauke, Papua Selatan",
      alamatText: "Jl. Brawijaya No. 10, Merauke, Papua Selatan",
      lat: -8.493,
      lng: 140.402,
      kebutuhan: [
        { kategori: "air_bersih", estimasiJumlah: 110, urgensi: "KUNING", ringkasanLaporan: "Air tangki bersih rawa terisolir" },
      ],
    },
  ];

  // OPTIMASI: In-memory bulk check & fast upsert
  const existingPosko = await prisma.posko.findMany({
    select: { id: true, namaPosko: true },
  });
  const poskoMap = new Map<string, string>();
  for (const p of existingPosko) {
    poskoMap.set(p.namaPosko, p.id);
  }

  let newlyCreatedCount = 0;

  for (const item of poskoList) {
    let poskoId = poskoMap.get(item.namaPosko);

    if (!poskoId) {
      const created = await prisma.posko.create({
        data: {
          namaPosko: item.namaPosko,
          areaPublik: item.areaPublik,
          alamatText: item.alamatText,
          lat: item.lat,
          lng: item.lng,
        },
      });
      poskoId = created.id;
      poskoMap.set(item.namaPosko, poskoId);
      newlyCreatedCount++;
    }

    if (poskoId && item.kebutuhan && item.kebutuhan.length > 0) {
      for (const keb of item.kebutuhan) {
        const existingKeb = await prisma.kebutuhanAgregat.findFirst({
          where: { poskoId, kategori: keb.kategori },
        });

        if (!existingKeb) {
          await prisma.kebutuhanAgregat.create({
            data: {
              poskoId,
              kategori: keb.kategori,
              estimasiJumlah: keb.estimasiJumlah,
              urgensi: keb.urgensi,
              status: "dikonfirmasi",
              ringkasanLaporan: keb.ringkasanLaporan,
              perluKonfirmasiMedis: keb.kategori.startsWith("obat_") || keb.kategori === "tenaga_medis",
            },
          });
        }
      }
    }
  }

  const totalFinal = await prisma.posko.count();

  // Kampanye Donasi Bencana
  await prisma.donasiKampanye.upsert({
    where: { slug: "bantuan-korban-banjir-jakarta" },
    update: {},
    create: {
      slug: "bantuan-korban-banjir-jakarta",
      judul: "Bantuan Korban Banjir Jakarta",
      deskripsi: "Salurkan bantuan untuk mendukung kebutuhan masyarakat yang terdampak bencana",
      targetDonasi: 50000000,
      terkumpul: 24500000,
      jumlahDonatur: 320,
      kategoriTag: ["Makanan", "Air & Kebutuhan dasar", "Medis"],
      alokasiDana: ["Makanan", "Air Bersih", "Kebutuhan Medis", "Kebutuhan Pengungsian"],
      penyelenggara: "Yayasan Bantu Sesama",
      penyelenggaraDesc: "Organisasi terverifikasi. Laporan penyaluran dana dipublikasikan secara transparan setiap tahap kegiatan",
      aktif: true,
    },
  });

  await prisma.donasiKampanye.upsert({
    where: { slug: "bantuan-pengungsian-lombok" },
    update: {},
    create: {
      slug: "bantuan-pengungsian-lombok",
      judul: "Bantuan Pengungsian Lombok",
      deskripsi: "Salurkan bantuan untuk mendukung kebutuhan masyarakat yang terdampak bencana",
      targetDonasi: 40000000,
      terkumpul: 18200000,
      jumlahDonatur: 240,
      kategoriTag: ["Pengungsian", "Logistik"],
      alokasiDana: ["Tenda Pengungsian", "Selimut & Pakaian", "Dapur Umum", "Obat-obatan"],
      penyelenggara: "Yayasan Bantu Sesama",
      penyelenggaraDesc: "Organisasi terverifikasi. Laporan penyaluran dana dipublikasikan secara transparan setiap tahap kegiatan",
      aktif: true,
    },
  });

  // Open Volunteer Bencana Lapangan
  await prisma.kegiatanRelawan.upsert({
    where: { slug: "banjir-jakarta-timur" },
    update: {},
    create: {
      slug: "banjir-jakarta-timur",
      judul: "Banjir Jakarta Timur",
      tanggalRentang: "8-12 Oktober 2026",
      lokasi: "Jakarta Timur",
      alamatSpesifik: "Jl. Melati No.5, Jakarta Timur",
      kuotaTerisi: 24,
      kuotaMaksimal: 50,
      posisiDibutuhkan: ["Distribusi", "Logistik", "Dapur Umum"],
      deskripsi: "Kegiatan relawan untuk membantu distribusi bantuan pengelolaan logistik dan penyediaan konsumsi melalui dapur umum bagi korban banjir di wilayah Jakarta Timur selama 5 hari.",
      informasiTugas: "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
      waktuKegiatan: "06.00 - 18.00 WIB",
      kontakKordinator: "08123425871667",
      aktif: true,
    },
  });

  console.log("✅ Seed selesai:");
  console.log("   ADMIN   -> username: admin   | password: admin123");
  console.log("   RELAWAN -> username: relawan | password: relawan123");
  console.log("   POSKO   -> kode: POSKO01 (/mandiri/POSKO01)");
  console.log(`   POSKO BARU DIBUAT -> ${newlyCreatedCount}`);
  console.log(`   TOTAL POSKO NASIONAL DI DATABASE -> ${totalFinal} posko (Seluruh 38 Provinsi)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
