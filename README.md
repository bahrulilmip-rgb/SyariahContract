# SyariahContract.id

Platform Digitalisasi Penyusunan Draf Akad Syariah Patuh Syariah & Hukum Positif Indonesia untuk Pelaku UMKM.

Proyek Penelitian & Pengembangan (R&D) Program Studi Hukum Ekonomi Syariah, Fakultas Syariah dan Hukum, Universitas Islam Negeri (UIN) Walisongo Semarang.

---

## 1. Ringkasan Sistem

SyariahContract.id adalah purwarupa sistem pakar berbasis web yang dirancang untuk memandu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) dalam menyusun draf kontrak bisnis syariah yang valid, terstruktur, serta memenuhi prinsip kepatuhan syariah (syariah compliance) dan hukum perdata Indonesia (KUHPerdata).

Sistem mengadopsi pendekatan **Deterministic Rule Engine** (non-generative / bebas halusinasi AI) untuk memastikan setiap klausul yang dihasilkan dapat diverifikasi dan dipertanggungjawabkan secara yuridis dan syar'i.

### Modul Akad yang Didukung (Fase MVP):
1. **Akad Mudharabah**: Pembiayaan/kemitraan bagi hasil usaha produktif antara Shahibul Mal (penyedia dana) dan Mudharib (pengelola usaha).
2. **Akad Musyarakah**: Kemitraan permodalan bersama (musyarakah inan) dengan kontribusi modal dari seluruh pihak serta pembagian keuntungan berdasarkan nisbah yang disepakati.
3. **Akad Murabahah**: Transaksi jual beli komoditas/aset barang dengan pengungkapan harga perolehan pokok secara transparan dan margin keuntungan yang disepakati.

---

## 2. Landasan Yuridis & Fatwa DSN-MUI

Seluruh logika kepatuhan (rule engine) dan klausul baku ditautkan secara langsung dengan sumber otoritatif:

- **Kompilasi Hukum Ekonomi Syariah (KHES)** — Mahkamah Agung RI (PERMA No. 2 Tahun 2008).
- **Fatwa DSN-MUI**:
  - Fatwa No. 07/DSN-MUI/IV/2000 tentang Pembiayaan Mudharabah (Qiradh).
  - Fatwa No. 08/DSN-MUI/IV/2000 tentang Pembiayaan Musyarakah.
  - Fatwa No. 04/DSN-MUI/IV/2000 tentang Murabahah.
  - Fatwa No. 115/DSN-MUI/IX/2017 tentang Akad Mudharabah.
  - Fatwa No. 114/DSN-MUI/IX/2017 tentang Akad Musyarakah.
- **Hukum Positif Indonesia**:
  - Kitab Undang-Undang Hukum Perdata (KUHPerdata) Pasal 1320 (Syarat Sahnya Perjanjian) dan Pasal 1338 (Asas Pacta Sunt Servanda).
  - Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).

---

## 3. Fitur Utama

- **Wizard Interaktif 5 Tahap**:
  - Tahap 1: Identitas Para Pihak (Shahibul Mal / Mudharib, dsb).
  - Tahap 2: Objek & Legalitas Usaha (Verifikasi halal, izin edar/PIRT/NIB).
  - Tahap 3: Permodalan & Ketentuan Finansial (Jumlah modal, jadwal pencairan).
  - Tahap 4: Nisbah Bagi Hasil / Margin & Penyelesaian Sengketa (Basyarnas / Pengadilan Agama).
  - Tahap 5: Review Kepatuhan & Pratinjau Dokumen Kontrak.
- **Real-Time Syariah & Legal Compliance Engine**:
  - Pencegahan klausul terlarang: Riba (bunga tetap), Gharar (ketidakjelasan objek/nisbah), Maysir (spekulasi), dan Bathil.
  - Peringatan dini validasi sebelum dokumen dicetak.
- **Generator Draf Kontrak Deterministik**:
  - Konversi angka ke kalimat terbilang otomatis Bahasa Indonesia.
  - Penomoran klausul berjenjang dan penomoran otomatis.
- **Penyimpanan Lokal Sesuai UU PDP**:
  - Data masukan tersimpan di peramban pengguna (Local Storage); tidak ada transmisi data privat pihak ketiga ke server.
- **Modul Instrumen Evaluasi Ahli (Likert 1-5)**:
  - Form validasi materi hukum syariah dan kegunaan sistem bagi akademisi dan praktisi UMKM, dilengkapi ekspor rekap CSV untuk analisis statistik penelitian.

---

## 4. Arsitektur Teknologi

- **Framework**: Next.js 16 (App Router) dengan TypeScript.
- **Styling**: Tailwind CSS dengan palet warna formal Islamic Fintech (Emerald Deep, Warm Gold, Slate Neutral). Bebas dari elemen emoji informal.
- **Testing**: Vitest (51 unit tests untuk kepatuhan hukum dan generator teks).
- **Icons**: Heroicons & Lucide-react (SVG murni).

---

## 5. Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- Node.js versi 18 atau lebih tinggi
- Git

### Langkah Instalasi

1. Kloning repositori:
```bash
git clone https://github.com/bahrulilmip-rgb/SyariahContract.git
cd SyariahContract
```

2. Pasang dependensi:
```bash
npm install
```

3. Jalankan automated test suite:
```bash
npm run test
```

4. Jalankan server pengembangan lokal:
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

5. Build produksi:
```bash
npm run build
npm run start
```

---

## 6. Struktur Direktori

```text
syariah-contract/
├── content/
│   ├── clauses/          # Klausul baku hukum (Mudharabah, Musyarakah, Murabahah)
│   └── legal-sources.json # Basis data metadata Fatwa DSN-MUI & KHES
├── src/
│   ├── app/              # Next.js App Router (Halaman & Rute)
│   │   ├── akad/[jenis]/ # Dynamic Wizard Generator
│   │   ├── kebijakan-privasi/ # Kebijakan Kepatuhan UU PDP
│   │   ├── penilaian/    # Instrumen Uji Ahli & Pengguna UMKM
│   │   └── page.tsx      # Beranda Utama
│   ├── components/       # Komponen UI (Navbar, Footer, Modal, Badge)
│   └── core/
│       ├── generator/    # Engine Penyusun Draf & Terbilang
│       ├── rules/        # Aturan Kepatuhan Syariah & Hukum Positif
│       ├── types.ts      # Definisi Tipe TypeScript
│       └── legalSources.ts
└── tests/                # Automated Test Suite (Vitest)
```

---

## 7. Peneliti & Pengembang

- **Peneliti / Pengembang**: Bahrul Ilmi P.
- **Institusi**: Program Studi Hukum Ekonomi Syariah, Fakultas Syariah dan Hukum, UIN Walisongo Semarang.
- **Lisensi**: Proyek Penelitian Akademis - Hak Cipta Dilindungi Undang-Undang.
