/**
 * tests/core/rules_and_generator.test.ts
 * Unit tests untuk Mesin Aturan Kepatuhan dan Generator Draf Dokumen.
 */

import { describe, it, expect } from "vitest";
import {
  evaluateCompliance,
  evaluateGeneralRules,
  evaluateMudharabahRules,
  evaluateMusyarakahRules,
  evaluateMurabahahRules,
} from "@/core/rules";
import {
  generateDraft,
  terbilang,
  substituteVariables,
  formatRupiah,
} from "@/core/generator";
import type {
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
} from "@/core/types";

describe("Helper: terbilang & formatRupiah", () => {
  it("mengonversi angka 0 hingga milyaran dengan benar", () => {
    expect(terbilang(100).trim()).toBe("seratus");
    expect(terbilang(1000).trim()).toBe("seribu");
    expect(terbilang(2500000).trim()).toBe("dua juta lima ratus ribu");
    expect(terbilang(100000000).trim()).toBe("seratus juta");
  });

  it("format Rupiah dengan separator ribuan", () => {
    expect(formatRupiah(1000000)).toBe("1.000.000");
  });
});

describe("Helper: substituteVariables", () => {
  it("mengganti placeholder sederhana", () => {
    const res = substituteVariables("Halo {{nama}}, nomor {{id}}", {
      nama: "Ahmad",
      id: "123",
    });
    expect(res).toBe("Halo Ahmad, nomor 123");
  });

  it("menangani conditional {{#cond}}...{{/cond}}", () => {
    const template = "{{#ada}}Tampil jika ada{{/ada}}{{^ada}}Tampil jika tidak ada{{/ada}}";
    expect(substituteVariables(template, { ada: "true" })).toBe("Tampil jika ada");
    expect(substituteVariables(template, { ada: "false" })).toBe("Tampil jika tidak ada");
  });
});

describe("Mesin Aturan: Mudharabah (MDH)", () => {
  const validMudharabah: MudharabahFormData = {
    jenisAkad: "mudharabah",
    ppihat: [
      {
        nama: "Ahmad",
        identitas: "3301010101010001",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "shahibul_maal",
      },
      {
        nama: "Budi",
        identitas: "3301010101010002",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "mudharib",
      },
    ],
    saksi: [
      { nama: "Saksi 1", identitas: "111", alamat: "Semarang" },
      { nama: "Saksi 2", identitas: "222", alamat: "Semarang" },
    ],
    tanggalMulai: "2026-01-01",
    tanggalBerakhir: "2026-12-31",
    objekUsaha: "Kedai Kopi Barokah",
    kategoriUsaha: "Kuliner",
    domisiliHukum: "Pengadilan Agama Semarang",
    penyelesaianSengketa: ["musyawarah", "pengadilan_agama"],
    jumlahModal: 50000000,
    bentukModal: "uang",
    nisbahShahibulMaal: 60,
    nisbahMudharib: 40,
    jenisUsaha: "Kedai Kopi",
    adaJaminan: false,
  };

  it("data valid lulus seluruh aturan block", () => {
    const summary = evaluateCompliance(validMudharabah);
    expect(summary.hasBlockingErrors).toBe(false);
    expect(summary.blockCount).toBe(0);
  });

  it("menolak jika nisbah tidak berjumlah 100% (MDH-02)", () => {
    const invalid = { ...validMudharabah, nisbahShahibulMaal: 60, nisbahMudharib: 50 };
    const res = evaluateMudharabahRules(invalid);
    const mdh02 = res.find((r) => r.ruleId === "MDH-02");
    expect(mdh02?.passed).toBe(false);
    expect(mdh02?.severity).toBe("block");
  });

  it("menolak jika objek usaha terlarang (GEN-05)", () => {
    const forbidden = { ...validMudharabah, kategoriUsaha: "Minuman Keras / Alkohol" };
    const res = evaluateGeneralRules(forbidden);
    const gen05 = res.find((r) => r.ruleId === "GEN-05");
    expect(gen05?.passed).toBe(false);
    expect(gen05?.severity).toBe("block");
  });

  it("menolak jika tanggal mulai setelah tanggal berakhir (GEN-03)", () => {
    const invalidDate = {
      ...validMudharabah,
      tanggalMulai: "2026-12-31",
      tanggalBerakhir: "2026-01-01",
    };
    const res = evaluateGeneralRules(invalidDate);
    const gen03 = res.find((r) => r.ruleId === "GEN-03");
    expect(gen03?.passed).toBe(false);
    expect(gen03?.severity).toBe("block");
  });
});

describe("Mesin Aturan: Musyarakah (MSY)", () => {
  const validMusyarakah: MusyarakahFormData = {
    jenisAkad: "musyarakah",
    ppihat: [
      {
        nama: "Mitra A",
        identitas: "3301010101010001",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "syarik",
      },
      {
        nama: "Mitra B",
        identitas: "3301010101010002",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "syarik",
      },
    ],
    saksi: [],
    tanggalMulai: "2026-01-01",
    tanggalBerakhir: "2026-12-31",
    objekUsaha: "Percetakan Berkah",
    kategoriUsaha: "Percetakan",
    domisiliHukum: "Semarang",
    penyelesaianSengketa: ["musyawarah"],
    kontribusiModal: [
      { pihak: "Mitra A", jumlah: 50000000 },
      { pihak: "Mitra B", jumlah: 50000000 },
    ],
    totalModal: 100000000,
    nisbahBagiHasil: [
      { pihak: "Mitra A", persentase: 50 },
      { pihak: "Mitra B", persentase: 50 },
    ],
    wewenangPengelolaan: "Pengelolaan operasional bersama",
  };

  it("lulus jika nisbah total 100% dan minimal 2 mitra", () => {
    const summary = evaluateCompliance(validMusyarakah);
    expect(summary.hasBlockingErrors).toBe(false);
  });

  it("gagal jika nisbah tidak 100% (MSY-02)", () => {
    const invalid = {
      ...validMusyarakah,
      nisbahBagiHasil: [
        { pihak: "Mitra A", persentase: 60 },
        { pihak: "Mitra B", persentase: 30 },
      ],
    };
    const res = evaluateMusyarakahRules(invalid);
    const msy02 = res.find((r) => r.ruleId === "MSY-02");
    expect(msy02?.passed).toBe(false);
  });
});

describe("Mesin Aturan: Murabahah (MRB)", () => {
  const validMurabahah: MurabahahFormData = {
    jenisAkad: "murabahah",
    ppihat: [
      {
        nama: "Penjual A",
        identitas: "3301010101010001",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "penjual",
      },
      {
        nama: "Pembeli B",
        identitas: "3301010101010002",
        jenisIdentitas: "NIK",
        alamat: "Semarang",
        peran: "pembeli",
      },
    ],
    saksi: [],
    tanggalMulai: "2026-01-01",
    tanggalBerakhir: "2026-12-31",
    objekUsaha: "Pengadaan Mesin Kopi",
    kategoriUsaha: "Peralatan",
    domisiliHukum: "Semarang",
    penyelesaianSengketa: ["musyawarah"],
    jenisBarang: "Mesin Espresso 2 Group",
    spesifikasiBarang: "Merk Nuova Simonelli Appia II",
    jumlahBarang: 1,
    satuanBarang: "unit",
    hargaPokok: 40000000,
    marginKeuntungan: 5000000,
    hargaJual: 45000000,
    pembayaranTangguh: true,
    jumlahAngsuran: 10,
    barangDimiliki: true,
    adaWakalah: false,
    adaDenda: false,
  };

  it("lulus jika harga jual = pokok + margin (MRB-01)", () => {
    const summary = evaluateCompliance(validMurabahah);
    expect(summary.hasBlockingErrors).toBe(false);
  });

  it("gagal jika harga jual tidak cocok dengan pokok + margin (MRB-01)", () => {
    const invalid = { ...validMurabahah, hargaJual: 50000000 }; // Harusnya 45000000
    const res = evaluateMurabahahRules(invalid);
    const mrb01 = res.find((r) => r.ruleId === "MRB-01");
    expect(mrb01?.passed).toBe(false);
  });
});

describe("Generator: generateDraft", () => {
  it("menghasilkan draf dokumen deterministik lengkap dengan klausul dan disklaimer", () => {
    const validMudharabah: MudharabahFormData = {
      jenisAkad: "mudharabah",
      ppihat: [
        {
          nama: "Ahmad Dahlan",
          identitas: "3301010101010001",
          jenisIdentitas: "NIK",
          alamat: "Semarang",
          peran: "shahibul_maal",
        },
        {
          nama: "Budi Santoso",
          identitas: "3301010101010002",
          jenisIdentitas: "NIK",
          alamat: "Kudus",
          peran: "mudharib",
        },
      ],
      saksi: [
        { nama: "Hasan", identitas: "111", alamat: "Semarang" },
        { nama: "Husin", identitas: "222", alamat: "Semarang" },
      ],
      tanggalMulai: "2026-01-01",
      tanggalBerakhir: "2026-12-31",
      objekUsaha: "Kedai Kopi",
      kategoriUsaha: "Kuliner",
      domisiliHukum: "Semarang",
      penyelesaianSengketa: ["musyawarah", "pengadilan_agama"],
      jumlahModal: 50000000,
      bentukModal: "uang",
      nisbahShahibulMaal: 60,
      nisbahMudharib: 40,
      jenisUsaha: "Kedai Kopi",
      adaJaminan: false,
    };

    const draft = generateDraft(validMudharabah);
    expect(draft.judul).toContain("AKAD MUDHARABAH");
    expect(draft.klausul.length).toBeGreaterThan(5);
    expect(draft.disklaimer).toContain("bukan nasihat hukum");
    expect(draft.kepatuhan.hasBlockingErrors).toBe(false);

    // Cek ada pasal nisbah
    const nisbahClause = draft.klausul.find((c) => c.judul.toLowerCase().includes("nisbah"));
    expect(nisbahClause).toBeDefined();
    expect(nisbahClause?.teks).toContain("60%");
    expect(nisbahClause?.teks).toContain("40%");
    expect(nisbahClause?.purpose).toBeDefined();
  });
});

describe("Pemeriksaan Kepatuhan Berbasis Aturan Terstruktur (Structured Statuses)", () => {
  const baseMurabahah: MurabahahFormData = {
    jenisAkad: "murabahah",
    ppihat: [
      { nama: "Penjual", identitas: "123", jenisIdentitas: "NIK", alamat: "Semarang", peran: "penjual" },
      { nama: "Pembeli", identitas: "456", jenisIdentitas: "NIK", alamat: "Kudus", peran: "pembeli" },
    ],
    saksi: [],
    tanggalMulai: "2026-01-01",
    tanggalBerakhir: "2026-12-31",
    objekUsaha: "Pengadaan Mesin",
    kategoriUsaha: "Elektronik",
    domisiliHukum: "Semarang",
    penyelesaianSengketa: ["musyawarah", "pengadilan_agama"],
    jenisBarang: "Mesin Cetak",
    spesifikasiBarang: "Kondisi Baru",
    jumlahBarang: 1,
    satuanBarang: "unit",
    hargaPokok: 10000000,
    marginKeuntungan: 2000000,
    hargaJual: 12000000,
    pembayaranTangguh: true,
    jumlahAngsuran: 6,
    barangDimiliki: true,
    adaWakalah: false,
    adaDenda: false,
  };

  it("menghasilkan status PASS untuk data yang memenuhi syarat spesifik", () => {
    const summary = evaluateCompliance(baseMurabahah);
    expect(summary.statusCounts?.pass).toBeGreaterThan(0);
    const mrb01 = summary.results.find((r) => r.ruleId === "MRB-01");
    expect(mrb01?.status).toBe("PASS");
    expect(mrb01?.passed).toBe(true);
  });

  it("menghasilkan status FAIL jika barang belum dimiliki dan tidak ada wakalah (MRB-03)", () => {
    const invalidGoods = { ...baseMurabahah, barangDimiliki: false, adaWakalah: false };
    const res = evaluateMurabahahRules(invalidGoods);
    const mrb03 = res.find((r) => r.ruleId === "MRB-03");
    expect(mrb03?.status).toBe("FAIL");
    expect(mrb03?.severity).toBe("block");
    expect(mrb03?.actionableSuggestion).toContain("Wakalah");
  });

  it("menghasilkan status NEEDS_INFORMATION jika identitas para pihak belum lengkap (GEN-01)", () => {
    const incompleteParties = {
      ...baseMurabahah,
      ppihat: [
        { nama: "", identitas: "", jenisIdentitas: "NIK" as const, alamat: "", peran: "penjual" as const },
        { nama: "Pembeli", identitas: "456", jenisIdentitas: "NIK" as const, alamat: "Kudus", peran: "pembeli" as const },
      ],
    };
    const res = evaluateGeneralRules(incompleteParties);
    const gen01 = res.find((r) => r.ruleId === "GEN-01");
    expect(gen01?.status).toBe("NEEDS_INFORMATION");
    expect(gen01?.actionableSuggestion).toBeDefined();
  });

  it("menghasilkan status REVIEW_REQUIRED untuk klausul denda ta'zir sosial (MRB-06)", () => {
    const withDenda = { ...baseMurabahah, adaDenda: true, jumlahDenda: 10000 };
    const res = evaluateMurabahahRules(withDenda);
    const mrb06 = res.find((r) => r.ruleId === "MRB-06");
    expect(mrb06?.status).toBe("REVIEW_REQUIRED");
    expect(mrb06?.expertReviewRequired).toBe(true);
    expect(mrb06?.legalSourceIds).toContain("FATWA-17-TAZIR");
  });

  it("menghasilkan status NOT_CHECKED untuk aspek fisik serah terima barang nyata (MRB-07)", () => {
    const res = evaluateMurabahahRules(baseMurabahah);
    const mrb07 = res.find((r) => r.ruleId === "MRB-07");
    expect(mrb07?.status).toBe("NOT_CHECKED");
    expect(mrb07?.explanation).toContain("serah terima");
  });

  it("memuat Explainable Findings lengkap (apa yang diperiksa, fakta, klausul, rujukan)", () => {
    const summary = evaluateCompliance(baseMurabahah);
    const mrb01 = summary.results.find((r) => r.ruleId === "MRB-01");
    expect(mrb01?.requirementTested).toBeDefined();
    expect(mrb01?.factsEvaluated?.length).toBeGreaterThan(0);
    expect(mrb01?.relatedClauseIds).toContain("pasal-harga");
    expect(mrb01?.sourcesVerificationStatus).toBe("UNVERIFIED");
  });
});

describe("Clause-Level Review & Safe Revision", () => {
  it("menerapkan revisi klausul secara aman tanpa mengubah klausul lain", async () => {
    const { applyClauseRevision, resetClauseRevision, generateDraft } = await import("@/core/generator");
    const testForm: MurabahahFormData = {
      jenisAkad: "murabahah",
      ppihat: [
        { nama: "Penjual", identitas: "123", jenisIdentitas: "NIK", alamat: "Semarang", peran: "penjual" },
        { nama: "Pembeli", identitas: "456", jenisIdentitas: "NIK", alamat: "Kudus", peran: "pembeli" },
      ],
      saksi: [],
      tanggalMulai: "2026-01-01",
      tanggalBerakhir: "2026-12-31",
      objekUsaha: "Pengadaan Mesin",
      kategoriUsaha: "Elektronik",
      domisiliHukum: "Semarang",
      penyelesaianSengketa: ["musyawarah"],
      jenisBarang: "Mesin Cetak",
      spesifikasiBarang: "Kondisi Baru",
      jumlahBarang: 1,
      satuanBarang: "unit",
      hargaPokok: 10000000,
      marginKeuntungan: 2000000,
      hargaJual: 12000000,
      pembayaranTangguh: false,
      barangDimiliki: true,
      adaWakalah: false,
      adaDenda: false,
    };

    const initialDraft = generateDraft(testForm);
    expect(initialDraft.draftVersion).toBe(1);
    expect(initialDraft.isStale).toBe(false);

    const targetClause = initialDraft.klausul[0];
    const originalText = targetClause.teks;
    const customText = originalText + "\n[Catatan Revisi Tambahan Para Pihak]";

    // Terapkan revisi
    const revisedDraft = applyClauseRevision(initialDraft, targetClause.nomor, customText);
    expect(revisedDraft.draftVersion).toBe(2);
    expect(revisedDraft.isStale).toBe(true);

    const revisedClause = revisedDraft.klausul.find((c) => c.nomor === targetClause.nomor);
    expect(revisedClause?.isCustomized).toBe(true);
    expect(revisedClause?.originalText).toBe(originalText);
    expect(revisedClause?.teks).toBe(customText);

    // Reset revisi
    const resetDraft = resetClauseRevision(revisedDraft, targetClause.nomor);
    const restoredClause = resetDraft.klausul.find((c) => c.nomor === targetClause.nomor);
    expect(restoredClause?.isCustomized).toBe(false);
    expect(restoredClause?.teks).toBe(originalText);
  });
});

describe("Document Export: Word HTML and Markdown", () => {
  it("menghasilkan dokumen Word HTML dengan lampiran audit kepatuhan dan disklaimer", async () => {
    const { generateWordHtmlContent, generateMarkdownContract } = await import("@/core/export");
    const { generateDraft } = await import("@/core/generator");

    const testForm: MurabahahFormData = {
      jenisAkad: "murabahah",
      ppihat: [
        { nama: "Ahmad", identitas: "111", jenisIdentitas: "NIK", alamat: "Semarang", peran: "penjual" },
        { nama: "Budi", identitas: "222", jenisIdentitas: "NIK", alamat: "Semarang", peran: "pembeli" },
      ],
      saksi: [
        { nama: "S1", identitas: "333", alamat: "Semarang" },
        { nama: "S2", identitas: "444", alamat: "Semarang" },
      ],
      tanggalMulai: "2026-01-01",
      tanggalBerakhir: "2026-12-31",
      objekUsaha: "Pengadaan Laptop",
      kategoriUsaha: "Elektronik",
      domisiliHukum: "Semarang",
      penyelesaianSengketa: ["musyawarah", "pengadilan_agama"],
      jenisBarang: "Laptop ThinkPad",
      spesifikasiBarang: "Core i7 RAM 16GB",
      jumlahBarang: 2,
      satuanBarang: "unit",
      hargaPokok: 20000000,
      marginKeuntungan: 3000000,
      hargaJual: 23000000,
      pembayaranTangguh: true,
      jumlahAngsuran: 6,
      barangDimiliki: true,
      adaWakalah: false,
      adaDenda: false,
    };

    const draft = generateDraft(testForm);
    const wordHtml = generateWordHtmlContent(draft);
    expect(wordHtml).toContain("AKAD MURABAHAH");
    expect(wordHtml).toContain("LAMPIRAN I: Laporan Pemeriksaan Kepatuhan Syariah");
    expect(wordHtml).toContain("bukan nasihat hukum");
    expect(wordHtml).toContain("Rules Engine:");

    const markdown = generateMarkdownContract(draft);
    expect(markdown).toContain("# AKAD MURABAHAH");
    expect(markdown).toContain("## Para Pihak");
    expect(markdown).toContain("Pasal 1:");
  });
});

