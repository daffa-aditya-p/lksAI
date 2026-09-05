import fs from "fs";
import path from "path";
import { hitungSkor } from "../lib/scoring";
import type { ProfilKerentanan } from "../lib/types";

interface SkenarioKasus {
  id: string;
  skenario: string;
  dialek: "Standar" | "Jawa" | "Sunda" | "Betawi" | "Minang" | "Batak" | "Melayu" | "Indonesia Timur";
  teksWawancara: string;
  profil: ProfilKerentanan;
}

const NAMA_DEPAN = [
  "Budi", "Siti", "Agus", "Sri", "Eko", "Dewi", "Bambang", "Rina", "Wayan", "Made",
  "Ahmad", "Fatimah", "Umar", "Nur", "Hendra", "Ratna", "Joko", "Yanti", "Supri", "Endang",
  "Ujang", "Asep", "Cecep", "Neneng", "Dadang", "Eneng", "Kokom", "Teten", "Iis", "Yayan",
  "Ucok", "Butet", "Poltak", "Tigor", "Saut", "Boni", "Hotman", "Tiur", "Rambe", "Pangaribuan",
  "Buyung", "Upik", "Chaniago", "Sutan", "Rizal", "Amir", "Syamsul", "Marwan", "Efrina", "Zulfa"
];

const NAMA_BELAKANG = [
  "Santoso", "Wijaya", "Kusuma", "Pratama", "Hidayat", "Saputra", "Wibowo", "Setiawan", "Utomo", "Permana",
  "Suryadi", "Nugroho", "Gunawan", "Handayani", "Susanti", "Puspitasari", "Astuti", "Lestari", "Mulyani", "Rahayu",
  "Siregar", "Nasution", "Harahap", "Lubis", "Batubara", "Tanjung", "Pasaribu", "Hutapea", "Simanjuntak", "Situmorang",
  "Caniago", "Koto", "Piliang", "Sikumbang", "Gusti", "Kadek", "Nyoman", "Ketut", "Oktavianus", "Wonda"
];

const DESA_LIST = [
  "Desa Sukamaju, RT 02/RW 04", "Kampung Melayu Bawah, RW 07", "Dusun Krajan, RT 05",
  "Kelurahan Cibadak Hilir", "Desa Wanasari RT 01", "Dusun Talang Rawa", "Kampung Nelayan Blok C",
  "Desa Tanjung Harapan", "Kelurahan Baleendah RT 03", "Dusun Sumber Makmur"
];

function generate200Profiles() {
  const profiles: Array<SkenarioKasus & { expectedSkor: number; expectedLevel: "HIJAU" | "KUNING" | "MERAH" }> = [];

  let idCounter = 1;

  function addProfile(
    dialek: SkenarioKasus["dialek"],
    skenario: string,
    teksWawancara: string,
    profilData: Omit<ProfilKerentanan, "agentThought">
  ) {
    const id = `SYN-${String(idCounter++).padStart(3, "0")}`;
    const profil: ProfilKerentanan = {
      ...profilData,
      agentThought: `Simulasi profil sintetis kebencanaan ${id}: ${skenario}`,
    };
    const skorInfo = hitungSkor(profil);
    profiles.push({
      id,
      skenario,
      dialek,
      teksWawancara,
      profil,
      expectedSkor: skorInfo.skor,
      expectedLevel: skorInfo.level,
    });
  }

  // =========================================================================
  // 1. TIER HIJAU (Skor 0 - 4): 80 Kasus (40%)
  // Mandiri / Dewasa muda / Keluarga sehat / Sakit ringan obat tersedia
  // =========================================================================
  for (let i = 1; i <= 80; i++) {
    const nama = `${NAMA_DEPAN[(i * 3) % NAMA_DEPAN.length]} ${NAMA_BELAKANG[(i * 7) % NAMA_BELAKANG.length]}`;
    const desa = DESA_LIST[i % DESA_LIST.length];
    const usia = 22 + (i % 35); // 22 - 56 tahun (BUKAN lansia < 60)

    if (i <= 20) {
      // Single / Dewasa mandiri tanpa tanggungan
      addProfile(
        "Standar",
        `Pria/Wanita dewasa mandiri tanpa keluhan medis (${usia} th)`,
        `Saya ${nama}, umur ${usia} tahun dari ${desa}. Alhamdulillah selamat sendirian, kondisi badan sehat tidak ada luka. Bisa bantu-bantu logistik di posko.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [],
          kondisiMedisKritis: [],
          obatTersedia: null,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_SOSIAL",
        }
      );
    } else if (i <= 40) {
      // Keluarga muda dengan anak usia sekolah (>1 th)
      const anakUmur = 3 + (i % 10);
      addProfile(
        "Jawa",
        `Keluarga muda, anak usia ${anakUmur} tahun, sehat walafiat`,
        `Kulo ${nama}, yuswa ${usia} tahun saking ${desa}. Kulo mriki kalih bojo lan anak kulo umur ${anakUmur} taun. Mboten wonten keluhan sakit nopo-nopo, sedanten sehat saget mlampah mandiri.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [
            { hubungan: "istri", usia: usia - 3, kondisiKhusus: null },
            { hubungan: "anak", usia: anakUmur, kondisiKhusus: null },
          ],
          kondisiMedisKritis: [],
          obatTersedia: null,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_SOSIAL",
        }
      );
    } else if (i <= 60) {
      // Ada 1 kondisi medis (misal hipertensi/asma) tapi OBAT MASIH LENGKAP (+3 skor -> HIJAU)
      addProfile(
        "Sunda",
        `Dewasa dengan riwayat tensi tapi obat bawa dari rumah masih ada`,
        `Punten abdi ${nama}, yuswa ${usia} taun ti ${desa}. Sareng pun bojo. Abdi gaduh panyawat darah tinggi, nanging landongna parantos dibantun ti bumi cekap kanggo saminggu. Mobilitas mah lancar keneh.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [{ hubungan: "istri", usia: usia - 2, kondisiKhusus: null }],
          kondisiMedisKritis: ["hipertensi"],
          obatTersedia: true,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    } else {
      // Keluarga sedang 4 orang, luka lecet ringan, obat P3K ada (+0 skor -> HIJAU)
      addProfile(
        "Betawi",
        `Keluarga 4 orang, cuma lecet dikit kena ranting, fisik kuat`,
        `Gue ${nama}, umur ${usia} taun dari ${desa}. Nih ame bini ama anak dua (umur 8 ama 12). Cuma lecet dikit tadi pas lari, kaga parah. Jalan lancar kaga perlu tandu.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [
            { hubungan: "istri", usia: usia - 4, kondisiKhusus: null },
            { hubungan: "anak", usia: 8, kondisiKhusus: null },
            { hubungan: "anak", usia: 12, kondisiKhusus: null },
          ],
          kondisiMedisKritis: [],
          obatTersedia: true,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_SOSIAL",
        }
      );
    }
  }

  // =========================================================================
  // 2. TIER KUNING (Skor 5 - 8): 60 Kasus (30%)
  // Lansia + obat ada / Balita < 1 th / 1-2 Kondisi kritis
  // =========================================================================
  for (let i = 1; i <= 60; i++) {
    const nama = `${NAMA_DEPAN[(i * 5) % NAMA_DEPAN.length]} ${NAMA_BELAKANG[(i * 11) % NAMA_BELAKANG.length]}`;
    const desa = DESA_LIST[(i + 3) % DESA_LIST.length];

    if (i <= 20) {
      // Kasus A: Bayi di bawah 1 tahun (+3 poin) + Mobilitas butuh bantuan (+2 poin) = 5 Poin (KUNING)
      addProfile(
        "Minang",
        "Ibu dengan bayi 6 bulan butuh bantuan popok dan makanan bayi",
        `Ambo ${nama}, umua 28 tahun dari ${desa}. Ambo basamo anak ketek baru umua 6 bulan jo amak. Badan ambo agak payah bajalan manopang anak, butuh bantuan kasua jo makanan bayi. Sakik barek indak ado.`,
        {
          namaKK: nama,
          usiaKK: 28,
          anggotaKeluarga: [
            { hubungan: "ibu", usia: 55, kondisiKhusus: null },
            { hubungan: "anak", usia: 0, kondisiKhusus: "bayi 6 bulan" },
          ],
          kondisiMedisKritis: [],
          obatTersedia: null,
          mobilitas: "bantuan",
          asalLokasi: desa,
          instansiRujukan: "DINAS_SOSIAL",
        }
      );
    } else if (i <= 40) {
      // Kasus B: Kepala Keluarga Lansia (>=60 th -> +2) + 1 Kondisi Medis Kritis (+3) = 5 Poin (KUNING)
      const usiaLansia = 62 + (i % 15);
      addProfile(
        "Jawa",
        `KK Lansia (${usiaLansia} th) menderita diabetes / kencing manis tapi bawa obat`,
        `Kulo Mbah ${nama}, umur ${usiaLansia} taun saking ${desa}. Kulo gadah sesakit gulo (diabetes), obat suntik/tablet tasih beto sithik. Mlaku tasih saget alon-alon.`,
        {
          namaKK: nama,
          usiaKK: usiaLansia,
          anggotaKeluarga: [{ hubungan: "istri", usia: usiaLansia - 4, kondisiKhusus: null }],
          kondisiMedisKritis: ["diabetes mellitus"],
          obatTersedia: true,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    } else {
      // Kasus C: Dewasa muda dengan 2 Kondisi Medis Kritis (Hipertensi + Asma) obat ada (+6 poin) = 6 Poin (KUNING)
      addProfile(
        "Batak",
        "Dewasa dengan hipertensi dan riwayat asma sering kumat",
        `Saya ${nama}, umur 45 tahun dari ${desa}. Saya ada riwayat darah tinggi dan sesak bengek (asma). Obat hisap ada sisa 1 botol. Masih bisa jalan sendiri tapi dada sering sesak kalau dingin.`,
        {
          namaKK: nama,
          usiaKK: 45,
          anggotaKeluarga: [{ hubungan: "istri", usia: 40, kondisiKhusus: null }],
          kondisiMedisKritis: ["hipertensi", "asma"],
          obatTersedia: true,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    }
  }

  // =========================================================================
  // 3. TIER TINGGI / ORANYE (Skor 7 - 8): 40 Kasus (20%)
  // Kombinasi faktor kerentanan ganda (Lansia + Balita, atau Sakit Kronis Tanpa Obat)
  // =========================================================================
  for (let i = 1; i <= 40; i++) {
    const nama = `${NAMA_DEPAN[(i * 7) % NAMA_DEPAN.length]} ${NAMA_BELAKANG[(i * 13) % NAMA_BELAKANG.length]}`;
    const desa = DESA_LIST[(i + 5) % DESA_LIST.length];

    if (i <= 20) {
      // 1 Kondisi Medis (+3) + Obat HABIS/Tidak Ada (+4) = 7 Poin (KUNING TINGGI)
      addProfile(
        "Sunda",
        "Penderita sakit jantung/hipertensi berat yang obatnya hanyut banjir",
        `Abdi ${nama}, yuswa 52 taun ti ${desa}. Gaduh panyawat jantung sareng sesak, obat ti dokter sadayana palid kabawa caah banjir, ayeuna tos seep pisan. Dada karasa eungap.`,
        {
          namaKK: nama,
          usiaKK: 52,
          anggotaKeluarga: [{ hubungan: "istri", usia: 48, kondisiKhusus: null }],
          kondisiMedisKritis: ["penyakit jantung"],
          obatTersedia: false,
          mobilitas: "mandiri",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    } else {
      // KK Lansia (+2) + Bayi < 1 th (+3) + 1 Kondisi Medis (+3) = 8 Poin (KUNING MAKSIMAL / AMBANG MERAH)
      const usiaLansia = 65 + (i % 10);
      addProfile(
        "Melayu",
        `Kakek lansia (${usiaLansia} th) sakit rematik berat menampung cucu bayi`,
        `Saya ${nama}, umur ${usiaLansia} tahun dari ${desa}. Saya menampung cucu masih bayi umur 4 bulan karena orang tuanya terpisah. Kaki saya linu rematik hebat, jalan dipapah. Obat masih ada sedikit.`,
        {
          namaKK: nama,
          usiaKK: usiaLansia,
          anggotaKeluarga: [
            { hubungan: "cucu", usia: 0, kondisiKhusus: "bayi 4 bulan" },
            { hubungan: "istri", usia: usiaLansia - 2, kondisiKhusus: null },
          ],
          kondisiMedisKritis: ["rematik akut"],
          obatTersedia: true,
          mobilitas: "bantuan",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    }
  }

  // =========================================================================
  // 4. TIER MERAH / KRITIS (Skor >= 9): 20 Kasus (10%)
  // Wajib Verifikasi Medis: Sakit Kritis Tanpa Obat + Lansia / Lumpuh / Multi Penyakit
  // =========================================================================
  for (let i = 1; i <= 20; i++) {
    const nama = `${NAMA_DEPAN[(i * 9) % NAMA_DEPAN.length]} ${NAMA_BELAKANG[(i * 17) % NAMA_BELAKANG.length]}`;
    const desa = DESA_LIST[(i + 7) % DESA_LIST.length];
    const usia = 60 + (i % 20);

    if (i <= 7) {
      // KK Lansia (+2) + 2 Kondisi Kritis (+6) + Obat Tidak Ada (+4) = 12 Poin (MERAH)
      addProfile(
        "Jawa",
        `Lansia (${usia} th) stroke ringan & diabetes akut, obat hilang tertimbun`,
        `Mbah ${nama}, umur ${usia} taun saking ${desa}. Niki bapak sakit stroke kalian kencing manis, obat insulin kalian tensi ical ketimbun longsor. Sakniki lemes mboten saget tangi, mripat kunang-kunang.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [{ hubungan: "anak", usia: 35, kondisiKhusus: "perawat keluarga" }],
          kondisiMedisKritis: ["stroke", "diabetes mellitus"],
          obatTersedia: false,
          mobilitas: "bantuan",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    } else if (i <= 14) {
      // Mobilitas tidak bisa (+2) + 1 Kondisi Kritis (+3) + Obat Habis (+4) + Lansia (+2) = 11 Poin (MERAH)
      addProfile(
        "Indonesia Timur",
        `Lansia lumpuh total pasca gempa tidak bisa bergerak mandiri dan obat habis`,
        `Bapa ${nama}, umur ${usia} tahun dari ${desa}. Korban gempa kaki patah dan lumpuh traksi, sama sekali tidak bisa bergerak mandiri harus diusung tandu. Obat pereda nyeri dan antibiotik habis total.`,
        {
          namaKK: nama,
          usiaKK: usia,
          anggotaKeluarga: [{ hubungan: "istri", usia: usia - 5, kondisiKhusus: null }],
          kondisiMedisKritis: ["fraktur tulang / patah tulang"],
          obatTersedia: false,
          mobilitas: "tidak_bisa",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    } else {
      // 3 Kondisi Kritis (+9) + Obat Tidak Ada (+4) = 13 Poin (MERAH SUPER KRITIS)
      addProfile(
        "Standar",
        "Pasien hemodialisis (gagal ginjal), hipertensi krisis dan sesak napas parah tanpa obat",
        `Saya ${nama}, umur 58 tahun dari ${desa}. Saya pasien gagal ginjal rutin cuci darah seminggu dua kali, ada darah tinggi dan paru-paru basah. Sudah 3 hari belum cuci darah dan obat habis semua, sesak parah.`,
        {
          namaKK: nama,
          usiaKK: 58,
          anggotaKeluarga: [{ hubungan: "istri", usia: 54, kondisiKhusus: null }],
          kondisiMedisKritis: ["gagal ginjal kronis", "hipertensi", "edema paru / sesak napas"],
          obatTersedia: false,
          mobilitas: "bantuan",
          asalLokasi: desa,
          instansiRujukan: "DINAS_KESEHATAN",
        }
      );
    }
  }

  return profiles;
}

const allProfiles = generate200Profiles();
const outPath = path.resolve(__dirname, "synthetic_profiles.json");
fs.writeFileSync(outPath, JSON.stringify(allProfiles, null, 2), "utf-8");

console.log(`Generated ${allProfiles.length} synthetic profiles to ${outPath}`);
const hijau = allProfiles.filter((p) => p.expectedLevel === "HIJAU").length;
const kuning = allProfiles.filter((p) => p.expectedLevel === "KUNING").length;
const merah = allProfiles.filter((p) => p.expectedLevel === "MERAH").length;

console.log(`Distribution: HIJAU: ${hijau} (${((hijau/200)*100).toFixed(1)}%), KUNING: ${kuning} (${((kuning/200)*100).toFixed(1)}%), MERAH: ${merah} (${((merah/200)*100).toFixed(1)}%)`);
