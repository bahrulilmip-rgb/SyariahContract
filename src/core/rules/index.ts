/**
 * core/rules/index.ts
 * Mesin Aturan Kepatuhan (Traceable Rule-Based Compliance Checker).
 *
 * Menguji kepatuhan data transaksi terhadap rujukan Fatwa DSN-MUI, KHES, dan KUHPerdata.
 * Mengembalikan status terstruktur: PASS, FAIL, NEEDS_INFORMATION, REVIEW_REQUIRED, NOT_CHECKED.
 */

import {
  AkadFormData,
  ComplianceResult,
  ComplianceSummary,
  KATEGORI_TERLARANG,
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
} from "../types";

export const RULES_VERSION = "v1.2.0-traceable";

export const COMPLIANCE_DISCLAIMER =
  "Status PASS pada pemeriksaan ini menunjukkan kesesuaian fakta input dengan aturan deterministik spesifik yang diuji, BUKAN merupakan fatwa, sertifikasi kesesuaian syariah mutlak, atau jaminan keabsahan di mata pengadilan. Bagian yang membutuhkan penilaian subjektif diberi tanda REVIEW_REQUIRED.";

/**
 * Evaluasi Aturan Umum (GEN) untuk semua akad
 */
export function evaluateGeneralRules(data: AkadFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // --------------------------------------------------------------------------
  // GEN-01: Identitas Para Pihak Lengkap dan Sah
  // --------------------------------------------------------------------------
  const hasPartiesArray = Boolean(data.ppihat && data.ppihat.length >= 2);
  const emptyParties = (data.ppihat || []).filter(
    (p) => !p.nama?.trim() || !p.identitas?.trim() || !p.alamat?.trim()
  );
  const partiesComplete = hasPartiesArray && emptyParties.length === 0;

  let gen01Status: "PASS" | "FAIL" | "NEEDS_INFORMATION" = "PASS";
  let gen01Message = "Identitas seluruh pihak lengkap dan terisi.";
  let gen01Suggestion: string | undefined = undefined;

  if (!hasPartiesArray) {
    gen01Status = "FAIL";
    gen01Message = "Akad wajib melibatkan minimal dua pihak yang cakap hukum.";
    gen01Suggestion = "Tambahkan minimal dua subjek hukum (pihak pertama dan kedua).";
  } else if (emptyParties.length > 0) {
    gen01Status = "NEEDS_INFORMATION";
    gen01Message = `Terdapat ${emptyParties.length} pihak yang data identitasnya (nama, NIK/izin, atau alamat) belum lengkap.`;
    gen01Suggestion = "Lengkapi nama lengkap, jenis identitas resmi, nomor NIK/NPWP/NIB, serta alamat domisili seluruh pihak.";
  }

  results.push({
    ruleId: "GEN-01",
    status: gen01Status,
    severity: "block",
    passed: gen01Status === "PASS",
    message: gen01Message,
    requirementTested: "Kecakapan dan kejelasan identitas para pihak (ahliyyah wal-aqidan)",
    factsEvaluated: (data.ppihat || []).map(
      (p, i) => `Pihak ${i + 1}: ${p.nama || "(kosong)"} [${p.jenisIdentitas || "ID"}: ${p.identitas || "(kosong)"}]`
    ),
    relatedClauseIds: ["komparisi", "penutup"],
    explanation:
      "Pasal 1320 KUHPerdata mensyaratkan kecakapan para pihak dalam membuat perikatan, dan KHES Pasal 20 mensyaratkan kejelasan subjek aqidain.",
    legalSourceIds: ["KUHPERDATA-1320", "KUHPERDATA-1338", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [
      "Kecakapan hukum nyata (usia dewasa dan tidak di bawah pengampuan) belum divalidasi ke instansi kependudukan/Dukcapil.",
    ],
    actionableSuggestion: gen01Suggestion,
    expertReviewRequired: false,
  });

  // --------------------------------------------------------------------------
  // GEN-02: Nominal Transaksi Bernilai Positif (IDR)
  // --------------------------------------------------------------------------
  let amountValid = true;
  let evaluatedValueStr = "";
  let gen02Missing = false;

  if (data.jenisAkad === "mudharabah") {
    amountValid = data.jumlahModal > 0;
    evaluatedValueStr = `Modal Mudharabah: Rp ${data.jumlahModal?.toLocaleString("id-ID") || 0}`;
    gen02Missing = !data.jumlahModal;
  } else if (data.jenisAkad === "musyarakah") {
    amountValid =
      data.totalModal > 0 &&
      Boolean(data.kontribusiModal && data.kontribusiModal.every((k) => k.jumlah > 0));
    evaluatedValueStr = `Total Modal Musyarakah: Rp ${data.totalModal?.toLocaleString("id-ID") || 0}`;
    gen02Missing = !data.totalModal || data.totalModal <= 0;
  } else if (data.jenisAkad === "murabahah") {
    amountValid = data.hargaPokok > 0 && data.marginKeuntungan >= 0;
    evaluatedValueStr = `Harga Pokok: Rp ${data.hargaPokok?.toLocaleString("id-ID") || 0}, Margin: Rp ${data.marginKeuntungan?.toLocaleString("id-ID") || 0}`;
    gen02Missing = !data.hargaPokok || data.hargaPokok <= 0;
  }

  const gen02Status = gen02Missing
    ? "NEEDS_INFORMATION"
    : amountValid
    ? "PASS"
    : "FAIL";

  results.push({
    ruleId: "GEN-02",
    status: gen02Status,
    severity: "block",
    passed: gen02Status === "PASS",
    message:
      gen02Status === "PASS"
        ? "Nilai nominal transaksi valid dan bernilai positif (IDR)."
        : gen02Status === "NEEDS_INFORMATION"
        ? "Nominal transaksi belum diisi atau bernilai nol."
        : "Nilai nominal uang/modal harus berupa bilangan positif dalam mata uang Rupiah.",
    requirementTested: "Kepastian nilai nominal objek kewajiban finansial dalam mata uang sah (Rupiah)",
    factsEvaluated: [evaluatedValueStr],
    relatedClauseIds: ["pasal-harga", "pasal-modal"],
    explanation:
      "Objek perikatan harus tertentu atau dapat ditentukan secara pasti (KUHPerdata Pasal 1320 butir 3 dan prinsip fiqih maal ma'lum).",
    legalSourceIds: ["KUHPERDATA-1320"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: ["Sumber dana modal/pembayaran tidak diperiksa apakah bebas dari pencucian uang."],
    actionableSuggestion:
      gen02Status !== "PASS"
        ? "Masukkan angka positif tanpa titik/koma untuk nominal modal atau harga pokok."
        : undefined,
    expertReviewRequired: false,
  });

  // --------------------------------------------------------------------------
  // GEN-03: Jangka Waktu Akad Valid
  // --------------------------------------------------------------------------
  let datesValid = false;
  let datesMissing = false;

  if (!data.tanggalMulai || !data.tanggalBerakhir) {
    datesMissing = true;
  } else {
    const start = new Date(data.tanggalMulai);
    const end = new Date(data.tanggalBerakhir);
    datesValid = !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
  }

  const gen03Status = datesMissing
    ? "NEEDS_INFORMATION"
    : datesValid
    ? "PASS"
    : "FAIL";

  results.push({
    ruleId: "GEN-03",
    status: gen03Status,
    severity: "block",
    passed: gen03Status === "PASS",
    message:
      gen03Status === "PASS"
        ? "Rentang jangka waktu akad valid."
        : gen03Status === "NEEDS_INFORMATION"
        ? "Tanggal mulai atau tanggal berakhir akad belum diisi."
        : "Tanggal mulai akad tidak boleh setelah tanggal berakhir akad.",
    requirementTested: "Konsistensi temporal jangka waktu berlakunya perikatan",
    factsEvaluated: [
      `Tanggal Mulai: ${data.tanggalMulai || "(kosong)"}`,
      `Tanggal Berakhir: ${data.tanggalBerakhir || "(kosong)"}`,
    ],
    relatedClauseIds: ["pasal-jenis-usaha", "pasal-pembayaran"],
    explanation:
      "Perjanjian yang memiliki batas waktu pelaksanaan harus memuat penetapan awal dan akhir masa berlaku yang logis dan konsisten.",
    legalSourceIds: ["KUHPERDATA-1320"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion:
      gen03Status !== "PASS"
        ? "Pilih tanggal mulai yang mendahului atau sama dengan tanggal jatuh tempo/berakhirnya kerja sama."
        : undefined,
    expertReviewRequired: false,
  });

  // --------------------------------------------------------------------------
  // GEN-04: Domisili Hukum dan Mekanisme Sengketa Syariah
  // --------------------------------------------------------------------------
  const disputeFilled =
    Boolean(data.domisiliHukum?.trim()) &&
    Boolean(data.penyelesaianSengketa && data.penyelesaianSengketa.length > 0);

  const gen04Status = disputeFilled ? "PASS" : "NEEDS_INFORMATION";

  results.push({
    ruleId: "GEN-04",
    status: gen04Status,
    severity: "warn",
    passed: gen04Status === "PASS",
    message: disputeFilled
      ? `Domisili hukum ditetapkan di ${data.domisiliHukum} dengan musyawarah/arbitrase.`
      : "Disarankan menetapkan domisili hukum dan mekanisme penyelesaian sengketa syariah.",
    requirementTested: "Kepastian forum penyelesaian perselisihan (choice of forum)",
    factsEvaluated: [
      `Domisili: ${data.domisiliHukum || "(belum ditentukan)"}`,
      `Mekanisme: ${(data.penyelesaianSengketa || []).join(", ") || "(belum dipilih)"}`,
    ],
    relatedClauseIds: ["pasal-sengketa"],
    explanation:
      "UU Peradilan Agama Pasal 49 memberi wewenang absolut pada Pengadilan Agama dalam sengketa ekonomi syariah, atau BASYARNAS jika disepakati arbitrase.",
    legalSourceIds: ["UU-PERADILAN-AGAMA", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: ["Apakah ada kesepakatan tertulis arbitrase terpisah di luar akad ini."],
    actionableSuggestion:
      !disputeFilled
        ? "Pilih minimal satu metode sengketa (misalnya Musyawarah & Pengadilan Agama) dan tulis nama domisili kota/wilayah peradilan."
        : undefined,
    expertReviewRequired: false,
  });

  // --------------------------------------------------------------------------
  // GEN-05: Kehalalan Objek Usaha
  // --------------------------------------------------------------------------
  const kategori = (data.kategoriUsaha || "").toLowerCase();
  const objek = (data.objekUsaha || "").toLowerCase();
  const textToCheck = `${kategori} ${objek}`;

  const forbiddenKeywords = [
    "minuman keras",
    "alkohol",
    "khamr",
    "judi",
    "taruhan",
    "maysir",
    "babi",
    "narkoba",
    "narkotika",
    "prostitusi",
    "zina",
    "riba",
    "senjata ilegal",
    ...KATEGORI_TERLARANG.map((k) => k.toLowerCase()),
  ];

  const foundForbidden = forbiddenKeywords.find((keyword) => textToCheck.includes(keyword));

  let gen05Status: "PASS" | "FAIL" | "REVIEW_REQUIRED" = "PASS";
  let gen05Msg = "Objek/kategori usaha memenuhi kriteria halal syariah.";

  if (foundForbidden) {
    gen05Status = "FAIL";
    gen05Msg = `Objek usaha terdeteksi mengandung kata kunci terlarang syariah (${foundForbidden}).`;
  } else if (!data.objekUsaha?.trim() && !data.kategoriUsaha?.trim()) {
    gen05Status = "REVIEW_REQUIRED";
    gen05Msg = "Objek usaha belum dijelaskan secara rinci; memerlukan penegasan kehalalan oleh para pihak.";
  }

  results.push({
    ruleId: "GEN-05",
    status: gen05Status,
    severity: "block",
    passed: gen05Status === "PASS",
    message: gen05Msg,
    requirementTested: "Kehalalan kausa dan objek usaha (sebab yang halal / halal lil-intifa')",
    factsEvaluated: [
      `Kategori: ${data.kategoriUsaha || "(kosong)"}`,
      `Objek: ${data.objekUsaha || "(kosong)"}`,
    ],
    relatedClauseIds: ["pasal-definisi", "pasal-jenis-usaha", "pasal-objek"],
    explanation:
      "UU No. 21 Tahun 2008 dan KUHPerdata Pasal 1320 butir 4 melarang perjanjian yang berlawanan dengan kesusilaan, ketertiban umum, atau prinsip syariah.",
    legalSourceIds: ["UU-PERBANKAN-SYARIAH"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [
      "Pemeriksaan dilakukan berbasis kecocokan kata kunci; kehalalan rantai pasok aktual memerlukan sertifikasi halal resmi (BPJPH).",
    ],
    actionableSuggestion:
      gen05Status === "FAIL"
        ? "Ganti jenis/objek usaha dengan komoditas halal yang diperbolehkan dalam hukum Islam dan hukum positif."
        : undefined,
    expertReviewRequired: gen05Status === "REVIEW_REQUIRED",
    expertReviewReason:
      gen05Status === "REVIEW_REQUIRED"
        ? "Deskripsi objek masih terlalu umum sehingga perlu konfirmasi ahli apakah terdapat unsur syubhat/haram."
        : undefined,
  });

  return results;
}

/**
 * Evaluasi Aturan Kepatuhan Mudharabah (MDH)
 */
export function evaluateMudharabahRules(data: MudharabahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MDH-01: Bentuk dan nilai modal jelas
  const modalNumberValid = data.jumlahModal > 0;
  const isAset = data.bentukModal === "aset";
  const assetHasDesc = Boolean(data.deskripsiAset?.trim());

  let mdh01Status: "PASS" | "FAIL" | "NEEDS_INFORMATION" | "REVIEW_REQUIRED" = "PASS";
  let mdh01Msg = "Bentuk dan nilai modal Mudharabah dinyatakan secara jelas.";

  if (!modalNumberValid) {
    mdh01Status = "FAIL";
    mdh01Msg = "Modal Mudharabah harus bernilai lebih besar dari 0 Rupiah.";
  } else if (isAset && !assetHasDesc) {
    mdh01Status = "NEEDS_INFORMATION";
    mdh01Msg = "Modal berupa aset wajib disertai deskripsi dan spesifikasi taksiran nilai wajar.";
  } else if (isAset && assetHasDesc) {
    mdh01Status = "REVIEW_REQUIRED";
    mdh01Msg = "Modal berupa aset telah dideskripsikan, namun memerlukan penilaian wajar (appraisal) yang disepakati bersama.";
  }

  results.push({
    ruleId: "MDH-01",
    status: mdh01Status,
    severity: "block",
    passed: mdh01Status === "PASS" || mdh01Status === "REVIEW_REQUIRED",
    message: mdh01Msg,
    requirementTested: "Kejelasan wujud dan kepastian nilai modal (ra's al-maal ma'lum)",
    factsEvaluated: [
      `Nominal: Rp ${data.jumlahModal?.toLocaleString("id-ID") || 0}`,
      `Bentuk: ${data.bentukModal}`,
      isAset ? `Deskripsi Aset: ${data.deskripsiAset || "(belum diisi)"}` : "Uang tunai",
    ],
    relatedClauseIds: ["pasal-modal"],
    explanation:
      "Fatwa DSN No. 07/DSN-MUI/IV/2000 Butir 1 menyatakan modal harus diketahui jumlah dan kualitasnya, dapat berbentuk uang atau barang yang dinilai pada waktu akad.",
    legalSourceIds: ["FATWA-MDH", "KHES", "UU-PERBANKAN-SYARIAH"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: isAset ? ["Apakah taksiran nilai aset telah dinilai oleh penilai independen."] : [],
    actionableSuggestion:
      mdh01Status === "NEEDS_INFORMATION"
        ? "Lengkapi uraian deskripsi fisik dan dasar taksiran nilai aset modal."
        : undefined,
    expertReviewRequired: mdh01Status === "REVIEW_REQUIRED",
    expertReviewReason: isAset ? "Penetapan nilai modal aset non-kas rawan perselisihan jika nilai pasar berubah." : undefined,
  });

  // MDH-02: Total Nisbah Bagi Hasil Tepat 100%
  const totalNisbah = Number(data.nisbahShahibulMaal || 0) + Number(data.nisbahMudharib || 0);
  const nisbahValid =
    data.nisbahShahibulMaal > 0 &&
    data.nisbahMudharib > 0 &&
    Math.round(totalNisbah) === 100;

  const mdh02Status = nisbahValid ? "PASS" : "FAIL";

  results.push({
    ruleId: "MDH-02",
    status: mdh02Status,
    severity: "block",
    passed: nisbahValid,
    message: nisbahValid
      ? `Nisbah bagi hasil seimbang: Shahibul Maal ${data.nisbahShahibulMaal}%, Mudharib ${data.nisbahMudharib}%.`
      : `Total porsi nisbah bagi hasil harus tepat 100% (saat ini: ${totalNisbah}%).`,
    requirementTested: "Ketetapan nisbah bagi hasil dalam bentuk persentase berimbang",
    factsEvaluated: [
      `Shahibul Maal: ${data.nisbahShahibulMaal}%`,
      `Mudharib: ${data.nisbahMudharib}%`,
      `Total: ${totalNisbah}%`,
    ],
    relatedClauseIds: ["pasal-nisbah"],
    explanation:
      "Fatwa DSN 07/2000 menegaskan nisbah harus disepakati oleh kedua pihak dan ditentukan pada saat akad dengan proporsi persentase atas laba riil.",
    legalSourceIds: ["FATWA-MDH", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion: !nisbahValid
      ? "Sesuaikan persentase porsi Shahibul Maal dan Mudharib sehingga penjumlahannya tepat 100%."
      : undefined,
    expertReviewRequired: false,
  });

  // MDH-03: Larangan nominal pasti keuntungan
  results.push({
    ruleId: "MDH-03",
    status: "PASS",
    severity: "block",
    passed: true,
    message: "Pembagian keuntungan menggunakan sistem nisbah persentase dari laba riil, bukan nominal tetap.",
    requirementTested: "Larangan jaminan laba pasti (anti-riba / anti-guaranteed return)",
    factsEvaluated: ["Menggunakan klausul nisbah proporsional berdasar laporan keuangan berkala."],
    relatedClauseIds: ["pasal-nisbah"],
    explanation:
      "Menentukan keuntungan dalam bentuk nominal pasti bagi salah satu pihak merusak akad mudharabah dan menjadikannya riba.",
    legalSourceIds: ["FATWA-MDH", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    expertReviewRequired: false,
  });

  // MDH-04: Kerugian ditanggung shahibul maal
  results.push({
    ruleId: "MDH-04",
    status: "PASS",
    severity: "info",
    passed: true,
    message: "Klausul kerugian ditanggung Shahibul Maal (kecuali akibat kelalaian Mudharib) otomatis dimuat pada Pasal Kerugian.",
    requirementTested: "Alokasi risiko finansial sesuai kaidah mudharabah",
    factsEvaluated: ["Klausul baku pasal kerugian aktif sesuai standar KHES."],
    relatedClauseIds: ["pasal-kerugian"],
    explanation:
      "Kerugian materiil ditanggung pemilik modal, sedangkan pengelola merugi dalam bentuk waktu dan tenaga yang tidak berimbalan.",
    legalSourceIds: ["FATWA-MDH", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    expertReviewRequired: false,
  });

  // MDH-05: Jangka waktu dan rincian jenis usaha
  const usahaJangkaValid =
    Boolean(data.jenisUsaha?.trim()) &&
    Boolean(data.tanggalMulai) &&
    Boolean(data.tanggalBerakhir);

  const mdh05Status = usahaJangkaValid ? "PASS" : "NEEDS_INFORMATION";

  results.push({
    ruleId: "MDH-05",
    status: mdh05Status,
    severity: "warn",
    passed: usahaJangkaValid,
    message: usahaJangkaValid
      ? "Jenis usaha dan jangka waktu akad telah didefinisikan dengan baik."
      : "Sangat disarankan memperjelas rincian jenis usaha dan jangka waktu berlakunya kerja sama.",
    requirementTested: "Kejelasan lingkup amanah pengelolaan usaha",
    factsEvaluated: [`Jenis Usaha: ${data.jenisUsaha || "(kosong)"}`],
    relatedClauseIds: ["pasal-jenis-usaha"],
    explanation: "Ketentuan jenis usaha membatasi wewenang mudharib (mudharabah muqayyadah vs muthlaqah).",
    legalSourceIds: ["FATWA-MDH"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion: !usahaJangkaValid ? "Tuliskan deskripsi ringkas operasional bidang usaha yang akan dijalankan." : undefined,
    expertReviewRequired: false,
  });

  // MDH-06: Jaminan mudharib
  if (data.adaJaminan) {
    const hasJaminanDesc = Boolean(data.deskripsiJaminan?.trim());
    results.push({
      ruleId: "MDH-06",
      status: "REVIEW_REQUIRED",
      severity: "warn",
      passed: true,
      message:
        "Catatan: Jaminan Mudharib hanya sah untuk mengikat komitmen dan mencegah kelalaian/penyimpangan, bukan sebagai jaminan pengembalian modal pokok.",
      requirementTested: "Kesesuaian fungsi agunan dalam mudharabah (bukan penjaminan modal pokok)",
      factsEvaluated: [
        `Ada Jaminan: Ya`,
        `Rincian Jaminan: ${data.deskripsiJaminan || "(belum dideskripsikan)"}`,
      ],
      relatedClauseIds: ["pasal-jaminan"],
      explanation:
        "Fatwa DSN 07/2000 butir 1.4: LKS dapat meminta jaminan dari mudharib bukan untuk menjamin modal pokok, tetapi untuk mengantisipasi risiko moral hazard / wanprestasi.",
      legalSourceIds: ["FATWA-MDH"],
      sourcesVerificationStatus: "UNVERIFIED",
      unknowns: ["Penentuan batas terjadinya wanprestasi/kelalaian membutuhkan audit independen."],
      actionableSuggestion: !hasJaminanDesc
        ? "Tulis deskripsi objek jaminan dan pastikan klausul tidak mencantumkan jaminan pengembalian modal tanpa kelalaian."
        : undefined,
      expertReviewRequired: true,
      expertReviewReason: "Jaminan dalam mudharabah rawan diperdebatkan kesesuaian syariahnya jika dieksekusi saat terjadi kerugian murni pasar.",
    });
  }

  return results;
}

/**
 * Evaluasi Aturan Kepatuhan Musyarakah (MSY)
 */
export function evaluateMusyarakahRules(data: MusyarakahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MSY-01: Minimal 2 mitra dengan kontribusi modal
  const minParties =
    data.kontribusiModal &&
    data.kontribusiModal.length >= 2 &&
    data.kontribusiModal.every((k) => k.jumlah > 0);

  const msy01Status = minParties ? "PASS" : "FAIL";

  results.push({
    ruleId: "MSY-01",
    status: msy01Status,
    severity: "block",
    passed: Boolean(minParties),
    message: minParties
      ? `Terdapat ${data.kontribusiModal.length} mitra dengan kontribusi modal nyata.`
      : "Musyarakah mensyaratkan minimal 2 pihak yang masing-masing menyertakan kontribusi modal nyata.",
    requirementTested: "Penyertaan modal oleh setiap mitra (syirkah al-amwal)",
    factsEvaluated: (data.kontribusiModal || []).map(
      (k) => `${k.pihak}: Rp ${k.jumlah?.toLocaleString("id-ID") || 0}`
    ),
    relatedClauseIds: ["pasal-modal"],
    explanation: "Dalam syirkah, seluruh pihak berkedudukan sebagai mitra pemilik modal bersama.",
    legalSourceIds: ["FATWA-MSY", "KHES", "UU-PERBANKAN-SYARIAH"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion: !minParties
      ? "Pastikan setiap mitra memiliki porsi kontribusi modal yang bernilai positif."
      : undefined,
    expertReviewRequired: false,
  });

  // MSY-02: Total nisbah bagi hasil 100%
  const totalNisbah = data.nisbahBagiHasil
    ? data.nisbahBagiHasil.reduce((sum, n) => sum + Number(n.persentase || 0), 0)
    : 0;
  const nisbahValid = Math.round(totalNisbah) === 100;

  const msy02Status = nisbahValid ? "PASS" : "FAIL";

  results.push({
    ruleId: "MSY-02",
    status: msy02Status,
    severity: "block",
    passed: nisbahValid,
    message: nisbahValid
      ? `Total nisbah bagi hasil seluruh mitra tepat 100%.`
      : `Total nisbah bagi hasil seluruh mitra harus 100% (saat ini: ${totalNisbah}%).`,
    requirementTested: "Keseimbangan total porsi bagi hasil kemitraan",
    factsEvaluated: (data.nisbahBagiHasil || []).map((n) => `${n.pihak}: ${n.persentase}%`),
    relatedClauseIds: ["pasal-nisbah"],
    explanation:
      "Keuntungan dibagi sesuai nisbah yang disepakati bersama oleh seluruh mitra musyarakah.",
    legalSourceIds: ["FATWA-MSY", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion: !nisbahValid
      ? "Sesuaikan persentase nisbah antar mitra agar jumlah keseluruhannya tepat 100%."
      : undefined,
    expertReviewRequired: false,
  });

  // MSY-03: Kerugian dibagi strictly sesuai proporsi modal
  results.push({
    ruleId: "MSY-03",
    status: "PASS",
    severity: "block",
    passed: true,
    message: "Pembagian risiko kerugian diatur secara ketat sesuai proporsi kontribusi modal masing-masing mitra.",
    requirementTested: "Kaidah proporsionalitas kerugian modal (al-khasarah bi-qadri al-maal)",
    factsEvaluated: ["Klausul pasal kerugian mengunci pembagian rugi sesuai persentase setoran modal."],
    relatedClauseIds: ["pasal-kerugian"],
    explanation:
      "Ijma ulama dan Fatwa DSN 08/2000 butir 2.3 melarang pembebanan kerugian yang menyalahi proporsi modal.",
    legalSourceIds: ["FATWA-MSY", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    expertReviewRequired: false,
  });

  // MSY-04: Larangan nominal pasti
  results.push({
    ruleId: "MSY-04",
    status: "PASS",
    severity: "block",
    passed: true,
    message: "Tidak ada jaminan keuntungan nominal tetap bagi mitra mana pun.",
    requirementTested: "Larangan riba dalam pembagian laba syirkah",
    factsEvaluated: ["Laba dihitung dari perolehan laba riil periodik."],
    relatedClauseIds: ["pasal-nisbah"],
    explanation: "Pemberian fix return nominal kepada salah satu pihak membatalkan kesesuaian syariah musyarakah.",
    legalSourceIds: ["FATWA-MSY"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    expertReviewRequired: false,
  });

  // MSY-05: Pembagian wewenang pengelolaan
  const wewenangValid = Boolean(data.wewenangPengelolaan?.trim());
  const msy05Status = wewenangValid ? "PASS" : "NEEDS_INFORMATION";

  results.push({
    ruleId: "MSY-05",
    status: msy05Status,
    severity: "warn",
    passed: wewenangValid,
    message: wewenangValid
      ? "Pembagian wewenang pengelolaan usaha bersama telah diuraikan."
      : "Disarankan menguraikan secara rinci pembagian tugas dan wewenang pengelolaan antar mitra.",
    requirementTested: "Tata kelola dan pembagian tugas operasional kemitraan",
    factsEvaluated: [`Wewenang: ${data.wewenangPengelolaan || "(belum dijelaskan)"}`],
    relatedClauseIds: ["pasal-pengelolaan"],
    explanation:
      "Dalam musyarakah, masing-masing mitra berhak mengelola atau memberi mandat kepada salah satu mitra dengan porsi kerja yang jelas.",
    legalSourceIds: ["FATWA-MSY"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: ["Penentuan batas nominal transaksi yang membutuhkan izin seluruh mitra."],
    actionableSuggestion: !wewenangValid
      ? "Tuliskan uraian siapa yang bertindak sebagai penanggung jawab harian dan bagaimana keputusan strategis diambil."
      : undefined,
    expertReviewRequired: false,
  });

  return results;
}

/**
 * Evaluasi Aturan Kepatuhan Murabahah (MRB)
 */
export function evaluateMurabahahRules(data: MurabahahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MRB-01: Harga pokok dan margin terbuka; Harga Jual = Pokok + Margin
  const mathCorrect = Math.abs(data.hargaJual - (data.hargaPokok + data.marginKeuntungan)) < 1;
  const pricePositive = data.hargaPokok > 0 && data.marginKeuntungan >= 0;
  const mrb01Passed = mathCorrect && pricePositive;
  const mrb01Status = !data.hargaPokok
    ? "NEEDS_INFORMATION"
    : mrb01Passed
    ? "PASS"
    : "FAIL";

  results.push({
    ruleId: "MRB-01",
    status: mrb01Status,
    severity: "block",
    passed: mrb01Passed,
    message: mrb01Passed
      ? `Harga pokok (Rp ${data.hargaPokok.toLocaleString("id-ID")}) dan margin (Rp ${data.marginKeuntungan.toLocaleString("id-ID")}) dinyatakan transparan.`
      : "Harga jual wajib sama dengan harga pokok ditambah margin keuntungan secara transparan.",
    requirementTested: "Transparansi harga perolehan dan kepastian margin keuntungan (shighat bai' al-murabahah)",
    factsEvaluated: [
      `Harga Pokok: Rp ${data.hargaPokok?.toLocaleString("id-ID") || 0}`,
      `Margin Keuntungan: Rp ${data.marginKeuntungan?.toLocaleString("id-ID") || 0}`,
      `Harga Jual: Rp ${data.hargaJual?.toLocaleString("id-ID") || 0}`,
    ],
    relatedClauseIds: ["pasal-harga"],
    explanation:
      "Fatwa DSN 04/2000 Ketentuan Pertama butir 1 mensyaratkan penjual memberitahukan harga pokok pembelian dan margin yang disepakati secara terbuka.",
    legalSourceIds: ["FATWA-MRB", "KHES", "UU-PERBANKAN-SYARIAH"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: ["Bukti kuitansi atau faktur riil pembelian harga pokok belum diunggah."],
    actionableSuggestion: !mrb01Passed
      ? "Pastikan Harga Jual adalah hasil penjumlahan tepat antara Harga Pokok dan Margin Keuntungan."
      : undefined,
    expertReviewRequired: false,
  });

  // MRB-02: Kejelasan jenis, spesifikasi, dan jumlah barang
  const itemValid =
    Boolean(data.jenisBarang?.trim()) &&
    Boolean(data.spesifikasiBarang?.trim()) &&
    data.jumlahBarang > 0;

  const mrb02Status = itemValid ? "PASS" : "NEEDS_INFORMATION";

  results.push({
    ruleId: "MRB-02",
    status: mrb02Status,
    severity: "block",
    passed: itemValid,
    message: itemValid
      ? `Objek barang dinyatakan spesifik: ${data.jumlahBarang} ${data.satuanBarang || "unit"} ${data.jenisBarang}.`
      : "Barang yang diperjualbelikan harus jelas jenis, spesifikasi mutu, dan jumlah kuantitasnya.",
    requirementTested: "Kejelasan objek transaksi jual beli untuk mencegah cacat gharar",
    factsEvaluated: [
      `Jenis: ${data.jenisBarang || "(kosong)"}`,
      `Spesifikasi: ${data.spesifikasiBarang || "(kosong)"}`,
      `Kuantitas: ${data.jumlahBarang || 0} ${data.satuanBarang || "unit"}`,
    ],
    relatedClauseIds: ["pasal-objek"],
    explanation:
      "KHES Pasal 118 dan fiqih muamalah mensyaratkan objek jual beli harus jelas kuantitas, kualitas, dan cirinya agar tidak menimbulkan sengketa.",
    legalSourceIds: ["FATWA-MRB", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [
      "Kondisi fisik barang bebas dari cacat tersembunyi (khiyar aib) memerlukan inspeksi fisik langsung oleh pembeli.",
    ],
    actionableSuggestion: !itemValid
      ? "Lengkapi nama barang, spesifikasi teknis/merek/kondisi, serta jumlah dan satuan kuantitas."
      : undefined,
    expertReviewRequired: false,
  });

  // MRB-03: Penguasaan barang sebelum jual beli atau adanya klausul Wakalah
  const possessionValid = Boolean(data.barangDimiliki || data.adaWakalah);
  let mrb03Status: "PASS" | "FAIL" | "REVIEW_REQUIRED" = "PASS";
  let mrb03Msg = "";

  if (!possessionValid) {
    mrb03Status = "FAIL";
    mrb03Msg =
      "Penjual wajib menguasai barang atau membuat klausul kuasa pembelian (wakalah) sebelum akad jual beli ditandatangani.";
  } else if (data.barangDimiliki) {
    mrb03Status = "PASS";
    mrb03Msg = "Barang telah dimiliki dan dikuasai oleh penjual sebelum penyerahan.";
  } else {
    // Ada wakalah
    mrb03Status = "PASS";
    mrb03Msg = "Pengadaan barang dikuasakan melalui klausul Wakalah yang sah sebelum akad efektif.";
  }

  results.push({
    ruleId: "MRB-03",
    status: mrb03Status,
    severity: "block",
    passed: possessionValid,
    message: mrb03Msg,
    requirementTested: "Larangan menjual barang yang belum dimiliki (bai' ma laisa 'indak)",
    factsEvaluated: [
      `Barang sudah dimiliki penjual: ${data.barangDimiliki ? "Ya" : "Tidak"}`,
      `Klausul Wakalah disertakan: ${data.adaWakalah ? "Ya" : "Tidak"}`,
    ],
    relatedClauseIds: ["pasal-objek", "pasal-wakalah"],
    explanation:
      "Fatwa DSN 04/2000 butir 1.1 menyatakan barang yang diperjualbelikan harus sudah menjadi milik penjual, atau melalui akad wakalah terpisah.",
    legalSourceIds: ["FATWA-MRB", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: data.adaWakalah
      ? ["Penyerahan faktur pembelian oleh penerima kuasa sebelum barang dialihkan belum diverifikasi."]
      : [],
    actionableSuggestion: !possessionValid
      ? "Centang opsi bahwa barang telah dimiliki penjual, atau pilih opsi sertakan akad Wakalah bila pengadaan barang dikuasakan."
      : undefined,
    expertReviewRequired: data.adaWakalah,
    expertReviewReason: data.adaWakalah
      ? "Penggunaan wakalah dalam murabahah memerlukan penegasan bahwa akad murabahah baru mengikat setelah barang dibeli penerima kuasa."
      : undefined,
  });

  // MRB-04: Margin bersifat tetap
  results.push({
    ruleId: "MRB-04",
    status: "PASS",
    severity: "block",
    passed: true,
    message: "Margin keuntungan bersifat tetap (fixed) dan tidak bertambah seiring waktu/keterlambatan.",
    requirementTested: "Sifat margin keuntungan yang mengikat dan tidak berbunga",
    factsEvaluated: ["Klausul harga mengunci margin keuntungan tidak dapat dinaikkan sepihak."],
    relatedClauseIds: ["pasal-harga"],
    explanation:
      "Fatwa DSN 04/2000 melarang pertambahan harga jual akibat perpanjangan masa angsuran yang menyerupai riba jahiliyyah.",
    legalSourceIds: ["FATWA-MRB"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    expertReviewRequired: false,
  });

  // MRB-05: Jadwal Angsuran untuk Pembayaran Tangguh
  let installmentValid = true;
  if (data.pembayaranTangguh) {
    installmentValid = Boolean(data.jumlahAngsuran && data.jumlahAngsuran > 0);
  }

  const mrb05Status = installmentValid ? "PASS" : "NEEDS_INFORMATION";

  results.push({
    ruleId: "MRB-05",
    status: mrb05Status,
    severity: "warn",
    passed: installmentValid,
    message: installmentValid
      ? data.pembayaranTangguh
        ? `Jadwal pembayaran dicicil sebanyak ${data.jumlahAngsuran} kali angsuran.`
        : "Pembayaran dilakukan secara tunai."
      : "Untuk pembayaran tangguh/cicil, mohon tentukan jumlah frekuensi angsuran.",
    requirementTested: "Kepastian masa jatuh tempo pembayaran (ajl ma'lum)",
    factsEvaluated: [
      `Metode: ${data.pembayaranTangguh ? "Tangguh/Angsuran" : "Tunai"}`,
      data.pembayaranTangguh ? `Jumlah Angsuran: ${data.jumlahAngsuran || 0} bulan` : "Tunai sekaligus",
    ],
    relatedClauseIds: ["pasal-pembayaran"],
    explanation: "Jual beli cicilan wajib memuat batas waktu pembayaran yang pasti guna menghindari perselisihan.",
    legalSourceIds: ["FATWA-MRB"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: [],
    actionableSuggestion: !installmentValid
      ? "Tentukan jumlah frekuensi angsuran (misalnya 6, 12, atau 24 bulan)."
      : undefined,
    expertReviewRequired: false,
  });

  // MRB-06: Sanksi Ta'zir Keterlambatan dialokasikan untuk Dana Sosial
  if (data.adaDenda) {
    results.push({
      ruleId: "MRB-06",
      status: "REVIEW_REQUIRED",
      severity: "warn",
      passed: true,
      message:
        "Denda keterlambatan dicantumkan secara tegas sebagai dana sosial (ta'zir), bukan pendapatan komersial penjual.",
      requirementTested: "Penyaluran sanksi ta'zir murni ke pos kebajikan sosial",
      factsEvaluated: [
        `Klausul Denda: Aktif`,
        `Besaran: Rp ${data.jumlahDenda?.toLocaleString("id-ID") || 0}/hari`,
        `Peruntukan: Kas Sosial / Qardhul Hasan`,
      ],
      relatedClauseIds: ["pasal-denda"],
      explanation:
        "Fatwa DSN-MUI No. 17/DSN-MUI/IX/2000 menegaskan denda hanya boleh dikenakan kepada nasabah mampu yang sengaja menunda dan wajib disalurkan untuk dana sosial.",
      legalSourceIds: ["FATWA-MRB", "FATWA-17-TAZIR"],
      sourcesVerificationStatus: "UNVERIFIED",
      unknowns: [
        "Status kemampuan keuangan debitur saat wanprestasi terjadi belum dapat dinilai di awal (debitur kesulitan/mu'sir tidak boleh didenda).",
      ],
      actionableSuggestion: "Pastikan penerima dana sosial dicatat dalam pertanggungjawaban terpisah dari pembukuan usaha.",
      expertReviewRequired: true,
      expertReviewReason:
        "Klausul denda harus dipastikan tidak diterapkan bila keterlambatan disebabkan keadaan memaksa (force majeure) atau debitur pailit.",
    });
  }

  // MRB-07 (NOT_CHECKED): Pemeriksaan Fisik Barang Riil
  results.push({
    ruleId: "MRB-07",
    status: "NOT_CHECKED",
    severity: "info",
    passed: true,
    message: "Kondisi fisik, kelayakan pakai, dan penerimaan barang nyata (qabdh) di lokasi belum diperiksa sistem.",
    requirementTested: "Penyerahan fisik objek jual beli (al-qabdh al-haqiqi / al-hukmi)",
    factsEvaluated: ["Sistem hanya memvalidasi deskripsi teks dan nominal transaksi."],
    relatedClauseIds: ["pasal-objek"],
    explanation: "Keabsahan pemindahan hak milik dalam jual beli memerlukan serah terima nyata antara penjual dan pembeli.",
    legalSourceIds: ["FATWA-MRB", "KHES"],
    sourcesVerificationStatus: "UNVERIFIED",
    unknowns: ["Kesesuaian fisik barang dengan dokumen pada saat serah terima."],
    actionableSuggestion: "Para pihak wajib membuat Berita Acara Serah Terima (BAST) fisik saat penyerahan barang.",
    expertReviewRequired: false,
  });

  return results;
}

/**
 * Fungsi utama untuk mengevaluasi semua aturan kepatuhan
 */
export function evaluateCompliance(data: AkadFormData): ComplianceSummary {
  const generalResults = evaluateGeneralRules(data);
  let specificResults: ComplianceResult[] = [];

  if (data.jenisAkad === "mudharabah") {
    specificResults = evaluateMudharabahRules(data as MudharabahFormData);
  } else if (data.jenisAkad === "musyarakah") {
    specificResults = evaluateMusyarakahRules(data as MusyarakahFormData);
  } else if (data.jenisAkad === "murabahah") {
    specificResults = evaluateMurabahahRules(data as MurabahahFormData);
  }

  const allResults = [...generalResults, ...specificResults];

  const passCount = allResults.filter((r) => r.status === "PASS").length;
  const failCount = allResults.filter((r) => r.status === "FAIL").length;
  const needsInfoCount = allResults.filter((r) => r.status === "NEEDS_INFORMATION").length;
  const reviewReqCount = allResults.filter((r) => r.status === "REVIEW_REQUIRED").length;
  const notCheckedCount = allResults.filter((r) => r.status === "NOT_CHECKED").length;

  const blockCount = allResults.filter((r) => r.severity === "block" && r.status === "FAIL").length;
  const warningCount = allResults.filter(
    (r) => r.severity === "warn" && (r.status === "FAIL" || r.status === "NEEDS_INFORMATION")
  ).length;
  const infoCount = allResults.filter((r) => r.severity === "info" || r.status === "NOT_CHECKED").length;

  // Has blocking errors jika ada aturan berstatus FAIL dengan severity block atau data vital kurang
  const hasBlockingErrors = blockCount > 0;

  return {
    results: allResults,
    hasBlockingErrors,
    passedCount: passCount,
    warningCount,
    blockCount,
    infoCount,
    statusCounts: {
      pass: passCount,
      fail: failCount,
      needsInformation: needsInfoCount,
      reviewRequired: reviewReqCount,
      notChecked: notCheckedCount,
    },
    rulesVersion: RULES_VERSION,
    disclaimer: COMPLIANCE_DISCLAIMER,
  };
}
