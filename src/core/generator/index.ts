/**
 * core/generator/index.ts
 * Generator Draf Dokumen Akad Syariah.
 * Bekerja secara deterministik berbasis pustaka klausul JSON dan substitusi variabel.
 */

import {
  AkadFormData,
  ClauseTemplate,
  DISCLAIMER_TEXT,
  GeneratedClause,
  GeneratedDraft,
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
} from "../types";
import { evaluateCompliance } from "../rules";

import mudharabahClauses from "../../../content/clauses/mudharabah.json";
import musyarakahClauses from "../../../content/clauses/musyarakah.json";
import murabahahClauses from "../../../content/clauses/murabahah.json";

/**
 * Konversi angka ke kalimat terbilang Bahasa Indonesia
 */
export function terbilang(n: number): string {
  const bilangan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  function toWords(num: number): string {
    const val = Math.floor(Math.abs(num));
    if (val < 12) return bilangan[val];
    if (val < 20) return toWords(val - 10) + " belas";
    if (val < 100) return toWords(Math.floor(val / 10)) + " puluh " + toWords(val % 10);
    if (val < 200) return "seratus " + toWords(val - 100);
    if (val < 1000) return toWords(Math.floor(val / 100)) + " ratus " + toWords(val % 100);
    if (val < 2000) return "seribu " + toWords(val - 1000);
    if (val < 1000000) return toWords(Math.floor(val / 1000)) + " ribu " + toWords(val % 1000);
    if (val < 1000000000) return toWords(Math.floor(val / 1000000)) + " juta " + toWords(val % 1000000);
    if (val < 1000000000000) return toWords(Math.floor(val / 1000000000)) + " milyar " + toWords(val % 1000000000);
    return toWords(Math.floor(val / 1000000000000)) + " triliun " + toWords(val % 1000000000000);
  }

  return toWords(n).replace(/\s+/g, " ").trim();
}

/**
 * Format tanggal Indonesia (contoh: "Senin, 16 Oktober 2026")
 */
export function formatTanggalIndonesia(dateStr?: string): string {
  if (!dateStr) return "................................";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format mata uang Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Menghasilkan variabel untuk substitusi berdasarkan jenis formulir
 */
export function buildVariableMap(data: AkadFormData): Record<string, string> {
  const map: Record<string, string> = {};

  // Variabel Umum
  const tahunAkad = data.tanggalMulai ? data.tanggalMulai.slice(0, 4) : "2026";
  map["nomorDokumen"] = `AKD/${data.jenisAkad.toUpperCase()}/${tahunAkad}/001`;
  map["hariTanggal"] = formatTanggalIndonesia(data.tanggalMulai);
  map["domisiliHukum"] = data.domisiliHukum || "Semarang";
  map["mekanismeSengketa"] = (data.penyelesaianSengketa || ["musyawarah", "pengadilan_agama"])
    .map((s) => {
      if (s === "musyawarah") return "musyawarah untuk mufakat";
      if (s === "mediasi_syariah") return "mediasi perbankan/ekonomi syariah";
      if (s === "arbitrase_syariah") return "Badan Arbitrase Syariah Nasional (BASYARNAS)";
      if (s === "pengadilan_agama") return "Pengadilan Agama setempat";
      return s;
    })
    .join(", dan apabila belum tercapai kata sepakat melalui ");

  map["tanggalMulai"] = formatTanggalIndonesia(data.tanggalMulai);
  map["tanggalBerakhir"] = formatTanggalIndonesia(data.tanggalBerakhir);
  map["objekUsaha"] = data.objekUsaha || "Usaha Perdagangan/Jasa";
  map["periodeBagiHasil"] = "setiap akhir bulan kalender";
  map["jangkaWaktu"] = `${formatTanggalIndonesia(data.tanggalMulai)} sampai ${formatTanggalIndonesia(data.tanggalBerakhir)}`;

  // Saksi-saksi
  map["namaSaksi1"] = data.saksi?.[0]?.nama || "................................";
  map["namaSaksi2"] = data.saksi?.[1]?.nama || "................................";

  // Data Spesifik Pihak
  if (data.ppihat && data.ppihat.length >= 2) {
    const p1 = data.ppihat[0];
    const p2 = data.ppihat[1];

    map["namaShahibulMaal"] = p1.nama || "";
    map["jenisIdentitasShahibulMaal"] = p1.jenisIdentitas || "NIK";
    map["identitasShahibulMaal"] = p1.identitas || "";
    map["alamatShahibulMaal"] = p1.alamat || "";

    map["namaMudharib"] = p2.nama || "";
    map["jenisIdentitasMudharib"] = p2.jenisIdentitas || "NIK";
    map["identitasMudharib"] = p2.identitas || "";
    map["alamatMudharib"] = p2.alamat || "";

    map["namaPenjual"] = p1.nama || "";
    map["jenisIdentitasPenjual"] = p1.jenisIdentitas || "NIK";
    map["identitasPenjual"] = p1.identitas || "";
    map["alamatPenjual"] = p1.alamat || "";

    map["namaPembeli"] = p2.nama || "";
    map["jenisIdentitasPembeli"] = p2.jenisIdentitas || "NIK";
    map["identitasPembeli"] = p2.identitas || "";
    map["alamatPembeli"] = p2.alamat || "";
  }

  // Data Khusus Mudharabah
  if (data.jenisAkad === "mudharabah") {
    const m = data as MudharabahFormData;
    map["bentukModal"] = m.bentukModal === "aset" ? `aset berupa ${m.deskripsiAset || "barang modal"}` : "uang tunai";
    map["jumlahModal"] = formatRupiah(m.jumlahModal);
    map["jumlahModalTerbilang"] = terbilang(m.jumlahModal).trim() + " rupiah";
    map["nisbahShahibulMaal"] = String(m.nisbahShahibulMaal);
    map["nisbahShahibulMaalTerbilang"] = terbilang(m.nisbahShahibulMaal).trim();
    map["nisbahMudharib"] = String(m.nisbahMudharib);
    map["nisbahMudharibTerbilang"] = terbilang(m.nisbahMudharib).trim();
    map["jenisUsaha"] = m.jenisUsaha || m.objekUsaha;
    map["adaJaminan"] = m.adaJaminan ? "true" : "false";
    map["deskripsiJaminan"] = m.deskripsiJaminan || "-";
  }

  // Data Khusus Musyarakah
  if (data.jenisAkad === "musyarakah") {
    const s = data as MusyarakahFormData;
    map["totalModal"] = formatRupiah(s.totalModal);
    map["totalModalTerbilang"] = terbilang(s.totalModal).trim() + " rupiah";
    map["wewenangPengelolaan"] = s.wewenangPengelolaan || "Pengelolaan bersama dengan musyawarah.";
    map["jenisUsaha"] = s.objekUsaha;

    // Format list daftar pihak
    map["daftarPihak"] = (data.ppihat || [])
      .map(
        (p, idx) =>
          `${idx + 1}. Nama: ${p.nama}\n   ${p.jenisIdentitas}: ${p.identitas}\n   Alamat: ${p.alamat}\n   Selanjutnya disebut sebagai "Pihak ke-${idx + 1}" (Syarik ${idx + 1});`
      )
      .join("\n\n");

    // Format list daftar modal
    map["daftarModal"] = (s.kontribusiModal || [])
      .map(
        (k, idx) =>
          `   ${String.fromCharCode(97 + idx)}. ${k.pihak}: Rp ${formatRupiah(k.jumlah)} (${terbilang(k.jumlah).trim()} rupiah)`
      )
      .join("\n");

    // Format list daftar nisbah
    map["daftarNisbah"] = (s.nisbahBagiHasil || [])
      .map(
        (n, idx) =>
          `   ${String.fromCharCode(97 + idx)}. ${n.pihak}: ${n.persentase}% (${terbilang(n.persentase).trim()} persen)`
      )
      .join("\n");

    // Format proporsi kerugian (sama dengan proporsi modal)
    map["daftarProporsiKerugian"] = (s.kontribusiModal || [])
      .map((k, idx) => {
        const pct = s.totalModal > 0 ? ((k.jumlah / s.totalModal) * 100).toFixed(1) : "0";
        return `   ${String.fromCharCode(97 + idx)}. ${k.pihak}: sebesar ${pct}% sesuai kontribusi modal`;
      })
      .join("\n");

    // Tanda tangan para pihak
    map["tandaTanganPihak"] = (data.ppihat || [])
      .map((p, idx) => `Pihak ke-${idx + 1} (${p.nama})\n\n\n________________________\n${p.nama}`)
      .join("\n\n");
  }

  // Data Khusus Murabahah
  if (data.jenisAkad === "murabahah") {
    const r = data as MurabahahFormData;
    map["jenisBarang"] = r.jenisBarang || "";
    map["spesifikasiBarang"] = r.spesifikasiBarang || "";
    map["jumlahBarang"] = String(r.jumlahBarang || 1);
    map["satuanBarang"] = r.satuanBarang || "unit";
    map["statusKepemilikan"] = r.barangDimiliki ? "dimiliki dan dikuasai secara sah" : "dipesan melalui kuasa pengadaan";
    map["hargaPokok"] = formatRupiah(r.hargaPokok);
    map["hargaPokokTerbilang"] = terbilang(r.hargaPokok).trim() + " rupiah";
    map["marginKeuntungan"] = formatRupiah(r.marginKeuntungan);
    map["marginKeuntunganTerbilang"] = terbilang(r.marginKeuntungan).trim() + " rupiah";
    map["hargaJual"] = formatRupiah(r.hargaJual);
    map["hargaJualTerbilang"] = terbilang(r.hargaJual).trim() + " rupiah";
    map["pembayaranTangguh"] = r.pembayaranTangguh ? "true" : "false";
    map["jumlahAngsuran"] = String(r.jumlahAngsuran || 1);
    map["adaDenda"] = r.adaDenda ? "true" : "false";
    map["jumlahDenda"] = formatRupiah(r.jumlahDenda || 0);
    map["jumlahDendaTerbilang"] = terbilang(r.jumlahDenda || 0).trim() + " rupiah";
    map["adaWakalah"] = r.adaWakalah ? "true" : "false";

    if (r.pembayaranTangguh && r.jumlahAngsuran && r.jumlahAngsuran > 0) {
      const perBulan = Math.round(r.hargaJual / r.jumlahAngsuran);
      map["jadwalAngsuran"] = `Dibayar sebesar Rp ${formatRupiah(perBulan)} per bulan selama ${r.jumlahAngsuran} bulan, selambat-lambatnya tanggal 10 setiap bulannya.`;
    } else {
      map["jadwalAngsuran"] = "Pembayaran tunai lunas pada saat penyerahan barang.";
    }
  }

  return map;
}

/**
 * Mengganti placeholder {{variable}} dan conditional {{#cond}}...{{/cond}}
 */
export function substituteVariables(templateText: string, vars: Record<string, string>): string {
  let output = templateText;

  // Handle conditionals like {{#cond}}YES{{/cond}}{{^cond}}NO{{/cond}}
  output = output.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, key, content) => {
    const val = vars[key];
    const isTrue = val === "true" || (val && val !== "false" && val !== "0");
    return isTrue ? content : "";
  });

  output = output.replace(/{{[\\^](\w+)}}([\s\S]*?){{\/\1}}/g, (_, key, content) => {
    const val = vars[key];
    const isFalse = !val || val === "false" || val === "0" || val === "";
    return isFalse ? content : "";
  });

  // Handle simple substitutions {{key}}
  output = output.replace(/{{(\w+)}}/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : `[${key}]`;
  });

  return output;
}

/**
 * Menghasilkan Draf Dokumen Lengkap dari Data Formulir
 */
export function generateDraft(formData: AkadFormData): GeneratedDraft {
  const vars = buildVariableMap(formData);
  const kepatuhan = evaluateCompliance(formData);

  let rawClauses: ClauseTemplate[] = [];
  let judulDoc = "AKAD PERJANJIAN SYARIAH";

  if (formData.jenisAkad === "mudharabah") {
    rawClauses = mudharabahClauses as ClauseTemplate[];
    judulDoc = "AKAD MUDHARABAH (BAGI HASIL INVESTASI USAHA)";
  } else if (formData.jenisAkad === "musyarakah") {
    rawClauses = musyarakahClauses as ClauseTemplate[];
    judulDoc = "AKAD MUSYARAKAH (KEMITRAAN USAHA BERSAMA)";
  } else if (formData.jenisAkad === "murabahah") {
    rawClauses = murabahahClauses as ClauseTemplate[];
    judulDoc = "AKAD MURABAHAH (JUAL BELI BARANG)";
  }

  const generatedClauses: GeneratedClause[] = [];
  let pertimbanganText = "";
  let penutupText = "";
  let pasalCounter = 1;

  for (const template of rawClauses) {
    const filledText = substituteVariables(template.text, vars);

    if (template.id.endsWith("-pertimbangan")) {
      pertimbanganText = filledText;
      continue;
    }

    if (template.id.endsWith("-penutup")) {
      penutupText = filledText;
      continue;
    }

    if (template.id.endsWith("-judul") || template.id.endsWith("-komparisi")) {
      // Ditampilkan di bagian struktur kepala dokumen
      continue;
    }

    // Hanya masukkan pasal isi
    generatedClauses.push({
      nomor: pasalCounter++,
      judul: template.title,
      teks: filledText,
      legalSourceIds: template.legalSourceIds,
      templateId: template.id,
    });
  }

  return {
    id: `draft-${formData.jenisAkad}`,
    jenisAkad: formData.jenisAkad,
    judul: judulDoc,
    nomorDokumen: vars["nomorDokumen"],
    tanggalDibuat: formData.tanggalMulai || "2026-01-01",
    paraPihak: formData.ppihat || [],
    saksi: formData.saksi || [],
    pertimbangan: pertimbanganText,
    klausul: generatedClauses,
    penutup: penutupText,
    disklaimer: DISCLAIMER_TEXT,
    kepatuhan,
  };
}
