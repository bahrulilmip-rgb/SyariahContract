/**
 * tests/core/types.test.ts
 * Test untuk validasi tipe data dan skema JSON klausul.
 */

import { describe, it, expect } from 'vitest';
import {
  AKAD_METADATA,
  DISCLAIMER_TEXT,
  KATEGORI_TERLARANG,
} from '@/core/types';
import type {
  AkadType,
  ClauseTemplate,
  PartyInfo,
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
  PenilaianData,
  ComplianceSummary,
} from '@/core/types';

// Import JSON data
import legalSources from '../../content/legal-sources.json';
import mudharabahClauses from '../../content/clauses/mudharabah.json';
import musyarakahClauses from '../../content/clauses/musyarakah.json';
import murabahahClauses from '../../content/clauses/murabahah.json';

// ============================================================================
// Test: Konstanta dan Metadata
// ============================================================================

describe('AKAD_METADATA', () => {
  it('harus memiliki tepat 3 jenis akad', () => {
    expect(AKAD_METADATA).toHaveLength(3);
  });

  it('harus mencakup mudharabah, musyarakah, dan murabahah', () => {
    const types = AKAD_METADATA.map((m) => m.type);
    expect(types).toContain('mudharabah');
    expect(types).toContain('musyarakah');
    expect(types).toContain('murabahah');
  });

  it('setiap metadata harus memiliki semua properti wajib', () => {
    for (const meta of AKAD_METADATA) {
      expect(meta.type).toBeTruthy();
      expect(meta.nama).toBeTruthy();
      expect(meta.deskripsi).toBeTruthy();
      expect(meta.contohKasus).toBeTruthy();
      expect(meta.ikon).toBeTruthy();
      expect(meta.warna).toBeTruthy();
    }
  });
});

describe('DISCLAIMER_TEXT', () => {
  it('harus berisi teks disklaimer sesuai PRD', () => {
    expect(DISCLAIMER_TEXT).toContain('bukan nasihat hukum');
    expect(DISCLAIMER_TEXT).toContain('bukan fatwa');
    expect(DISCLAIMER_TEXT).toContain('bukan sertifikasi kesesuaian syariah');
    expect(DISCLAIMER_TEXT).toContain('advokat/notaris');
    expect(DISCLAIMER_TEXT).toContain('Dewan Pengawas Syariah');
  });
});

describe('KATEGORI_TERLARANG', () => {
  it('harus memiliki minimal 5 kategori', () => {
    expect(KATEGORI_TERLARANG.length).toBeGreaterThanOrEqual(5);
  });

  it('harus mencakup kategori utama', () => {
    const lower = KATEGORI_TERLARANG.map((k) => k.toLowerCase());
    expect(lower.some((k) => k.includes('minum') || k.includes('alkohol'))).toBe(true);
    expect(lower.some((k) => k.includes('judi'))).toBe(true);
    expect(lower.some((k) => k.includes('babi'))).toBe(true);
  });
});

// ============================================================================
// Test: Skema JSON legal-sources.json
// ============================================================================

describe('legal-sources.json', () => {
  it('harus berupa array tidak kosong', () => {
    expect(Array.isArray(legalSources)).toBe(true);
    expect(legalSources.length).toBeGreaterThan(0);
  });

  it('setiap entri harus memiliki properti wajib', () => {
    for (const source of legalSources) {
      expect(source).toHaveProperty('id');
      expect(source).toHaveProperty('type');
      expect(source).toHaveProperty('title');
      expect(source).toHaveProperty('number');
      expect(source).toHaveProperty('usedFor');
      expect(source).toHaveProperty('verified');
      expect(Array.isArray(source.usedFor)).toBe(true);
    }
  });

  it('semua entri awal harus belum diverifikasi', () => {
    for (const source of legalSources) {
      expect(source.verified).toBe(false);
    }
  });

  it('harus mencakup sumber hukum sesuai PRD Bagian 8', () => {
    const ids = legalSources.map((s: { id: string }) => s.id);
    expect(ids).toContain('KUHPERDATA-1320');
    expect(ids).toContain('KUHPERDATA-1338');
    expect(ids).toContain('UU-PERBANKAN-SYARIAH');
    expect(ids).toContain('KHES');
    expect(ids).toContain('FATWA-MRB');
    expect(ids).toContain('FATWA-MDH');
    expect(ids).toContain('FATWA-MSY');
    expect(ids).toContain('UU-PERADILAN-AGAMA');
  });

  it('setiap ID harus unik', () => {
    const ids = legalSources.map((s: { id: string }) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ============================================================================
// Test: Skema JSON klausul
// ============================================================================

function validateClauses(clauses: ClauseTemplate[], akadType: AkadType) {
  describe(`clauses/${akadType}.json`, () => {
    it('harus berupa array tidak kosong', () => {
      expect(Array.isArray(clauses)).toBe(true);
      expect(clauses.length).toBeGreaterThan(0);
    });

    it('setiap klausul harus memiliki properti wajib', () => {
      for (const clause of clauses) {
        expect(clause).toHaveProperty('id');
        expect(clause).toHaveProperty('akad');
        expect(clause).toHaveProperty('title');
        expect(clause).toHaveProperty('order');
        expect(clause).toHaveProperty('text');
        expect(clause).toHaveProperty('variables');
        expect(clause).toHaveProperty('legalSourceIds');
        expect(clause).toHaveProperty('mandatory');
        expect(Array.isArray(clause.variables)).toBe(true);
        expect(Array.isArray(clause.legalSourceIds)).toBe(true);
      }
    });

    it(`semua klausul harus untuk akad ${akadType}`, () => {
      for (const clause of clauses) {
        expect(clause.akad).toBe(akadType);
      }
    });

    it('setiap ID klausul harus unik', () => {
      const ids = clauses.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('urutan (order) harus berurutan dimulai dari 0', () => {
      const orders = clauses.map((c) => c.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i);
      }
    });

    it('harus memiliki minimal klausul komparisi, pertimbangan, dan penutup', () => {
      const titles = clauses.map((c) => c.title.toLowerCase());
      expect(titles.some((t) => t.includes('komparisi'))).toBe(true);
      expect(titles.some((t) => t.includes('pertimbangan'))).toBe(true);
      expect(titles.some((t) => t.includes('penutup'))).toBe(true);
    });

    it('referensi legalSourceIds harus valid', () => {
      const validIds = legalSources.map((s: { id: string }) => s.id);
      for (const clause of clauses) {
        for (const sourceId of clause.legalSourceIds) {
          expect(validIds).toContain(sourceId);
        }
      }
    });
  });
}

validateClauses(mudharabahClauses as ClauseTemplate[], 'mudharabah');
validateClauses(musyarakahClauses as ClauseTemplate[], 'musyarakah');
validateClauses(murabahahClauses as ClauseTemplate[], 'murabahah');

// ============================================================================
// Test: Tipe data (compile-time checks via runtime dummy values)
// ============================================================================

describe('Tipe data compile-time checks', () => {
  it('PartyInfo dapat dibuat dengan properti wajib', () => {
    const party: PartyInfo = {
      nama: 'Test User',
      identitas: '1234567890123456',
      jenisIdentitas: 'NIK',
      alamat: 'Jl. Test No. 1',
      peran: 'shahibul_maal',
    };
    expect(party.nama).toBe('Test User');
    expect(party.peran).toBe('shahibul_maal');
  });

  it('MudharabahFormData dapat dibuat dengan properti wajib', () => {
    const form: MudharabahFormData = {
      jenisAkad: 'mudharabah',
      ppihat: [],
      saksi: [],
      tanggalMulai: '2024-01-01',
      tanggalBerakhir: '2024-12-31',
      objekUsaha: 'Kuliner',
      kategoriUsaha: 'Makanan',
      domisiliHukum: 'Semarang',
      penyelesaianSengketa: ['musyawarah'],
      jumlahModal: 100000000,
      bentukModal: 'uang',
      nisbahShahibulMaal: 60,
      nisbahMudharib: 40,
      jenisUsaha: 'Restoran',
      adaJaminan: false,
    };
    expect(form.jenisAkad).toBe('mudharabah');
    expect(form.nisbahShahibulMaal + form.nisbahMudharib).toBe(100);
  });

  it('MusyarakahFormData dapat dibuat dengan properti wajib', () => {
    const form: MusyarakahFormData = {
      jenisAkad: 'musyarakah',
      ppihat: [],
      saksi: [],
      tanggalMulai: '2024-01-01',
      tanggalBerakhir: '2024-12-31',
      objekUsaha: 'Perdagangan',
      kategoriUsaha: 'Retail',
      domisiliHukum: 'Jakarta',
      penyelesaianSengketa: ['musyawarah', 'arbitrase_syariah'],
      kontribusiModal: [
        { pihak: 'Pihak A', jumlah: 50000000 },
        { pihak: 'Pihak B', jumlah: 50000000 },
      ],
      totalModal: 100000000,
      nisbahBagiHasil: [
        { pihak: 'Pihak A', persentase: 50 },
        { pihak: 'Pihak B', persentase: 50 },
      ],
      wewenangPengelolaan: 'Pihak A mengelola operasional, Pihak B mengelola keuangan',
    };
    expect(form.jenisAkad).toBe('musyarakah');
    expect(form.kontribusiModal).toHaveLength(2);
  });

  it('MurabahahFormData dapat dibuat dengan properti wajib', () => {
    const form: MurabahahFormData = {
      jenisAkad: 'murabahah',
      ppihat: [],
      saksi: [],
      tanggalMulai: '2024-01-01',
      tanggalBerakhir: '2024-12-31',
      objekUsaha: 'Jual Beli Kendaraan',
      kategoriUsaha: 'Otomotif',
      domisiliHukum: 'Surabaya',
      penyelesaianSengketa: ['musyawarah'],
      jenisBarang: 'Mobil',
      spesifikasiBarang: 'Toyota Avanza 2024',
      jumlahBarang: 1,
      satuanBarang: 'unit',
      hargaPokok: 200000000,
      marginKeuntungan: 20000000,
      hargaJual: 220000000,
      pembayaranTangguh: true,
      jumlahAngsuran: 12,
      barangDimiliki: true,
      adaWakalah: false,
      adaDenda: false,
    };
    expect(form.jenisAkad).toBe('murabahah');
    expect(form.hargaJual).toBe(form.hargaPokok + form.marginKeuntungan);
  });

  it('ComplianceSummary dapat dibuat', () => {
    const summary: ComplianceSummary = {
      results: [],
      hasBlockingErrors: false,
      passedCount: 0,
      warningCount: 0,
      blockCount: 0,
      infoCount: 0,
    };
    expect(summary.hasBlockingErrors).toBe(false);
  });

  it('PenilaianData dapat dibuat', () => {
    const penilaian: PenilaianData = {
      peran: 'ahli',
      timestamp: new Date().toISOString(),
      jenisAkad: 'mudharabah',
      items: [
        { aspekId: 'isi-hukum', aspekLabel: 'Isi Hukum', nilai: 4 },
        { aspekId: 'kesesuaian-syariah', aspekLabel: 'Kesesuaian Syariah', nilai: 5 },
      ],
      saran: 'Sudah baik',
    };
    expect(penilaian.peran).toBe('ahli');
    expect(penilaian.items).toHaveLength(2);
    expect(penilaian.items.every((i) => i.nilai >= 1 && i.nilai <= 5)).toBe(true);
  });
});
