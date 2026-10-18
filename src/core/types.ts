/**
 * core/types.ts
 * Definisi tipe data inti untuk SyariahContract.
 * Dipisahkan dari UI agar dapat digunakan ulang sebagai modul/API.
 */

// ============================================================================
// Enumerasi dan Konstanta
// ============================================================================

/** Jenis akad yang didukung */
export type AkadType = 'mudharabah' | 'musyarakah' | 'murabahah';

/** Tingkat keparahan aturan kepatuhan */
export type Severity = 'block' | 'warn' | 'info';

/** Jenis sumber hukum */
export type LegalSourceType =
  | 'undang-undang'
  | 'peraturan'
  | 'fatwa'
  | 'khes'
  | 'kuhperdata';

export type ComplianceStatus =
  | 'PASS'
  | 'FAIL'
  | 'NEEDS_INFORMATION'
  | 'REVIEW_REQUIRED'
  | 'NOT_CHECKED';

/** Kategori sumber hukum yang dibedakan secara formal */
export type LegalSourceCategory =
  | 'peraturan_perundang_undangan'
  | 'fatwa_dsn_mui'
  | 'kompilasi_hukum'
  | 'pendapat_doktrin'
  | 'prinsip_syariah'
  | 'kebijakan_internal';

/** Status verifikasi oleh ahli hukum syariah */
export type VerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'NEEDS_EXPERT_REVIEW';

/** Peran pihak dalam akad */
export type PartyRole =
  | 'shahibul_maal'    // Pemilik modal (Mudharabah)
  | 'mudharib'         // Pengelola (Mudharabah)
  | 'syarik'           // Mitra (Musyarakah)
  | 'penjual'          // Penjual (Murabahah)
  | 'pembeli'          // Pembeli (Murabahah)
  | 'saksi';           // Saksi

/** Metode penyelesaian sengketa */
export type DisputeResolution =
  | 'musyawarah'
  | 'mediasi_syariah'
  | 'arbitrase_syariah'
  | 'pengadilan_agama';

// ============================================================================
// Sumber Hukum
// ============================================================================

/** Entri sumber hukum dari legal-sources.json */
export interface LegalSource {
  /** ID unik sumber hukum, contoh: "FATWA-MDH" */
  id: string;
  /** Jenis sumber hukum (legacy compatibility) */
  type: LegalSourceType;
  /** Kategori formal sumber hukum */
  category?: LegalSourceCategory;
  /** Judul lengkap resmi */
  title: string;
  /** Nomor dokumen resmi */
  number: string;
  /** Nomor resmi terformat */
  officialNumber?: string;
  /** Pasal atau butir spesifik yang dirujuk */
  specificArticle?: string;
  /** Tautan resmi dokumen jika tersedia */
  officialUrl?: string;
  /** Daftar ID aturan yang merujuk sumber ini */
  usedFor: string[];
  /** Status verifikasi boolean sederhana (legacy compatibility) */
  verified: boolean;
  /** Status verifikasi terstruktur */
  verificationStatus?: VerificationStatus;
  /** Tanggal terakhir diperiksa/diverifikasi */
  lastCheckedDate?: string;
  /** Catatan tambahan */
  note?: string;
  /** Catatan batasan atau kebutuhan telaah ahli */
  limitationNote?: string;
  /** Lembaga yang menerbitkan */
  authorityName?: string;
  /** Aturan yang merujuk sumber ini */
  usedForRules?: string[];
  /** Klausul yang merujuk sumber ini */
  usedForClauses?: string[];
}

// ============================================================================
// Template Klausul
// ============================================================================

/** Template klausul yang tersimpan di JSON */
export interface ClauseTemplate {
  /** ID unik klausul, contoh: "mdh-pasal-nisbah" */
  id: string;
  /** Jenis akad */
  akad: AkadType;
  /** Judul pasal */
  title: string;
  /** Urutan pasal dalam dokumen */
  order: number;
  /** Teks template dengan placeholder {{variabel}} */
  text: string;
  /** Daftar nama variabel yang digunakan dalam teks */
  variables: string[];
  /** ID sumber hukum terkait */
  legalSourceIds: string[];
  /** Apakah klausul ini wajib ada di setiap draf */
  mandatory: boolean;
  /** Penjelasan tujuan klausul (Clarity: mengapa klausul ini ada) */
  purpose?: string;
}

// ============================================================================
// Mesin Aturan Kepatuhan
// ============================================================================

/** Definisi aturan kepatuhan */
export interface ComplianceRule {
  /** ID unik aturan, contoh: "GEN-01", "MDH-01" */
  id: string;
  /** Jenis akad yang terkait, null jika berlaku umum */
  akad: AkadType | 'general';
  /** Tingkat keparahan: block (harus diperbaiki), warn (peringatan), info */
  severity: Severity;
  /** Pesan dalam Bahasa Indonesia */
  message: string;
  /** ID sumber hukum terkait */
  legalSourceIds: string[];
  /** Persyaratan yang diuji */
  requirementTested?: string;
}

/** Hasil evaluasi satu aturan kepatuhan (Explainable Finding) */
export interface ComplianceResult {
  /** ID aturan yang dievaluasi */
  ruleId: string;
  /** Status kepatuhan terstruktur */
  status: ComplianceStatus;
  /** Tingkat keparahan */
  severity: Severity;
  /** Apakah lolos evaluasi (legacy compatibility: true jika PASS) */
  passed: boolean;
  /** Pesan ringkas hasil evaluasi */
  message: string;
  /** ID sumber hukum terkait */
  legalSourceIds: string[];

  // Bidang Penjelas (Explainable Findings)
  /** Apa persyaratan spesifik yang diperiksa? */
  requirementTested?: string;
  /** Fakta transaksi aktual yang dievaluasi */
  factsEvaluated?: string[];
  /** Bagian klausul draf mana yang terkait */
  relatedClauseIds?: string[];
  /** Mengapa temuan ini muncul? */
  explanation?: string;
  /** Status verifikasi sumber rujukan */
  sourcesVerificationStatus?: VerificationStatus;
  /** Apa yang masih belum diketahui oleh sistem? */
  unknowns?: string[];
  /** Langkah perbaikan yang dapat dilakukan pengguna */
  actionableSuggestion?: string;
  /** Apakah persoalan ini membutuhkan penilaian ahli syariah/hukum? */
  expertReviewRequired?: boolean;
  /** Alasan mengapa diperlukan telaah ahli */
  expertReviewReason?: string;
}

/** Ringkasan keseluruhan kepatuhan */
export interface ComplianceSummary {
  /** Semua hasil evaluasi */
  results: ComplianceResult[];
  /** Apakah ada aturan block yang berstatus FAIL */
  hasBlockingErrors: boolean;
  /** Jumlah yang berstatus PASS */
  passedCount: number;
  /** Jumlah peringatan */
  warningCount: number;
  /** Jumlah kegagalan block */
  blockCount: number;
  /** Jumlah info */
  infoCount: number;

  /** Rekap status terstruktur */
  statusCounts?: {
    pass: number;
    fail: number;
    needsInformation: number;
    reviewRequired: number;
    notChecked: number;
  };
  /** Versi aturan kepatuhan */
  rulesVersion?: string;
  /** Disklaimer metodologis kepatuhan */
  disclaimer?: string;
}

// ============================================================================
// Data Pihak (Para Pihak)
// ============================================================================

/** Informasi satu pihak dalam akad */
export interface PartyInfo {
  /** Nama lengkap */
  nama: string;
  /** Nomor identitas (NIK/NPWP/No. Izin Usaha) */
  identitas: string;
  /** Jenis identitas */
  jenisIdentitas: 'NIK' | 'NPWP' | 'SIUP' | 'NIB';
  /** Alamat lengkap */
  alamat: string;
  /** Peran dalam akad */
  peran: PartyRole;
  /** Nomor telepon (opsional, tidak disimpan server) */
  telepon?: string;
}

/** Informasi saksi */
export interface WitnessInfo {
  nama: string;
  identitas: string;
  alamat: string;
}

// ============================================================================
// Data Formulir per Jenis Akad
// ============================================================================

/** Data formulir umum (semua akad) */
export interface BaseFormData {
  /** Jenis akad yang dipilih */
  jenisAkad: AkadType;
  /** Data para pihak */
  ppihat: PartyInfo[];
  /** Data saksi (minimal 2) */
  saksi: WitnessInfo[];
  /** Tanggal mulai akad */
  tanggalMulai: string;
  /** Tanggal berakhir akad */
  tanggalBerakhir: string;
  /** Objek/jenis usaha */
  objekUsaha: string;
  /** Kategori usaha (untuk validasi tidak terlarang) */
  kategoriUsaha: string;
  /** Domisili hukum */
  domisiliHukum: string;
  /** Metode penyelesaian sengketa */
  penyelesaianSengketa: DisputeResolution[];
}

/** Data khusus Mudharabah */
export interface MudharabahFormData extends BaseFormData {
  jenisAkad: 'mudharabah';
  /** Modal dari shahibul maal (dalam Rupiah) */
  jumlahModal: number;
  /** Bentuk modal (uang/aset) */
  bentukModal: 'uang' | 'aset';
  /** Deskripsi aset jika bentuk modal berupa aset */
  deskripsiAset?: string;
  /** Nisbah bagi hasil shahibul maal (%) */
  nisbahShahibulMaal: number;
  /** Nisbah bagi hasil mudharib (%) */
  nisbahMudharib: number;
  /** Jenis usaha yang dijalankan */
  jenisUsaha: string;
  /** Apakah ada jaminan dari mudharib */
  adaJaminan: boolean;
  /** Deskripsi jaminan */
  deskripsiJaminan?: string;
}

/** Data khusus Musyarakah */
export interface MusyarakahFormData extends BaseFormData {
  jenisAkad: 'musyarakah';
  /** Kontribusi modal per pihak */
  kontribusiModal: {
    pihak: string;
    jumlah: number;
  }[];
  /** Total modal gabungan */
  totalModal: number;
  /** Nisbah bagi hasil per pihak (%) */
  nisbahBagiHasil: {
    pihak: string;
    persentase: number;
  }[];
  /** Pembagian wewenang pengelolaan */
  wewenangPengelolaan: string;
}

/** Data khusus Murabahah */
export interface MurabahahFormData extends BaseFormData {
  jenisAkad: 'murabahah';
  /** Jenis barang yang diperjualbelikan */
  jenisBarang: string;
  /** Spesifikasi barang */
  spesifikasiBarang: string;
  /** Jumlah unit barang */
  jumlahBarang: number;
  /** Satuan barang */
  satuanBarang: string;
  /** Harga pokok/beli (IDR) */
  hargaPokok: number;
  /** Margin keuntungan (IDR) */
  marginKeuntungan: number;
  /** Harga jual = harga pokok + margin (IDR) */
  hargaJual: number;
  /** Apakah pembayaran tangguh */
  pembayaranTangguh: boolean;
  /** Jumlah angsuran (jika tangguh) */
  jumlahAngsuran?: number;
  /** Jadwal angsuran (jika tangguh) */
  jadwalAngsuran?: {
    ke: number;
    tanggal: string;
    jumlah: number;
  }[];
  /** Penjual sudah memiliki/menguasai barang */
  barangDimiliki: boolean;
  /** Apakah ada akad wakalah terpisah */
  adaWakalah: boolean;
  /** Apakah ada denda keterlambatan */
  adaDenda: boolean;
  /** Jumlah denda per hari (sebagai dana sosial/ta'zir) */
  jumlahDenda?: number;
}

/** Union type untuk semua jenis form data */
export type AkadFormData =
  | MudharabahFormData
  | MusyarakahFormData
  | MurabahahFormData;

// ============================================================================
// Draf Dokumen yang Dihasilkan
// ============================================================================

/** Satu klausul/pasal dalam draf yang sudah diisi */
export interface GeneratedClause {
  /** Nomor pasal */
  nomor: number;
  /** Judul pasal */
  judul: string;
  /** Teks pasal yang sudah terisi variabel */
  teks: string;
  /** ID sumber hukum terkait */
  legalSourceIds: string[];
  /** ID template klausul asal */
  templateId: string;
  /** Penjelasan maksud dan tujuan klausul (Clarity) */
  purpose?: string;
  /** Apakah klausul ini esensial (rukun/syarat mutlak) atau aksesoris */
  isMandatory?: boolean;
  /** Apakah klausul telah diubah/disunting secara manual oleh pengguna */
  isCustomized?: boolean;
  /** Teks asli sebelum penyuntingan manual */
  originalText?: string;
  /** ID aturan kepatuhan yang terkait dengan klausul ini */
  relatedRuleIds?: string[];
}

/** Draf dokumen akad yang dihasilkan */
export interface GeneratedDraft {
  /** ID unik draf (untuk referensi klien saja) */
  id: string;
  /** Jenis akad */
  jenisAkad: AkadType;
  /** Judul dokumen */
  judul: string;
  /** Nomor dokumen (opsional) */
  nomorDokumen?: string;
  /** Tanggal pembuatan draf */
  tanggalDibuat: string;
  /** Data para pihak */
  paraPihak: PartyInfo[];
  /** Data saksi */
  saksi: WitnessInfo[];
  /** Bagian pertimbangan/mukadimah */
  pertimbangan: string;
  /** Pasal-pasal */
  klausul: GeneratedClause[];
  /** Teks penutup */
  penutup: string;
  /** Teks disklaimer */
  disklaimer: string;
  /** Ringkasan kepatuhan */
  kepatuhan: ComplianceSummary;

  /** Nomor versi draf (naik jika ada revisi manual) */
  draftVersion?: number;
  /** Versi mesin aturan kepatuhan */
  rulesVersion?: string;
  /** Apakah draf telah diubah sejak pemeriksaan kepatuhan terakhir */
  isStale?: boolean;
  /** Timestamp pemeriksaan terakhir */
  lastEvaluatedAt?: string;
}

// ============================================================================
// Penilaian (Instrumen Penelitian)
// ============================================================================

/** Peran penilai */
export type PenilaiRole = 'ahli' | 'pengguna';

/** Satu item penilaian skala Likert */
export interface PenilaianItem {
  /** ID aspek penilaian */
  aspekId: string;
  /** Label aspek */
  aspekLabel: string;
  /** Nilai 1-5 */
  nilai: number;
}

/** Data penilaian yang dikirim */
export interface PenilaianData {
  /** Peran penilai */
  peran: PenilaiRole;
  /** Timestamp pengisian */
  timestamp: string;
  /** Jenis akad yang dinilai */
  jenisAkad: AkadType;
  /** Item-item penilaian */
  items: PenilaianItem[];
  /** Saran/masukan teks bebas */
  saran: string;
}

// ============================================================================
// Metadata Akad (untuk UI)
// ============================================================================

/** Metadata tampilan untuk setiap jenis akad */
export interface AkadMetadata {
  /** Jenis akad */
  type: AkadType;
  /** Nama tampilan */
  nama: string;
  /** Deskripsi singkat */
  deskripsi: string;
  /** Contoh kasus penggunaan */
  contohKasus: string;
  /** Ikon (emoji atau nama ikon) */
  ikon: string;
  /** Warna tema */
  warna: string;
}

/** Daftar metadata akad */
export const AKAD_METADATA: AkadMetadata[] = [
  {
    type: 'mudharabah',
    nama: 'Mudharabah',
    deskripsi:
      'Akad kerja sama usaha antara pemilik modal (shahibul maal) dan pengelola (mudharib). Modal sepenuhnya dari pemilik, keuntungan dibagi sesuai nisbah yang disepakati.',
    contohKasus:
      'Pak Ahmad memiliki modal Rp 100 juta dan ingin bekerja sama dengan Bu Siti yang ahli dalam usaha kuliner. Keuntungan akan dibagi 60:40.',
    ikon: 'MDH',
    warna: '#1B5E20',
  },
  {
    type: 'musyarakah',
    nama: 'Musyarakah',
    deskripsi:
      'Akad kerja sama usaha antara dua pihak atau lebih yang masing-masing menyertakan modal. Keuntungan dibagi sesuai nisbah, kerugian sesuai proporsi modal.',
    contohKasus:
      'Pak Budi dan Pak Deni masing-masing menyetor modal Rp 50 juta untuk membuka toko bersama. Keuntungan dibagi 50:50.',
    ikon: 'MSY',
    warna: '#0D47A1',
  },
  {
    type: 'murabahah',
    nama: 'Murabahah',
    deskripsi:
      'Akad jual beli di mana penjual menyatakan harga pokok dan margin keuntungan secara transparan kepada pembeli. Pembayaran bisa tunai atau angsuran.',
    contohKasus:
      'Koperasi membeli mesin jahit seharga Rp 10 juta, lalu menjualnya kepada anggota seharga Rp 12 juta (margin Rp 2 juta) dengan angsuran 12 bulan.',
    ikon: 'MRB',
    warna: '#E65100',
  },
];

/** Teks disklaimer wajib (dari PRD Bagian 9) */
export const DISCLAIMER_TEXT =
  'Draf ini dihasilkan otomatis sebagai bahan awal yang disusun berdasarkan rujukan hukum yang tercantum, dan bersifat edukatif. Dokumen ini bukan nasihat hukum, bukan fatwa, dan bukan sertifikasi kesesuaian syariah. Sebelum ditandatangani, sangat disarankan ditinjau oleh advokat/notaris dan Dewan Pengawas Syariah atau ulama yang berkompeten, terutama untuk transaksi bernilai besar.';

/** Daftar kategori usaha terlarang */
export const KATEGORI_TERLARANG: string[] = [
  'Minuman keras/beralkohol',
  'Perjudian',
  'Babi dan produk turunannya',
  'Narkotika dan obat terlarang',
  'Prostitusi',
  'Riba/bunga konvensional',
  'Senjata ilegal',
  'Rokok/tembakau (khilafiyah)',
];
