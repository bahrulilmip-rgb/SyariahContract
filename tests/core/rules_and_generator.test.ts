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
  });
});
