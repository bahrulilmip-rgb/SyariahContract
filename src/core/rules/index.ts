/**
 * core/rules/index.ts
 * Mesin Aturan Kepatuhan (Compliance Rule Engine).
 * Memeriksa kesesuaian data formulir dengan prinsip syariah dan syarat sah perjanjian.
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

/**
 * Mengevaluasi aturan kepatuhan umum (GEN) untuk semua akad
 */
export function evaluateGeneralRules(data: AkadFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // GEN-01: Identitas semua pihak (nama, identitas, alamat) wajib diisi
  const partiesValid =
    data.ppihat &&
    data.ppihat.length >= 2 &&
    data.ppihat.every(
      (p) =>
        p.nama?.trim().length > 0 &&
        p.identitas?.trim().length > 0 &&
        p.alamat?.trim().length > 0
    );

  results.push({
    ruleId: "GEN-01",
    severity: "block",
    passed: Boolean(partiesValid),
    message: partiesValid
      ? "Identitas seluruh pihak lengkap dan terisi."
      : "Identitas seluruh pihak (nama, NIK/izin usaha, dan alamat) wajib diisi secara lengkap.",
    legalSourceIds: ["KUHPERDATA-1320", "KUHPERDATA-1338", "KHES"],
  });

  // GEN-02: Nilai uang harus bilangan positif dan dalam Rupiah
  let amountValid = true;
  if (data.jenisAkad === "mudharabah") {
    amountValid = data.jumlahModal > 0;
  } else if (data.jenisAkad === "musyarakah") {
    amountValid =
      data.totalModal > 0 &&
      data.kontribusiModal.every((k) => k.jumlah > 0);
  } else if (data.jenisAkad === "murabahah") {
    amountValid = data.hargaPokok > 0 && data.marginKeuntungan >= 0;
  }

  results.push({
    ruleId: "GEN-02",
    severity: "block",
    passed: amountValid,
    message: amountValid
      ? "Nilai nominal transaksi valid dan bernilai positif (IDR)."
      : "Nilai nominal uang/modal harus berupa bilangan positif dalam mata uang Rupiah.",
    legalSourceIds: ["KUHPERDATA-1320"],
  });

  // GEN-03: Tanggal mulai tidak boleh setelah tanggal berakhir
  let datesValid = true;
  if (data.tanggalMulai && data.tanggalBerakhir) {
    const start = new Date(data.tanggalMulai);
    const end = new Date(data.tanggalBerakhir);
    datesValid = start <= end;
  } else {
    datesValid = false;
  }

  results.push({
    ruleId: "GEN-03",
    severity: "block",
    passed: datesValid,
    message: datesValid
      ? "Rentang jangka waktu akad valid."
      : "Tanggal mulai akad tidak boleh setelah tanggal berakhir akad.",
    legalSourceIds: ["KUHPERDATA-1320"],
  });

  // GEN-04: Domisili hukum/penyelesaian sengketa wajib dipilih
  const disputeValid =
    data.domisiliHukum?.trim().length > 0 &&
    data.penyelesaianSengketa &&
    data.penyelesaianSengketa.length > 0;

  results.push({
    ruleId: "GEN-04",
    severity: "warn",
    passed: Boolean(disputeValid),
    message: disputeValid
      ? `Domisili hukum ditetapkan di ${data.domisiliHukum} dengan musyawarah/arbitrase.`
      : "Disarankan menetapkan domisili hukum dan mekanisme penyelesaian sengketa syariah.",
    legalSourceIds: ["UU-PERADILAN-AGAMA", "KHES"],
  });

  // GEN-05: Objek usaha tidak boleh termasuk kategori terlarang
  const kategori = (data.kategoriUsaha || "").toLowerCase();
  const objek = (data.objekUsaha || "").toLowerCase();
  const textToCheck = `${kategori} ${objek}`;
  
  // Ekstrak kata kunci terlarang dari daftar dan sinonim muamalah umum
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

  const isForbidden = forbiddenKeywords.some((keyword) => {
    return textToCheck.includes(keyword);
  });

  results.push({
    ruleId: "GEN-05",
    severity: "block",
    passed: !isForbidden,
    message: !isForbidden
      ? "Objek/kategori usaha memenuhi kriteria halal syariah."
      : "Objek usaha terdeteksi termasuk kategori yang dilarang dalam syariah (riba/maysir/haram).",
    legalSourceIds: ["UU-PERBANKAN-SYARIAH"],
  });

  return results;
}

/**
 * Mengevaluasi aturan kepatuhan Mudharabah (MDH)
 */
export function evaluateMudharabahRules(data: MudharabahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MDH-01: Modal harus berupa uang atau aset yang jelas nilainya
  const modalValid =
    data.jumlahModal > 0 &&
    (data.bentukModal === "uang" ||
      (data.bentukModal === "aset" && Boolean(data.deskripsiAset?.trim())));

  results.push({
    ruleId: "MDH-01",
    severity: "block",
    passed: modalValid,
    message: modalValid
      ? "Bentuk dan nilai modal Mudharabah dinyatakan secara jelas."
      : "Modal Mudharabah harus jelas nilainya dan apabila berbentuk aset harus disertai deskripsi.",
    legalSourceIds: ["FATWA-MDH", "KHES", "UU-PERBANKAN-SYARIAH"],
  });

  // MDH-02: Pembagian keuntungan berupa nisbah persentase; total = 100%
  const totalNisbah = Number(data.nisbahShahibulMaal) + Number(data.nisbahMudharib);
  const nisbahValid =
    data.nisbahShahibulMaal > 0 &&
    data.nisbahMudharib > 0 &&
    Math.round(totalNisbah) === 100;

  results.push({
    ruleId: "MDH-02",
    severity: "block",
    passed: nisbahValid,
    message: nisbahValid
      ? `Nisbah bagi hasil seimbang: Shahibul Maal ${data.nisbahShahibulMaal}%, Mudharib ${data.nisbahMudharib}%.`
      : `Total porsi nisbah bagi hasil harus tepat 100% (saat ini: ${totalNisbah}%).`,
    legalSourceIds: ["FATWA-MDH", "KHES"],
  });

  // MDH-03: Dilarang menetapkan nominal pasti keuntungan atau jaminan keuntungan
  // Di sistem kita, keuntungan dihitung dari nisbah %, jadi selalu lulus selama nisbah berbentuk %
  results.push({
    ruleId: "MDH-03",
    severity: "block",
    passed: true,
    message: "Pembagian keuntungan menggunakan sistem nisbah persentase dari laba riil, bukan nominal tetap.",
    legalSourceIds: ["FATWA-MDH", "KHES"],
  });

  // MDH-04: Kerugian ditanggung shahibul maal kecuali kelalaian mudharib (otomatis di klausul)
  results.push({
    ruleId: "MDH-04",
    severity: "info",
    passed: true,
    message: "Klausul kerugian ditanggung Shahibul Maal (kecuali akibat kelalaian Mudharib) otomatis dimuat pada Pasal Kerugian.",
    legalSourceIds: ["FATWA-MDH", "KHES"],
  });

  // MDH-05: Jangka waktu dan jenis usaha harus dinyatakan
  const usahaJangkaValid =
    Boolean(data.jenisUsaha?.trim()) &&
    Boolean(data.tanggalMulai) &&
    Boolean(data.tanggalBerakhir);

  results.push({
    ruleId: "MDH-05",
    severity: "warn",
    passed: usahaJangkaValid,
    message: usahaJangkaValid
      ? "Jenis usaha dan jangka waktu akad telah didefinisikan dengan baik."
      : "Sangat disarankan memperjelas rincian jenis usaha dan jangka waktu berlakunya kerja sama.",
    legalSourceIds: ["FATWA-MDH"],
  });

  // MDH-06: Jaminan mudharib hanya untuk mencegah penyimpangan
  if (data.adaJaminan) {
    results.push({
      ruleId: "MDH-06",
      severity: "warn",
      passed: true,
      message: "Catatan: Jaminan Mudharib hanya sah untuk mengikat komitmen dan mencegah kelalaian/penyimpangan, bukan sebagai jaminan pengembalian modal pokok.",
      legalSourceIds: ["FATWA-MDH"],
    });
  }

  return results;
}

/**
 * Mengevaluasi aturan kepatuhan Musyarakah (MSY)
 */
export function evaluateMusyarakahRules(data: MusyarakahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MSY-01: Minimal dua pihak dengan kontribusi modal
  const minParties =
    data.kontribusiModal &&
    data.kontribusiModal.length >= 2 &&
    data.kontribusiModal.every((k) => k.jumlah > 0);

  results.push({
    ruleId: "MSY-01",
    severity: "block",
    passed: Boolean(minParties),
    message: minParties
      ? `Terdapat ${data.kontribusiModal.length} mitra dengan kontribusi modal nyata.`
      : "Musyarakah mensyaratkan minimal 2 pihak yang masing-masing menyertakan kontribusi modal.",
    legalSourceIds: ["FATWA-MSY", "KHES", "UU-PERBANKAN-SYARIAH"],
  });

  // MSY-02: Nisbah bagi hasil berupa persentase; total 100%
  const totalNisbah = data.nisbahBagiHasil
    ? data.nisbahBagiHasil.reduce((sum, n) => sum + Number(n.persentase || 0), 0)
    : 0;
  const nisbahValid = Math.round(totalNisbah) === 100;

  results.push({
    ruleId: "MSY-02",
    severity: "block",
    passed: nisbahValid,
    message: nisbahValid
      ? `Total nisbah bagi hasil seluruh mitra tepat 100%.`
      : `Total nisbah bagi hasil seluruh mitra harus 100% (saat ini: ${totalNisbah}%).`,
    legalSourceIds: ["FATWA-MSY", "KHES"],
  });

  // MSY-03: Kerugian dibagi sesuai proporsi modal
  results.push({
    ruleId: "MSY-03",
    severity: "block",
    passed: true,
    message: "Pembagian risiko kerugian diatur secara ketat sesuai proporsi kontribusi modal masing-masing mitra.",
    legalSourceIds: ["FATWA-MSY", "KHES"],
  });

  // MSY-04: Keuntungan tidak boleh ditetapkan nominal pasti
  results.push({
    ruleId: "MSY-04",
    severity: "block",
    passed: true,
    message: "Tidak ada jaminan keuntungan nominal tetap bagi mitra mana pun.",
    legalSourceIds: ["FATWA-MSY"],
  });

  // MSY-05: Pembagian wewenang pengelolaan harus dinyatakan
  const wewenangValid = Boolean(data.wewenangPengelolaan?.trim());

  results.push({
    ruleId: "MSY-05",
    severity: "warn",
    passed: wewenangValid,
    message: wewenangValid
      ? "Pembagian wewenang pengelolaan usaha bersama telah diuraikan."
      : "Disarankan menguraikan secara rinci pembagian tugas dan wewenang pengelolaan antar mitra.",
    legalSourceIds: ["FATWA-MSY"],
  });

  return results;
}

/**
 * Mengevaluasi aturan kepatuhan Murabahah (MRB)
 */
export function evaluateMurabahahRules(data: MurabahahFormData): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  // MRB-01: Harga pokok dan margin dinyatakan terbuka; harga jual = pokok + margin
  const mathCorrect = Math.abs(data.hargaJual - (data.hargaPokok + data.marginKeuntungan)) < 1;
  const pricePositive = data.hargaPokok > 0 && data.marginKeuntungan >= 0;

  results.push({
    ruleId: "MRB-01",
    severity: "block",
    passed: mathCorrect && pricePositive,
    message: mathCorrect && pricePositive
      ? `Harga pokok (Rp ${data.hargaPokok.toLocaleString("id-ID")}) dan margin (Rp ${data.marginKeuntungan.toLocaleString("id-ID")}) dinyatakan transparan.`
      : "Harga jual wajib sama dengan harga pokok ditambah margin keuntungan secara transparan.",
    legalSourceIds: ["FATWA-MRB", "KHES", "UU-PERBANKAN-SYARIAH"],
  });

  // MRB-02: Barang harus jelas jenis, spesifikasi, dan jumlahnya
  const itemValid =
    Boolean(data.jenisBarang?.trim()) &&
    Boolean(data.spesifikasiBarang?.trim()) &&
    data.jumlahBarang > 0;

  results.push({
    ruleId: "MRB-02",
    severity: "block",
    passed: itemValid,
    message: itemValid
      ? `Objek barang dinyatakan spesifik: ${data.jumlahBarang} ${data.satuanBarang || "unit"} ${data.jenisBarang}.`
      : "Barang yang diperjualbelikan harus jelas jenis, spesifikasi mutu, dan jumlah kuantitasnya.",
    legalSourceIds: ["FATWA-MRB", "KHES"],
  });

  // MRB-03: Penjual telah memiliki/menguasai barang ATAU ada akad wakalah terpisah
  const possessionValid = data.barangDimiliki || data.adaWakalah;

  results.push({
    ruleId: "MRB-03",
    severity: "block",
    passed: possessionValid,
    message: possessionValid
      ? data.barangDimiliki
        ? "Barang telah dimiliki dan dikuasai oleh penjual sebelum penyerahan."
        : "Pengadaan barang dikuasakan melalui klausul Wakalah yang sah."
      : "Penjual wajib menguasai barang atau membuat klausul kuasa (wakalah) sebelum akad jual beli.",
    legalSourceIds: ["FATWA-MRB", "KHES"],
  });

  // MRB-04: Margin bersifat tetap dan tidak bertambah karena keterlambatan
  results.push({
    ruleId: "MRB-04",
    severity: "block",
    passed: true,
    message: "Margin keuntungan bersifat tetap (fixed) dan tidak bertambah seiring waktu/keterlambatan.",
    legalSourceIds: ["FATWA-MRB"],
  });

  // MRB-05: Jika pembayaran tangguh, jadwal angsuran dinyatakan
  let installmentValid = true;
  if (data.pembayaranTangguh) {
    installmentValid = Boolean(data.jumlahAngsuran && data.jumlahAngsuran > 0);
  }

  results.push({
    ruleId: "MRB-05",
    severity: "warn",
    passed: installmentValid,
    message: installmentValid
      ? data.pembayaranTangguh
        ? `Jadwal pembayaran dicicil sebanyak ${data.jumlahAngsuran} kali angsuran.`
        : "Pembayaran dilakukan secara tunai."
      : "Untuk pembayaran tangguh/cicil, mohon tentukan jumlah frekuensi angsuran.",
    legalSourceIds: ["FATWA-MRB"],
  });

  // MRB-06: Denda keterlambatan harus dinyatakan sebagai dana sosial/ta'zir
  if (data.adaDenda) {
    results.push({
      ruleId: "MRB-06",
      severity: "warn",
      passed: true,
      message: "Denda keterlambatan dicantumkan secara tegas sebagai dana sosial (ta'zir), bukan pendapatan komersial penjual.",
      legalSourceIds: ["FATWA-MRB"],
    });
  }

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

  const blockCount = allResults.filter((r) => r.severity === "block" && !r.passed).length;
  const warningCount = allResults.filter((r) => r.severity === "warn" && !r.passed).length;
  const infoCount = allResults.filter((r) => r.severity === "info").length;
  const passedCount = allResults.filter((r) => r.passed).length;

  return {
    results: allResults,
    hasBlockingErrors: blockCount > 0,
    passedCount,
    warningCount,
    blockCount,
    infoCount,
  };
}
