<div align="center">
  
  # SIGAP AI 
  ### Faster Response, Smarter Rescue
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-success?style=for-the-badge)](https://sigap-ai-two.vercel.app/)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/faith-prog/SigapAI)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
  
  **Submission for ITECHNO CUP 2026 - Web Development**
  
  **By Walau Hebat**
  
</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Unggulan](#fitur-unggulan)
- [Demo & Screenshot](#demo--screenshot)
- [Teknologi](#teknologi)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Penggunaan](#penggunaan)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Tim Developer](#tim-developer)
- [Lisensi](#lisensi)

---

## Tim Developer

| Nama | Peran | GitHub |
|------|-------|--------|
| **Faith Irhab Nabil** | Ketua Tim, Full Stack Developer & AI Engineer | [@faith-prog](https://github.com/faith-prog) |
| **Daffa Aditya Pratama** | Full Stack Developer, AI Researcher & Engineer | [@daffa-aditya-p](https://github.com/daffa-aditya-p) |
| **Muhammad Rasya Wantoro** | UI/UX Specialist & Frontend Developer | [@rasyawantoro](https://github.com/rasyawantoro) |

---

## Tentang Proyek

### Latar Belakang

Indonesia merupakan salah satu negara dengan tingkat risiko bencana yang tinggi. Berdasarkan data Badan Nasional Penanggulangan Bencana (BNPB), sepanjang tahun 2024 tercatat 3.472 kejadian bencana yang menyebabkan 540 orang meninggal dunia, 63 orang hilang, 11.531 orang luka-luka atau sakit, serta lebih dari 8,1 juta orang menderita dan mengungsi. Banyaknya korban dalam situasi bencana menjadi tantangan bagi relawan dan petugas dalam melakukan pendataan, mengidentifikasi kondisi korban, serta menentukan prioritas pertolongan secara cepat dan tepat.

Dalam kondisi mass casualty, jumlah korban dapat melebihi kapasitas tenaga medis dan fasilitas yang tersedia. WHO menjelaskan bahwa proses triage diperlukan untuk menentukan prioritas penanganan berdasarkan tingkat kegawatan korban, seperti kategori Merah, Kuning, dan Hijau. Namun, proses pendataan dan pengelolaan informasi di lapangan dapat menjadi kompleks ketika jumlah korban terus bertambah, terutama ketika data harus diperbarui, diverifikasi, dan dikoordinasikan antarposko. Kondisi tersebut dapat menyebabkan proses identifikasi korban prioritas menjadi kurang efisien dan meningkatkan beban kerja petugas.

Berdasarkan permasalahan tersebut, SIGAP AI (Sistem Manajemen & Triage Pengungsi) dikembangkan sebagai solusi berbasis kecerdasan buatan untuk membantu PMI dan relawan dalam mengelola data korban serta menentukan prioritas penanganan secara lebih terstruktur. Sistem ini memanfaatkan AI untuk membantu menganalisis kondisi dan kerentanan korban, dilengkapi Digital Check-In dengan QR Code, AI Assistant, pemantauan rujukan medis, pemetaan posko, dan Lapor Cepat. SIGAP AI diharapkan dapat mempercepat proses pendataan dan respons, membantu petugas memprioritaskan korban yang membutuhkan pertolongan segera, serta meningkatkan koordinasi dan efisiensi penanganan bencana.

### Solusi yang Ditawarkan

SIGAP AI menawarkan solusi digital terintegrasi untuk membantu PMI dan relawan dalam mempercepat proses pendataan, identifikasi, serta penetapan prioritas korban bencana. Sistem memanfaatkan Artificial Intelligence (AI) untuk menganalisis data kondisi medis dan tingkat kerentanan korban, kemudian membantu mengelompokkan korban berdasarkan prioritas triage Merah, Kuning, dan Hijau. Dengan pendekatan ini, data yang sebelumnya membutuhkan proses pemeriksaan dan pengolahan secara manual dapat diubah menjadi informasi prioritas yang lebih terstruktur sehingga petugas dapat lebih cepat menentukan korban yang membutuhkan perhatian.

Keunikan SIGAP AI terletak pada integrasi beberapa proses penanganan korban dalam satu sistem:
1. **Digital Check-In & QR Code**: Data korban dicatat dan diverifikasi secara praktis saat memasuki posko dengan validasi kriptografi HMAC-SHA256.
2. **AI Assistant & Voice Intake**: Membantu meringkas, mentranskrip ucapan, dan menganalisis laporan catatan wawancara lapangan secara instan.
3. **Lapor Cepat & Mandiri**: Memungkinkan korban maupun relawan menyampaikan kondisi lapangan secara langsung dengan pembatasan geofencing anti-spam.
4. **Pemetaan Posko & Monitoring Rujukan**: Informasi mengenai kondisi korban, kapasitas posko, dan proses rujukan lintas-faskes dipantau terstruktur melalui peta GIS real-time.

> **Catatan Etika AI:** SIGAP AI tidak dirancang untuk menggantikan keputusan tenaga medis, melainkan sebagai Decision-Support System yang membantu petugas memperoleh informasi awal secara cepat dan akurat.

### Tujuan Proyek

- **Tujuan Utama**: Mengembangkan sistem berbasis AI yang membantu PMI dan relawan dalam pendataan, klasifikasi triage, pemantauan korban, dan koordinasi penanganan bencana secara cepat, terstruktur, dan terintegrasi.
- **Target Pengguna**: PMI, relawan kemanusiaan, tenaga medis darurat, koordinator posko bencana, serta korban atau pengungsi yang membutuhkan penanganan.
- **Value Proposition**: SIGAP AI mengintegrasikan AI Medical Triage, Digital Check-In berbasis QR Code, AI Assistant, pemantauan rujukan, pemetaan posko, dan Lapor Cepat dalam satu ekosistem offline-first. Keunggulannya adalah kemampuan mengubah data mentah korban menjadi informasi prioritas tindakan medis yang terstruktur, cepat, dan dapat diandalkan bahkan tanpa sinyal internet.

---

## Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |
|-------|-----------|------------|
| **AI Triage & Deterministic Scoring** | Ekstraksi otomatis catatan wawancara bebas via LLM (Gemini 2.5 & Groq Qwen) + GLiNER, dilanjutkan kalkulasi skor kerentanan deterministik berstandar Sphere Project & IFRC. | Memisahkan ekstraksi NLP dari kalkulasi skor, menjamin skor 100% konsisten, adil, transparan (explainable AI), dan tidak berhalusinasi. |
| **Digital Check-In & Secure QR** | Portal Lapor Mandiri bagi korban untuk mengisi data awal posko, menghasilkan QR Code terenkripsi tanda tangan digital HMAC-SHA256 dengan masa kedaluwarsa 24 jam. | Mencegah antrean panjang di gerbang posko, kebal manipulasi data (anti-tampering), dan memvalidasi radius posko via geofencing. |
| **Offline-First PWA & Auto-Sync** | Kemampuan operasional penuh saat jaringan seluler terputus total menggunakan Progressive Web App (PWA), Service Worker, dan IndexedDB lokal. | Relawan tetap dapat melakukan intake data di lokasi bencana terisolasi; data otomatis tersinkronisasi saat sinyal pulih tanpa risiko duplikasi. |
| **Peta Kebutuhan Posko & GIS 3-Layer** | Visualisasi spasial interaktif berbasis Leaflet & OpenStreetMap dengan kontrol privasi 3 lapis (Publik, Instansi Terverifikasi, dan Admin Posko). | Memetakan titik posko, agregat logistik darurat, dan persebaran korban rentan secara real-time untuk mempercepat penyaluran bantuan BNPB/PMI. |

### Fitur Tambahan

- **Speech-to-Text Voice Intake** - Input data pengungsi secara hands-free di lapangan memanfaatkan Web Speech API untuk mempercepat wawancara lansia dan korban trauma.
- **Multi-Family Batch Extraction** - Menganalisis catatan tertulis panjang yang berisi beberapa kepala keluarga sekaligus dalam satu kali pemrosesan teks cerdas.
- **Ekspor Dokumen Standar Dinkes (Excel & CSV)** - Menghasilkan laporan triase terformat lengkap dengan formula sanitasi pencegah CSV Injection untuk serah terima ke Dinas Kesehatan.
- **Audio & Visual Alert Kasus Merah** - Sistem notifikasi suara darurat otomatis di dashboard koordinator saat korban berstatus kritis (Level Merah) tercatat di posko.
- **Audit Trail Imutabel** - Setiap perubahan status rujukan, verifikasi medis, atau penyuntingan profil tercatat detail bersama identitas operator dan riwayat log.

---

## Demo & Screenshot

### Live Demo

[Kunjungi Aplikasi SIGAP AI](https://sigap-ai-two.vercel.app/)

### Screenshot Aplikasi

<div align="center">
  <img src="public/Berita Images/image (3).png" alt="Landing Page SIGAP AI" width="800"/>
  <p><em>Landing Page - Halaman depan informatif dengan integrasi berita & panduan bencana</em></p>
  
  <img src="public/Berita Images/image (4).png" alt="Dashboard Triase Koordinator" width="800"/>
  <p><em>Dashboard Triase - Monitoring sebaran korban Merah, Kuning, Hijau & verifikasi medis</em></p>
  
  <img src="public/Berita Images/image (5).png" alt="Intake & Lapor Cepat AI" width="800"/>
  <p><em>Intake Relawan - Ekstraksi otomatis catatan wawancara pengungsi bertenaga AI</em></p>
</div>

---

## Teknologi

### Tech Stack

#### Frontend
```text
Framework    : Next.js 15 (App Router, React 19)
Styling      : Tailwind CSS v3 & Modern CSS Variables
Icons & UI   : Lucide React & Tailwind Utilities
Mapping/GIS  : Leaflet & Leaflet.markercluster
Charts       : Recharts (Visualisasi Statistik Kerentanan)
Data Fetching: SWR (Stale-While-Revalidate Real-time Polling)
PWA & Client : Service Worker API & IndexedDB (idb wrapper)
```

#### Backend
```text
Runtime      : Node.js v20+ LTS
Framework    : Next.js Server Actions & Route Handlers
Database     : PostgreSQL (Supabase Cloud Database)
ORM          : Prisma ORM v6 (Connection Pooling & Type-Safe Queries)
Auth         : NextAuth.js v5 (Auth.js Beta) with bcryptjs
Security     : Node.js Crypto (Timing-Safe HMAC-SHA256) & Zod Validation
Export Engine: ExcelJS & Sanitized CSV Stream Exporter
```

#### AI & Natural Language Processing
```text
Primary LLM  : Google Gemini 2.5 Flash / 2.0 Flash Lite (Google AI Studio)
Fallback LLM : Groq Qwen-2.5-32b-IT (High-Speed Inference)
NER Engine   : GLiNER (Generalist and Lightweight Named Entity Recognition)
Rule Engine  : Deterministic Vulnerability Algorithm (Sphere Project / IFRC Guidelines)
NLP Helpers  : Levenshtein Distance Typo Tolerant (Fuzzy Slang Dictionary Indonesia)
```

### Alasan Pemilihan Teknologi

| Teknologi | Alasan Pemilihan |
|-----------|------------------|
| **Artificial Intelligence (AI)** | Dipilih untuk membantu menganalisis data korban dan memberikan rekomendasi awal terkait tingkat kerentanan serta prioritas triage secara cepat. AI dapat membantu petugas mengolah banyak data dalam waktu singkat sehingga proses penentuan prioritas menjadi lebih efisien. |
| **Machine Learning (ML) & GLiNER** | Digunakan sebagai teknologi pendukung dalam proses ekstraksi entitas bernama (NER) dan klasifikasi berdasarkan parameter medis, usia, serta kondisi kerentanan korban. ML mengenali pola bahasa alami penutur Indonesia sehingga menghasilkan data terstruktur. |
| **Generative AI / Multi-LLM Fallback** | Mengombinasikan Google Gemini dan Groq Qwen untuk ketahanan sistem tinggi. Jika kuota atau jaringan salah satu provider terhambat, sistem secara otomatis beralih dalam hitungan milidetik tanpa interupsi pengguna. |
| **QR Code & Digital Check-In** | Dipilih karena mudah digunakan, cepat dipindai lewat kamera smartphone, dan memangkas waktu pendaftaran manual korban di posko penampungan darurat. |
| **HMAC-SHA256 Signatures** | Digunakan untuk meningkatkan keamanan data pada QR Code dengan memastikan payload tidak dapat dipalsukan, ditiru, atau diubah parameternya oleh pihak tidak bertanggung jawab. |
| **PostgreSQL & Prisma ORM** | Menyimpan dan mengelola data relasional korban, posko, log audit, dan kebutuhan logistik secara terpusat dengan integritas skema ketat serta performa query tinggi. |
| **Progressive Web App (PWA)** | Memungkinkan aplikasi berjalan secara offline di area bencana tanpa sinyal internet, menginstal aplikasi layaknya native app, dan menyinkronkan data antrean saat jaringan pulih. |
| **Digital Mapping / GIS (Leaflet)** | Memvisualisasikan lokasi posko, perimeter keamanan radius, serta kebutuhan mendesak di lapangan untuk mendukung koordinasi cepat relawan PMI dan instansi terkait. |

### Dependencies Utama

```json
{
  "dependencies": {
    "next": "15.3.9",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "@prisma/client": "^6.10.1",
    "next-auth": "5.0.0-beta.29",
    "zod": "^3.25.67",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.21.0",
    "exceljs": "^4.4.0",
    "qrcode": "^1.5.4",
    "swr": "^2.3.3",
    "bcryptjs": "^3.0.2"
  }
}
```

---

## Arsitektur Sistem

### System Architecture

```mermaid
flowchart TD
    subgraph Klien["Lapisan Pengguna & Perangkat Lapangan"]
        A1["Relawan Lapangan (PWA / Mobile / Laptop)"]
        A2["Korban Bencana (Self Check-In QR)"]
        A3["Koordinator & Tenaga Medis (Admin Panel)"]
    end

    subgraph OfflineLayer["Subsistem Offline-First PWA"]
        SW["Service Worker (sw.js)"]
        IDB[("IndexedDB: sigap-offline")]
        SyncClient["SyncClient (Background Sync API)"]
    end

    subgraph Server["Next.js 15 Serverless Platform"]
        AppRouter["Next.js App Router & Middleware RBAC"]
        AuthModule["NextAuth v5 + Timing-Safe HMAC"]
        ScoringEngine["Deterministic Triage Scoring Engine (Sphere)"]
        ExportModule["ExcelJS & CSV Sanitized Generator"]
    end

    subgraph AICloud["Pipeline Kecerdasan Buatan (Hybrid AI)"]
        Gemini["Primary: Google Gemini 2.5 Flash"]
        Groq["Fallback: Groq Qwen-2.5-32b"]
        GLiNER["HF Space: GLiNER Entity Extraction"]
    end

    subgraph Database["Lapisan Data Terdistribusi"]
        PrismaORM["Prisma ORM Client v6"]
        SupabaseDB[("PostgreSQL Database (Supabase)")]
    end

    A1 -->|Online / Offline| SW
    A2 -->|Lapor Mandiri| AppRouter
    A3 -->|Triage & Audit| AppRouter

    SW -->|Network Down| IDB
    IDB -->|Network Restored| SyncClient
    SyncClient -->|Auto-Sync Payload| AppRouter

    AppRouter --> AuthModule
    AppRouter --> ScoringEngine
    AppRouter --> ExportModule

    AppRouter <-->|Ekstraksi Teks Bebas| AICloud
    AppRouter <--> PrismaORM
    PrismaORM <--> SupabaseDB
```

### Database Schema (ERD)

```mermaid
erDiagram
    User ||--o{ Kasus : "mencatat"
    User ||--o{ AuditLog : "melakukan aksi"
    PoskoConfig ||--o{ Kasus : "menampung"
    
    User {
        string id PK
        string username UK
        string passwordHash
        enum role "ADMIN | RELAWAN"
        datetime createdAt
    }

    Kasus {
        string id PK
        string kodeUnik UK
        string namaKepalaKeluarga
        string nomorKontak
        int jumlahAnggota
        json anggotaKeluarga
        json kondisiMedisKritis
        boolean butuhTendaKhusus
        boolean obatHabis
        int skorKerentanan
        enum levelPrioritas "HIJAU | KUNING | MERAH"
        boolean perluVerifikasiMedis
        boolean sudahDiverifikasi
        string instansiRujukan
        string catatanRelawan
        string kodePosko FK
        string createdById FK
        json provenance
        datetime createdAt
    }

    PoskoConfig {
        string id PK
        string kodePosko UK
        string nama
        float lat
        float lng
        int radiusMeter
    }

    AuditLog {
        string id PK
        string aksi
        string userId FK
        json detail
        datetime createdAt
    }
```

### Folder Structure

```text
Pembangunan-Jaya-KA-AI-/
├── public/                  # Aset statis, Service Worker, & Web Manifest
│   ├── sw.js                # Service Worker PWA (Offline Caching & Background Sync)
│   ├── manifest.json        # PWA Installable Configuration
│   └── Berita Images/       # Dokumentasi & aset gambar portal publik
├── src/
│   ├── app/                 # Next.js 15 App Router Architecture
│   │   ├── (admin)/         # Rute Khusus Admin/Koordinator (Triase, Rujukan, Audit)
│   │   ├── (relawan)/       # Rute Relawan (Intake Kasus AI & Offline Queue)
│   │   ├── actions/         # Next.js Server Actions (CRUD, Auth, Verifikasi Medis)
│   │   ├── api/             # API Route Handlers (AI Extraction, Sync, Peta, QR)
│   │   ├── mandiri/         # Portal Lapor Mandiri Korban & Generator QR
│   │   ├── peta/            # Peta Interaktif 3-Layer Privasi (Publik & Instansi)
│   │   ├── layout.tsx       # Root Layout & OfflineBanner Provider
│   │   └── page.tsx         # Modern Responsive Landing Page
│   ├── components/          # Reusable UI & Client Components
│   │   ├── admin/           # Komponen Tabel Triase, Modal Edit, & Filter Prioritas
│   │   ├── peta/            # Komponen Peta Leaflet & Marker Cluster Dynamic SSR
│   │   ├── AppHeader.tsx    # Header Navigasi Dinamis Berbasis Sesi
│   │   └── OfflineBanner.tsx# Indikator Real-time Status Jaringan & Auto-Sync
│   ├── lib/                 # Core Libraries & Domain Logic
│   │   ├── gemini.ts        # Pipeline AI Multi-Provider (Gemini + Groq Fallback)
│   │   ├── scoring.ts       # Deterministic Triage Scoring Engine (Sphere Standard)
│   │   ├── synonyms.ts      # Kamus Slang Medis Indonesia & Levenshtein Distance
│   │   ├── idb.ts           # IndexedDB Storage Adapter untuk Antrian Offline
│   │   ├── qr.ts            # Enkripsi & Validasi Timing-Safe HMAC-SHA256
│   │   ├── xlsx.ts          # Generator Laporan Excel Resmi Format Dinkes
│   │   └── prisma.ts        # Singleton Prisma Client Connection
│   └── __tests__/           # Automated Test Suite (18 Unit & Integration Tests)
├── prisma/
│   ├── schema.prisma        # Skema Relasional PostgreSQL
│   └── seed.ts              # Data Awal Akun Pengujian (Admin & Relawan)
├── start.bat                # Launcher 1-Click Otomatis untuk Pengujian Juri (Windows)
├── stop.bat                 # Penghenti Server Graceful (Windows)
├── start.sh                 # Launcher Otomatis (Linux / macOS / WSL)
├── stop.sh                  # Penghenti Server (Linux / macOS / WSL)
└── package.json             # Konfigurasi Dependensi & Skrip
```

---

## Instalasi & Setup

### Prerequisites

Pastikan perangkat Anda telah memiliki:
- Node.js (v18.18 atau v20+ LTS direkomendasikan)
- Git
- Web Browser Modern (Google Chrome, Microsoft Edge, atau Mozilla Firefox)

---

### Cara Praktis (Untuk Juri & Evaluator):

Kami telah menyediakan One-Click Script yang mengotomatisasi seluruh proses (pengecekan runtime, dependensi, database, hingga peluncuran browser):

- **Pengguna Windows**:
  Cukup klik ganda file:
  ```cmd
  start.bat
  ```
  *(Untuk mematikan server secara bersih setelah pengujian, klik ganda `stop.bat`)*

- **Pengguna Linux / macOS / WSL**:
  ```bash
  chmod +x start.sh stop.sh
  ./start.sh
  ```

---

### Cara Manual (Step-by-Step):

#### 1. Clone Repository

```bash
git clone https://github.com/faith-prog/SigapAI.git
cd SigapAI
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Setup Environment Variables

Salin file template `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Pastikan variabel utama terisi (koneksi database Supabase cloud sudah siap pakai):
```env
DATABASE_URL="postgresql://postgres.ltewpmohitpzsndzeocq:bismillahsig4pmenan9@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ltewpmohitpzsndzeocq:bismillahsig4pmenan9@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
GEMINI_API_KEY="your-gemini-api-key"
AUTH_SECRET="your-32-byte-random-secret"
```

#### 4. Generate Prisma Client & Database

```bash
npm run prisma:generate
```

#### 5. Jalankan Server Aplikasi

```bash
npm run dev
```

Buka peramban Anda di **`http://localhost:3000`**.

---

## Penggunaan

### Akun Pengujian Juri (Pre-Configured)

| Role | Username | Password | Akses & Kewenangan |
|------|----------|----------|--------------------|
| **KOORDINATOR / ADMIN** | `admin` | `admin123` | Akses Dashboard Triase, Verifikasi Medis Kasus Merah, Scanner QR Check-In, Ekspor Excel/CSV, Kelola Posko & Log Audit. |
| **RELAWAN LAPANGAN** | `relawan` | `relawan123` | Akses Form Intake Wawancara AI (Single & Multi-KK), Mode Offline PWA, Auto-Sync lokal ke cloud. |

### Panduan Alur Penggunaan

#### 1. Untuk Pengungsi / Korban (Self Check-In)
1. Kunjungi rute mandiri posko: `http://localhost:3000/mandiri/POSKO01`
2. Isi data kepala keluarga, anggota keluarga, serta keluhan medis darurat.
3. Klik **Kirim Laporan** -> Sistem akan memvalidasi geofencing lokasi dan menerbitkan **Digital Pass QR Code**.
4. Simpan QR Code untuk ditunjukkan kepada relawan di posko penampungan.

#### 2. Untuk Relawan Lapangan (Wawancara & Intake)
1. Masuk ke halaman login `http://localhost:3000/login` dengan akun relawan.
2. Buka menu **Intake Kasus** (`/intake`).
3. Rekam suara pengungsi (Voice Intake) atau ketik catatan bebas hasil wawancara di lapangan.
4. Klik **Analisis Catatan** -> AI secara instan mengekstrak profil keluarga, balita, lansia, dan penyakit kritis.
5. Konfirmasi dan simpan data. *(Jika sedang tidak ada sinyal internet, data otomatis aman tersimpan di antrean IndexedDB dan tersinkronisasi saat online kembali)*.

#### 3. Untuk Koordinator Medis (Triase & Rujukan)
1. Masuk dengan akun admin di `http://localhost:3000/admin`.
2. Pantau daftar triase: Kasus **Merah** (Gawat Darurat), **Kuning** (Perlu Pengawasan), dan **Hijau** (Stabil).
3. Lakukan verifikasi medis pada korban kritis dan tentukan faskes rujukan (RSUD / Puskesmas / Dinkes).
4. Klik tombol **Export Excel / CSV** untuk menghasilkan dokumen rekapitulasi resmi bagi pos komando pusat.

---

## API Documentation

### Base URL

```text
Development : http://localhost:3000/api
Production  : https://sigap-ai-two.vercel.app/api
```

### Endpoints Utama

#### 1. AI Extraction Pipeline
```http
POST /api/agent/extract
Content-Type: application/json

{
  "teks": "Ibu Siti umur 62 tahun ada diabetes dan hipertensi, bawa cucu bayi 8 bulan demam tinggi obat habis"
}
```
*Response*: Mengembalikan profil JSON terstruktur hasil ekstraksi NLP beserta rekomendasi prioritas triase.

#### 2. Offline Synchronization
```http
POST /api/offline/sync
Content-Type: application/json

[
  {
    "clientSyncId": "uuid-v4",
    "namaKepalaKeluarga": "Budi Santoso",
    "levelPrioritas": "KUNING",
    ...
  }
]
```
*Response*: Menyimpan antrean intake lokal ke PostgreSQL secara batch dengan jaminan idempotensi anti-duplikasi.

#### 3. QR Code Verification & Import
```http
POST /api/qr/import
Content-Type: application/json

{
  "qrPayload": "..."
}
```
*Response*: Memvalidasi tanda tangan HMAC-SHA256, memeriksa masa kedaluwarsa 24 jam, dan mengimpor data pengungsi ke sistem posko.

#### 4. Peta & Spasial
- `GET /api/peta/publik` - Mengambil titik posko dan agregat kebutuhan logistik (lapisan publik tersanitasi).
- `GET /api/peta/posko` - Mengambil detail koordinat GPS lengkap bagi instansi terverifikasi.

#### 5. Ekspor Laporan
- `GET /api/rujukan/dinkes/xlsx` - Mengunduh dokumen spreadsheet Excel terformat resmi Dinkes.
- `GET /api/rujukan/dinkes/csv` - Mengunduh file CSV dengan sanitasi formula injection.

---

## Testing

SIGAP AI dilengkapi dengan rangkaian pengujian otomatis (Automated Verification Suite) mencakup validasi matematika scoring, keamanan kriptografi, hingga uji beban profil sintetis:

```bash
# Menjalankan seluruh test suite otomatis
npm test

# Menjalankan test runner Vitest
npm run test:vitest
```

### Ringkasan Hasil Pengujian

```text
=======================================================
  SIGAP AI — Automated Quality & Verification Suite
=======================================================

[1] Deterministic Vulnerability Scoring Engine
  ✔ Dewasa muda mandiri tanpa keluhan -> Skor 0 (HIJAU)
  ✔ KK Lansia >= 60 tahun -> Tambah +2 poin
  ✔ Ada balita < 1 tahun -> Tambah +3 poin
  ✔ 2 Kondisi kritis (+6) + Obat habis (+4) -> Skor 10 (MERAH + Verifikasi Medis)
  ✔ Level cutoff: 0-4 HIJAU, 5-8 KUNING, >=9 MERAH

[2] QR Code Security, Timing-Safe HMAC & Expiry
  ✔ Generate & verifikasi valid QR Payload
  ✔ Deteksi manipulasi data / signature forgery (Tolak QR Palsu)
  ✔ Tolak QR Code kedaluwarsa (> 24 jam)

[3] Indonesian Medical Slang & Regional Dialects
  ✔ Normalisasi istilah awam (gula, tensi, bengek, ayan)
  ✔ Normalisasi dialek daerah (Sunda, Minang)
  ✔ Fuzzy matching typo toleran (Levenshtein <= 2)

[4] Zod Schema Validation & Extraction Types
  ✔ Validasi single extraction schema & toProfil() conversion
  ✔ Validasi multi-keluarga batch extraction schema
  ✔ Validasi konfirmasiSchema dengan clientSyncId untuk idempotensi

[5] 200 Indonesian Disaster Refugee Synthetic Profiles Benchmark
  ✔ Evaluasi 200 profil sintetis: 100% konsisten terhadap rule engine
  ✔ Distribusi kerentanan realistis (50% Hijau, 40% Kuning, 10% Merah)
  ✔ 100% kasus Merah wajib teridentifikasi butuh verifikasi medis

=======================================================
  Test Results: 18 Passed | 0 Failed | Total: 18 (100% Green)
=======================================================
```

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Bebas digunakan, dikembangkan, dan dimanfaatkan untuk misi kemanusiaan dan penanggulangan bencana di seluruh Indonesia.

---

<div align="center">

  **Made by Walau Hebat for ITECHNO CUP 2026**

</div>
