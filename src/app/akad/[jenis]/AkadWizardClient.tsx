"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import {
  AKAD_METADATA,
  AkadType,
  GeneratedClause,
  GeneratedDraft,
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
  PartyInfo,
  WitnessInfo,
} from "@/core/types";
import { evaluateCompliance } from "@/core/rules";
import {
  generateDraft,
  formatRupiah,
  applyClauseRevision,
  resetClauseRevision,
} from "@/core/generator";
import { legalSources, getVerificationBadge } from "@/core/legalSources";
import { exportToWordDoc, exportToMarkdown } from "@/core/export";

interface AkadWizardClientProps {
  jenis: AkadType;
}

export default function AkadWizardClient({ jenis }: AkadWizardClientProps) {
  const metadata = useMemo(() => {
    return (
      AKAD_METADATA.find((m) => m.type === jenis) || AKAD_METADATA[0]
    );
  }, [jenis]);

  // Current wizard step (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Common Form States
  const [tanggalMulai, setTanggalMulai] = useState("2026-01-01");
  const [tanggalBerakhir, setTanggalBerakhir] = useState("2026-12-31");
  const [objekUsaha, setObjekUsaha] = useState("Usaha Kuliner dan Minuman Herbal");
  const [kategoriUsaha, setKategoriUsaha] = useState("Kuliner Makanan Halal");
  const [domisiliHukum, setDomisiliHukum] = useState("Pengadilan Agama Semarang");
  const [penyelesaianSengketa, setPenyelesaianSengketa] = useState<
    ("musyawarah" | "mediasi_syariah" | "arbitrase_syariah" | "pengadilan_agama")[]
  >(["musyawarah", "pengadilan_agama"]);

  // Parties
  const [parties, setParties] = useState<PartyInfo[]>([
    {
      nama: "H. Ahmad Fauzi",
      identitas: "3301012304850001",
      jenisIdentitas: "NIK",
      alamat: "Jl. Pemuda No. 45, Semarang",
      peran: jenis === "murabahah" ? "penjual" : "shahibul_maal",
      telepon: "081234567890",
    },
    {
      nama: "Siti Rahmawati",
      identitas: "3301015508920002",
      jenisIdentitas: "NIK",
      alamat: "Jl. Pandanaran No. 12, Semarang",
      peran: jenis === "murabahah" ? "pembeli" : "mudharib",
      telepon: "089876543210",
    },
  ]);

  // Witnesses
  const [saksi, setSaksi] = useState<WitnessInfo[]>([
    { nama: "M. Rizki Santoso", identitas: "3301011102900003", alamat: "Semarang" },
    { nama: "Hasan Basri", identitas: "3301012205880004", alamat: "Semarang" },
  ]);

  // Mudharabah States
  const [jumlahModal, setJumlahModal] = useState<number>(50000000);
  const [bentukModal, setBentukModal] = useState<"uang" | "aset">("uang");
  const [deskripsiAset, setDeskripsiAset] = useState("");
  const [nisbahShahibulMaal, setNisbahShahibulMaal] = useState<number>(60);
  const [nisbahMudharib, setNisbahMudharib] = useState<number>(40);
  const [jenisUsaha, setJenisUsaha] = useState("Pengelolaan Kedai Kuliner");
  const [adaJaminan, setAdaJaminan] = useState(false);
  const [deskripsiJaminan, setDeskripsiJaminan] = useState("");

  // Musyarakah States
  const [kontribusiModal, setKontribusiModal] = useState([
    { pihak: "Mitra Pertama (H. Ahmad Fauzi)", jumlah: 50000000 },
    { pihak: "Mitra Kedua (Siti Rahmawati)", jumlah: 50000000 },
  ]);
  const [nisbahBagiHasil, setNisbahBagiHasil] = useState([
    { pihak: "Mitra Pertama (H. Ahmad Fauzi)", persentase: 50 },
    { pihak: "Mitra Kedua (Siti Rahmawati)", persentase: 50 },
  ]);
  const [wewenangPengelolaan, setWewenangPengelolaan] = useState(
    "Pengelolaan harian operasional dipimpin oleh Siti Rahmawati, sedangkan pengawasan berkala dan audit keuangan dilakukan bersama."
  );

  // Murabahah States
  const [jenisBarang, setJenisBarang] = useState("Mesin Pembuat Kopi Espresso 2 Group");
  const [spesifikasiBarang, setSpesifikasiBarang] = useState("Merk Nuova Simonelli, Daya 3000 Watt, Kondisi Baru Bergaransi 1 Tahun");
  const [jumlahBarang, setJumlahBarang] = useState(1);
  const [satuanBarang, setSatuanBarang] = useState("unit");
  const [hargaPokok, setHargaPokok] = useState(40000000);
  const [marginKeuntungan, setMarginKeuntungan] = useState(5000000);
  const [pembayaranTangguh, setPembayaranTangguh] = useState(true);
  const [jumlahAngsuran, setJumlahAngsuran] = useState(10);
  const [barangDimiliki, setBarangDimiliki] = useState(true);
  const [adaWakalah, setAdaWakalah] = useState(false);
  const [adaDenda, setAdaDenda] = useState(false);
  const [jumlahDenda, setJumlahDenda] = useState(25000);

  // Legal source active modal
  const [selectedLegalSourceId, setSelectedLegalSourceId] = useState<string | null>(null);

  // Explainable findings filter & expandable cards
  const [findingsFilter, setFindingsFilter] = useState<"ALL" | "ACTION_REQUIRED" | "REVIEW_REQUIRED" | "PASS">("ALL");
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  // Clause-Level Safe Revision State
  const [customDraft, setCustomDraft] = useState<GeneratedDraft | null>(null);
  const [editingClause, setEditingClause] = useState<GeneratedClause | null>(null);
  const [clauseEditText, setClauseEditText] = useState<string>("");

  // Assemble full form data
  const currentFormData = useMemo(() => {
    if (jenis === "mudharabah") {
      const data: MudharabahFormData = {
        jenisAkad: "mudharabah",
        ppihat: parties,
        saksi,
        tanggalMulai,
        tanggalBerakhir,
        objekUsaha,
        kategoriUsaha,
        domisiliHukum,
        penyelesaianSengketa,
        jumlahModal,
        bentukModal,
        deskripsiAset,
        nisbahShahibulMaal,
        nisbahMudharib,
        jenisUsaha,
        adaJaminan,
        deskripsiJaminan,
      };
      return data;
    } else if (jenis === "musyarakah") {
      const total = kontribusiModal.reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0);
      const data: MusyarakahFormData = {
        jenisAkad: "musyarakah",
        ppihat: parties,
        saksi,
        tanggalMulai,
        tanggalBerakhir,
        objekUsaha,
        kategoriUsaha,
        domisiliHukum,
        penyelesaianSengketa,
        kontribusiModal,
        totalModal: total,
        nisbahBagiHasil,
        wewenangPengelolaan,
      };
      return data;
    } else {
      const totalJual = hargaPokok + marginKeuntungan;
      const data: MurabahahFormData = {
        jenisAkad: "murabahah",
        ppihat: parties,
        saksi,
        tanggalMulai,
        tanggalBerakhir,
        objekUsaha,
        kategoriUsaha,
        domisiliHukum,
        penyelesaianSengketa,
        jenisBarang,
        spesifikasiBarang,
        jumlahBarang,
        satuanBarang,
        hargaPokok,
        marginKeuntungan,
        hargaJual: totalJual,
        pembayaranTangguh,
        jumlahAngsuran,
        barangDimiliki,
        adaWakalah,
        adaDenda,
        jumlahDenda,
      };
      return data;
    }
  }, [
    jenis,
    parties,
    saksi,
    tanggalMulai,
    tanggalBerakhir,
    objekUsaha,
    kategoriUsaha,
    domisiliHukum,
    penyelesaianSengketa,
    jumlahModal,
    bentukModal,
    deskripsiAset,
    nisbahShahibulMaal,
    nisbahMudharib,
    jenisUsaha,
    adaJaminan,
    deskripsiJaminan,
    kontribusiModal,
    nisbahBagiHasil,
    wewenangPengelolaan,
    jenisBarang,
    spesifikasiBarang,
    jumlahBarang,
    satuanBarang,
    hargaPokok,
    marginKeuntungan,
    pembayaranTangguh,
    jumlahAngsuran,
    barangDimiliki,
    adaWakalah,
    adaDenda,
    jumlahDenda,
  ]);

  // Real-time compliance check
  const compliance = useMemo(() => {
    return evaluateCompliance(currentFormData);
  }, [currentFormData]);

  // Generated draft when on step 5
  const generatedDraft = useMemo(() => {
    return generateDraft(currentFormData);
  }, [currentFormData]);

  // Draf efektif yang mempertimbangkan revisi manual pengguna
  const effectiveDraft = useMemo(() => {
    return customDraft || generatedDraft;
  }, [customDraft, generatedDraft]);

  const handleStartEditClause = (clause: GeneratedClause) => {
    setEditingClause(clause);
    setClauseEditText(clause.teks);
  };

  const handleSaveClauseEdit = () => {
    if (!editingClause) return;
    const updated = applyClauseRevision(effectiveDraft, editingClause.nomor, clauseEditText);
    setCustomDraft(updated);
    setEditingClause(null);
  };

  const handleResetClause = (clauseNomor: number) => {
    const updated = resetClauseRevision(effectiveDraft, clauseNomor);
    setCustomDraft(updated);
  };

  const handleReevaluateDraft = () => {
    if (customDraft) {
      const rechecked = evaluateCompliance(currentFormData);
      setCustomDraft({
        ...customDraft,
        kepatuhan: rechecked,
        isStale: false,
        lastEvaluatedAt: new Date().toISOString(),
      });
    }
  };

  const stepsList = [
    { number: 1, label: "Para Pihak" },
    { number: 2, label: "Objek & Nilai" },
    { number: 3, label: "Ketentuan Khusus" },
    { number: 4, label: "Uji Kepatuhan" },
    { number: 5, label: "Draf & Ekspor" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumb & Akad Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-emerald-700">
                Beranda
              </Link>
              <span>/</span>
              <span>Penyusunan Akad</span>
              <span>/</span>
              <span className="font-semibold text-emerald-800">{metadata.nama}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="inline-block text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                {metadata.type.toUpperCase()}
              </span>
              <span>Formulir Akad {metadata.nama}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
              Model 3D R&D
            </span>
          </div>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-8">
          <div className="grid grid-cols-5 gap-2">
            {stepsList.map((s) => {
              const isActive = step === s.number;
              const isPassed = step > s.number;
              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setStep(s.number)}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold"
                      : isPassed
                      ? "text-slate-700 hover:bg-slate-50 font-medium"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isActive
                        ? "bg-emerald-700 text-white"
                        : isPassed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isPassed ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs truncate w-full">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Content Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          
          {/* STEP 1: PARA PIHAK */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Langkah 1: Identitas Para Pihak
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sesuai syarat sah perjanjian KUHPerdata Pasal 1320 dan KHES, identitas para pihak wajib jelas dan cakap hukum.
                </p>
              </div>

              {parties.map((party, index) => (
                <div
                  key={index}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {index === 0
                        ? jenis === "murabahah"
                          ? "Pihak Pertama (Penjual)"
                          : jenis === "mudharabah"
                          ? "Pihak Pertama (Shahibul Maal / Pemodal)"
                          : "Pihak Pertama (Syarik 1)"
                        : jenis === "murabahah"
                        ? "Pihak Kedua (Pembeli)"
                        : jenis === "mudharabah"
                        ? "Pihak Kedua (Mudharib / Pengelola)"
                        : "Pihak Kedua (Syarik 2)"}
                    </span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      Wajib Diisi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={party.nama}
                        onChange={(e) => {
                          const updated = [...parties];
                          updated[index].nama = e.target.value;
                          setParties(updated);
                        }}
                        placeholder="Contoh: H. Ahmad Fauzi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jenis & Nomor Identitas (NIK/NPWP/NIB)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={party.jenisIdentitas}
                          onChange={(e) => {
                            const updated = [...parties];
                            updated[index].jenisIdentitas = e.target.value as "NIK" | "NPWP" | "SIUP" | "NIB";
                            setParties(updated);
                          }}
                          className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="NIK">NIK</option>
                          <option value="NPWP">NPWP</option>
                          <option value="NIB">NIB</option>
                        </select>
                        <input
                          type="text"
                          value={party.identitas}
                          onChange={(e) => {
                            const updated = [...parties];
                            updated[index].identitas = e.target.value;
                            setParties(updated);
                          }}
                          placeholder="Nomor identitas"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Alamat Domisili Lengkap
                      </label>
                      <input
                        type="text"
                        value={party.alamat}
                        onChange={(e) => {
                          const updated = [...parties];
                          updated[index].alamat = e.target.value;
                          setParties(updated);
                        }}
                        placeholder="Alamat sesuai KTP atau tempat kedudukan usaha"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Saksi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <span className="font-bold text-slate-800 block">
                  Identitas 2 (Dua) Orang Saksi (Opsional pada Draf Awal)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={saksi[0].nama}
                      onChange={(e) => {
                        const updated = [...saksi];
                        updated[0].nama = e.target.value;
                        setSaksi(updated);
                      }}
                      placeholder="Nama Saksi 1"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={saksi[1].nama}
                      onChange={(e) => {
                        const updated = [...saksi];
                        updated[1].nama = e.target.value;
                        setSaksi(updated);
                      }}
                      placeholder="Nama Saksi 2"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJEK & NILAI */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Langkah 2: Objek Usaha, Tanggal, & Domisili Hukum
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Aturan kepatuhan GEN-03 dan GEN-05 mewajibkan kehalalan objek dan kepastian jangka waktu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama / Deskripsi Usaha yang Dijalankan
                  </label>
                  <input
                    type="text"
                    value={objekUsaha}
                    onChange={(e) => setObjekUsaha(e.target.value)}
                    placeholder="Contoh: Usaha Kedai Kopi dan Restoran Halal"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Bidang Usaha
                  </label>
                  <input
                    type="text"
                    value={kategoriUsaha}
                    onChange={(e) => setKategoriUsaha(e.target.value)}
                    placeholder="Contoh: Kuliner, Retail, Jasa Logistik"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tidak boleh kategori terlarang (alkohol, judi, riba, babi, dll.)
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilihan Domisili Hukum Sengketa
                  </label>
                  <input
                    type="text"
                    value={domisiliHukum}
                    onChange={(e) => setDomisiliHukum(e.target.value)}
                    placeholder="Contoh: Pengadilan Agama Semarang"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Mulai Berlaku
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Berakhir Akad
                  </label>
                  <input
                    type="date"
                    value={tanggalBerakhir}
                    onChange={(e) => setTanggalBerakhir(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Mekanisme Penyelesaian Sengketa (Pilih yang Berlaku)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "musyawarah", label: "Musyawarah untuk Mufakat (Wajib)" },
                      { id: "mediasi_syariah", label: "Mediasi Ekonomi Syariah" },
                      { id: "arbitrase_syariah", label: "Arbitrase Syariah (BASYARNAS)" },
                      { id: "pengadilan_agama", label: "Pengadilan Agama (Litigasi)" },
                    ].map((opt) => {
                      const isChecked = penyelesaianSengketa.includes(opt.id as "musyawarah" | "mediasi_syariah" | "arbitrase_syariah" | "pengadilan_agama");
                      return (
                        <label key={opt.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const val = opt.id as "musyawarah" | "mediasi_syariah" | "arbitrase_syariah" | "pengadilan_agama";
                              if (e.target.checked) {
                                setPenyelesaianSengketa([...penyelesaianSengketa, val]);
                              } else {
                                setPenyelesaianSengketa(penyelesaianSengketa.filter((s) => s !== val));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-700">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: KETENTUAN KHUSUS AKAD */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Langkah 3: Ketentuan Khusus Akad {metadata.nama}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Parameter fikih muamalah wajib diisi sesuai karakteristik akad yang dipilih.
                </p>
              </div>

              {/* KHUSUS MUDHARABAH */}
              {jenis === "mudharabah" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jumlah Modal Shahibul Maal (IDR)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={jumlahModal}
                        onChange={(e) => setJumlahModal(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white text-sm font-semibold"
                      />
                      <span className="text-[11px] text-emerald-700 mt-1 block">
                        Rp {formatRupiah(jumlahModal)}
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Bentuk Modal
                      </label>
                      <select
                        value={bentukModal}
                        onChange={(e) => setBentukModal(e.target.value as "uang" | "aset")}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="uang">Uang Tunai</option>
                        <option value="aset">Aset / Barang Modal</option>
                      </select>
                    </div>

                    {bentukModal === "aset" && (
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Deskripsi Aset Modal
                        </label>
                        <input
                          type="text"
                          value={deskripsiAset}
                          onChange={(e) => setDeskripsiAset(e.target.value)}
                          placeholder="Rincian aset (contoh: 1 unit mesin pengering senilai Rp 50.000.000)"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Rincian Jenis Usaha Mudharabah
                      </label>
                      <input
                        type="text"
                        value={jenisUsaha}
                        onChange={(e) => setJenisUsaha(e.target.value)}
                        placeholder="Contoh: Pengelolaan dan Pengembangan Kedai Kuliner"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Porsi Nisbah Shahibul Maal (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={nisbahShahibulMaal}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNisbahShahibulMaal(val);
                          setNisbahMudharib(100 - val);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Porsi Nisbah Mudharib (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={nisbahMudharib}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNisbahMudharib(val);
                          setNisbahShahibulMaal(100 - val);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600 bg-white text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span>Total Nisbah:</span>
                    <span className="font-bold text-emerald-900 text-sm">
                      {nisbahShahibulMaal + nisbahMudharib}% (Syarat Kepatuhan: Tepat 100%)
                    </span>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adaJaminan}
                        onChange={(e) => setAdaJaminan(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">
                        Sertakan Klausul Jaminan dari Mudharib (Mencegah Penyimpangan)
                      </span>
                    </label>

                    {adaJaminan && (
                      <div className="mt-2 pl-6">
                        <input
                          type="text"
                          value={deskripsiJaminan}
                          onChange={(e) => setDeskripsiJaminan(e.target.value)}
                          placeholder="Deskripsi jaminan (contoh: BPKB Sepeda Motor No...)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KHUSUS MUSYARAKAH */}
              {jenis === "musyarakah" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kontribusi Modal Mitra 1 (IDR)
                      </label>
                      <input
                        type="number"
                        value={kontribusiModal[0].jumlah}
                        onChange={(e) => {
                          const updated = [...kontribusiModal];
                          updated[0].jumlah = Number(e.target.value);
                          setKontribusiModal(updated);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kontribusi Modal Mitra 2 (IDR)
                      </label>
                      <input
                        type="number"
                        value={kontribusiModal[1].jumlah}
                        onChange={(e) => {
                          const updated = [...kontribusiModal];
                          updated[1].jumlah = Number(e.target.value);
                          setKontribusiModal(updated);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nisbah Mitra 1 (%)
                      </label>
                      <input
                        type="number"
                        value={nisbahBagiHasil[0].persentase}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNisbahBagiHasil([
                            { ...nisbahBagiHasil[0], persentase: val },
                            { ...nisbahBagiHasil[1], persentase: 100 - val },
                          ]);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nisbah Mitra 2 (%)
                      </label>
                      <input
                        type="number"
                        value={nisbahBagiHasil[1].persentase}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setNisbahBagiHasil([
                            { ...nisbahBagiHasil[0], persentase: 100 - val },
                            { ...nisbahBagiHasil[1], persentase: val },
                          ]);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Ketentuan Wewenang Pengelolaan Usaha
                      </label>
                      <textarea
                        rows={3}
                        value={wewenangPengelolaan}
                        onChange={(e) => setWewenangPengelolaan(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* KHUSUS MURABAHAH */}
              {jenis === "murabahah" && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jenis & Nama Barang Jual Beli
                      </label>
                      <input
                        type="text"
                        value={jenisBarang}
                        onChange={(e) => setJenisBarang(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Spesifikasi Teknis & Kondisi Barang
                      </label>
                      <input
                        type="text"
                        value={spesifikasiBarang}
                        onChange={(e) => setSpesifikasiBarang(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Harga Pokok Perolehan (IDR)
                      </label>
                      <input
                        type="number"
                        value={hargaPokok}
                        onChange={(e) => setHargaPokok(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Margin Keuntungan Penjual (IDR)
                      </label>
                      <input
                        type="number"
                        value={marginKeuntungan}
                        onChange={(e) => setMarginKeuntungan(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span>Harga Jual Total (Pokok + Margin):</span>
                    <span className="font-bold text-amber-950 text-base">
                      Rp {formatRupiah(hargaPokok + marginKeuntungan)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jumlah / Kuantitas Barang
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={jumlahBarang}
                        onChange={(e) => setJumlahBarang(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Satuan Barang
                      </label>
                      <input
                        type="text"
                        value={satuanBarang}
                        onChange={(e) => setSatuanBarang(e.target.value)}
                        placeholder="Contoh: unit, paket, set"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={barangDimiliki}
                        onChange={(e) => {
                          setBarangDimiliki(e.target.checked);
                          if (e.target.checked) setAdaWakalah(false);
                        }}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-800">
                        Barang Telah Dimiliki / Dikuasai Sah oleh Penjual
                      </span>
                    </label>

                    {!barangDimiliki && (
                      <label className="flex items-center gap-2 cursor-pointer pl-6">
                        <input
                          type="checkbox"
                          checked={adaWakalah}
                          onChange={(e) => setAdaWakalah(e.target.checked)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-slate-700">
                          Sertakan Akad Kuasa Pembelian (Wakalah) untuk Pengadaan Barang
                        </span>
                      </label>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pembayaranTangguh}
                        onChange={(e) => setPembayaranTangguh(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-800">
                        Pembayaran Secara Angsuran / Cicilan Bertahap
                      </span>
                    </label>

                    {pembayaranTangguh && (
                      <div className="pl-6 flex items-center gap-3">
                        <span className="text-slate-600">Jumlah Bulan Angsuran:</span>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={jumlahAngsuran}
                          onChange={(e) => setJumlahAngsuran(Number(e.target.value))}
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                        />
                        <span className="text-slate-500">bulan (Rp {formatRupiah(Math.round((hargaPokok + marginKeuntungan) / (jumlahAngsuran || 1)))}/bulan)</span>
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adaDenda}
                        onChange={(e) => setAdaDenda(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-800">
                        Klausul Ganti Rugi / Denda Keterlambatan sebagai Dana Sosial (Ta&apos;zir)
                      </span>
                    </label>

                    {adaDenda && (
                      <div className="pl-6 flex items-center gap-3">
                        <span className="text-slate-600">Besaran Denda per Hari (IDR):</span>
                        <input
                          type="number"
                          value={jumlahDenda}
                          onChange={(e) => setJumlahDenda(Number(e.target.value))}
                          className="w-36 px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                        />
                        <span className="text-slate-400 text-[11px]">(Disalurkan untuk kas sosial/amal)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: UJI KEPATUHAN (EXPLAINABLE FINDINGS REPORT) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold mb-1">
                    <span>RULE ENGINE: {compliance.rulesVersion || "v1.2.0-traceable"}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Langkah 4: Laporan Hasil Pemeriksaan Kepatuhan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluasi kesesuaian fakta transaksi terhadap Fatwa DSN-MUI, Kompilasi Hukum Ekonomi Syariah (KHES), dan KUHPerdata.
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold ${
                      compliance.hasBlockingErrors
                        ? "bg-rose-100 text-rose-900 border border-rose-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {compliance.hasBlockingErrors
                      ? "Terdapat Kendala (Blocker)"
                      : "Persyaratan Spesifik Terpenuhi (PASS)"}
                  </span>
                </div>
              </div>

              {/* Status Structured Summary Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-2xl font-black text-emerald-800">
                    {compliance.statusCounts?.pass ?? compliance.passedCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mt-0.5">
                    PASS
                  </div>
                  <div className="text-[10px] text-emerald-700">Persyaratan terpenuhi</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-2xl font-black text-amber-800">
                    {compliance.statusCounts?.needsInformation ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mt-0.5">
                    NEEDS INFO
                  </div>
                  <div className="text-[10px] text-amber-700">Informasi belum lengkap</div>
                </div>

                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-center">
                  <div className="text-2xl font-black text-orange-800">
                    {compliance.statusCounts?.reviewRequired ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-900 mt-0.5">
                    REVIEW REQ
                  </div>
                  <div className="text-[10px] text-orange-700">Perlu telaah manusia/ahli</div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-2xl font-black text-rose-800">
                    {compliance.statusCounts?.fail ?? compliance.blockCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-900 mt-0.5">
                    FAIL
                  </div>
                  <div className="text-[10px] text-rose-700">Ketidaksesuaian terverifikasi</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-center col-span-2 sm:col-span-1">
                  <div className="text-2xl font-black text-slate-800">
                    {compliance.statusCounts?.notChecked ?? 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 mt-0.5">
                    NOT CHECKED
                  </div>
                  <div className="text-[10px] text-slate-600">Di luar lingkup sistem</div>
                </div>
              </div>

              {/* Methodology & Limitation Alert */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Prinsip Kejujuran Produk (Honesty & Traceability):</span>
                </div>
                <p>
                  {compliance.disclaimer}
                </p>
              </div>

              {/* Findings Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500 mr-2">Filter Temuan:</span>
                <button
                  type="button"
                  onClick={() => setFindingsFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    findingsFilter === "ALL"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Semua ({compliance.results.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFindingsFilter("ACTION_REQUIRED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    findingsFilter === "ACTION_REQUIRED"
                      ? "bg-rose-700 text-white"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100"
                  }`}
                >
                  Perlu Tindakan ({(compliance.statusCounts?.fail || 0) + (compliance.statusCounts?.needsInformation || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setFindingsFilter("REVIEW_REQUIRED")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    findingsFilter === "REVIEW_REQUIRED"
                      ? "bg-orange-700 text-white"
                      : "bg-orange-50 text-orange-900 hover:bg-orange-100"
                  }`}
                >
                  Perlu Telaah Ahli ({compliance.statusCounts?.reviewRequired || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setFindingsFilter("PASS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    findingsFilter === "PASS"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  Lolos ({compliance.statusCounts?.pass || 0})
                </button>
              </div>

              {/* Explainable Findings List */}
              <div className="space-y-4">
                {compliance.results
                  .filter((res) => {
                    if (findingsFilter === "ACTION_REQUIRED") {
                      return res.status === "FAIL" || res.status === "NEEDS_INFORMATION";
                    }
                    if (findingsFilter === "REVIEW_REQUIRED") {
                      return res.status === "REVIEW_REQUIRED";
                    }
                    if (findingsFilter === "PASS") {
                      return res.status === "PASS";
                    }
                    return true;
                  })
                  .map((res) => {
                    const isExpanded = expandedFindingId === res.ruleId;
                    const statusCardStyle =
                      res.status === "FAIL"
                        ? "border-rose-300 bg-rose-50/40"
                        : res.status === "NEEDS_INFORMATION"
                        ? "border-amber-300 bg-amber-50/40"
                        : res.status === "REVIEW_REQUIRED"
                        ? "border-orange-300 bg-orange-50/40"
                        : res.status === "NOT_CHECKED"
                        ? "border-slate-300 bg-slate-50/50"
                        : "border-emerald-200 bg-emerald-50/20";

                    const statusBadgeStyle =
                      res.status === "FAIL"
                        ? "bg-rose-100 text-rose-900 border-rose-300"
                        : res.status === "NEEDS_INFORMATION"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : res.status === "REVIEW_REQUIRED"
                        ? "bg-orange-100 text-orange-900 border-orange-300"
                        : res.status === "NOT_CHECKED"
                        ? "bg-slate-200 text-slate-800 border-slate-300"
                        : "bg-emerald-100 text-emerald-900 border-emerald-300";

                    return (
                      <div
                        key={res.ruleId}
                        className={`rounded-2xl border p-4.5 transition-all text-xs space-y-3 ${statusCardStyle}`}
                      >
                        {/* Finding Header */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-md border border-slate-300 shadow-2xs">
                              {res.ruleId}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeStyle}`}
                            >
                              {res.status}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                                res.severity === "block"
                                  ? "bg-rose-100 text-rose-800"
                                  : res.severity === "warn"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              Tingkat: {res.severity}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedFindingId(isExpanded ? null : res.ruleId)
                            }
                            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                          >
                            <span>{isExpanded ? "Sembunyikan Telaah" : "Lihat Telaah Lengkap"}</span>
                            <span>{isExpanded ? "▲" : "▼"}</span>
                          </button>
                        </div>

                        {/* Core Message */}
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-snug">
                            {res.message}
                          </p>
                          {res.requirementTested && (
                            <p className="text-slate-600 mt-1">
                              <span className="font-medium text-slate-700">Aspek Yang Diuji:</span> {res.requirementTested}
                            </p>
                          )}
                        </div>

                        {/* Expandable Explainable Breakdown */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-200/80 space-y-3 bg-white/70 p-3.5 rounded-xl border">
                            {/* Facts Evaluated */}
                            {res.factsEvaluated && res.factsEvaluated.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-800 block mb-1">
                                  1. Fakta Transaksi Aktual yang Dievaluasi:
                                </span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-mono text-[11px]">
                                  {res.factsEvaluated.map((fact, idx) => (
                                    <li key={idx}>{fact}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Related Clauses in Draft */}
                            {res.relatedClauseIds && res.relatedClauseIds.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-800 block mb-1">
                                  2. Bagian Draf yang Terkait:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {res.relatedClauseIds.map((clauseId) => (
                                    <span
                                      key={clauseId}
                                      className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                                    >
                                      {clauseId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Legal Rationale / Explanation */}
                            {res.explanation && (
                              <div>
                                <span className="font-bold text-slate-800 block mb-0.5">
                                  3. Mengapa Temuan Ini Muncul (Alasan Yuridis & Fikih):
                                </span>
                                <p className="text-slate-600 leading-relaxed">{res.explanation}</p>
                              </div>
                            )}

                            {/* Unknowns / Limitations */}
                            {res.unknowns && res.unknowns.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200">
                                <span className="font-bold text-slate-800 block mb-0.5">
                                  4. Apa yang Masih Belum Diketahui oleh Sistem:
                                </span>
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                                  {res.unknowns.map((unk, idx) => (
                                    <li key={idx}>{unk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Actionable Suggestion */}
                            {res.actionableSuggestion && (
                              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                                <span className="font-bold block mb-0.5">
                                  5. Langkah Perbaikan yang Disarankan:
                                </span>
                                <p>{res.actionableSuggestion}</p>
                              </div>
                            )}

                            {/* Expert Review Callout */}
                            {res.expertReviewRequired && (
                              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-950">
                                <span className="font-bold block mb-0.5">
                                  6. Kebutuhan Penilaian Ahli:
                                </span>
                                <p>{res.expertReviewReason || "Aspek ini membutuhkan penilaian dari Dewan Pengawas Syariah atau praktisi hukum berpengalaman."}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Legal References Quick Link Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-medium">Dasar Hukum & Fatwa:</span>
                            {res.legalSourceIds.map((srcId) => (
                              <button
                                key={srcId}
                                type="button"
                                onClick={() => setSelectedLegalSourceId(srcId)}
                                className="text-[10px] font-mono bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 px-2 py-0.5 rounded font-semibold transition-colors"
                              >
                                {srcId} ↗
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Status Verifikasi Sumber: {res.sourcesVerificationStatus || "UNVERIFIED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {compliance.hasBlockingErrors && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Perhatian Kepatuhan:</span>
                  </div>
                  <p>
                    Terdapat aturan berstatus <strong>FAIL (Block)</strong> atau data esensial yang belum lengkap. Harap kembali ke langkah sebelumnya untuk melengkapi data sebelum menghasilkan draf dokumen akhir.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PRATINJAU DRAF, SAFE REVISION & EKSPOR DOKUMEN (F4, F5, C1, C5, C6) */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Header with Versioning and Export Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      Versi Draf: v{effectiveDraft.draftVersion || 1}.0
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                      Rules: {effectiveDraft.rulesVersion || "v1.2.0"}
                    </span>
                    {effectiveDraft.isStale && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-bold border border-orange-300 animate-pulse">
                        Perlu Evaluasi Ulang
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Langkah 5: Pratinjau Dokumen Akad & Penelaahan Klausul
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nomor Dokumen: <span className="font-mono font-semibold text-slate-800">{effectiveDraft.nomorDokumen}</span>
                  </p>
                </div>

                {/* Real Export Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportToWordDoc(effectiveDraft)}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Unduh Word (.doc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportToMarkdown(effectiveDraft)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Unduh Markdown (.md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <span>Cetak / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = document.getElementById("document-preview-content")?.innerText || "";
                      navigator.clipboard.writeText(text);
                      alert("Teks draf akad berhasil disalin ke papan klip!");
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 flex items-center gap-1 transition-all"
                  >
                    <span>Salin</span>
                  </button>
                </div>
              </div>

              {/* Stale Warning & Re-evaluation Banner */}
              {effectiveDraft.isStale && (
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-orange-950">
                  <div>
                    <span className="font-bold block">Peringatan Integritas Draf (Stale State):</span>
                    <p>
                      Klausul telah diubah secara manual. Evaluasi kepatuhan sebelumnya tidak lagi mencerminkan draf yang disunting sampai pemeriksaan ulang dijalankan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReevaluateDraft}
                    className="px-4 py-2 bg-orange-800 hover:bg-orange-900 text-white font-bold rounded-xl text-xs shrink-0 transition-colors"
                  >
                    Periksa Ulang Draf Ini
                  </button>
                </div>
              )}

              {/* The Contract Document Sheet */}
              <div
                id="document-preview-content"
                className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-12 shadow-sm font-serif text-slate-900 space-y-8 print:border-none print:p-0"
              >
                {/* Header */}
                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-6">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                    {effectiveDraft.judul}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    Nomor: {effectiveDraft.nomorDokumen}
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Draf Versi v{effectiveDraft.draftVersion || 1}.0 • Mesin Aturan: {effectiveDraft.rulesVersion || "v1.2.0"}
                  </p>
                </div>

                {/* Komparisi Para Pihak */}
                <div className="text-xs sm:text-sm leading-relaxed space-y-3">
                  <p>
                    Pada hari ini bertempat di <span className="font-semibold">{currentFormData.domisiliHukum}</span>, telah dibuat dan disepakati perjanjian kerja sama syariah oleh dan antara:
                  </p>
                  <div className="pl-4 space-y-3">
                    {currentFormData.ppihat.map((p, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold">
                          {idx + 1}. {p.nama}
                        </p>
                        <p className="text-slate-700">
                          {p.jenisIdentitas}: {p.identitas}
                        </p>
                        <p className="text-slate-700">
                          Alamat: {p.alamat}
                        </p>
                        <p className="italic text-slate-600">
                          Selanjutnya disebut sebagai &quot;Pihak ke-{idx + 1}&quot; ({p.peran.replace("_", " ")}).
                        </p>
                      </div>
                    ))}
                  </div>
                  <p>
                    Seluruh pihak tersebut di atas secara bersama-sama disebut sebagai &quot;Para Pihak&quot;.
                  </p>
                </div>

                {/* Pertimbangan */}
                <div className="text-xs sm:text-sm leading-relaxed space-y-2">
                  <p className="font-bold font-sans uppercase tracking-wider text-xs">Pertimbangan:</p>
                  <p className="whitespace-pre-line text-slate-700">{effectiveDraft.pertimbangan}</p>
                </div>

                {/* Pasal-Pasal dengan Fitur Clause-Level Review & Safe Revision */}
                <div className="space-y-6 pt-2">
                  {effectiveDraft.klausul.map((clause) => (
                    <div
                      key={clause.nomor}
                      className={`space-y-2 border-t pt-4 rounded-xl p-3 transition-colors ${
                        clause.isCustomized
                          ? "bg-amber-50/30 border-amber-300"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Clause Title & Management Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-900 font-sans">
                            Pasal {clause.nomor}: {clause.judul}
                          </h4>
                          {clause.isCustomized && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              Diedit Pengguna
                            </span>
                          )}
                        </div>

                        {/* Clause Review & Edit Action Buttons (Print-hidden) */}
                        <div className="flex items-center gap-1.5 print:hidden">
                          <button
                            type="button"
                            onClick={() => handleStartEditClause(clause)}
                            className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                          >
                            ✎ Ubah Klausul (Revisi)
                          </button>
                          {clause.isCustomized && (
                            <button
                              type="button"
                              onClick={() => handleResetClause(clause.nomor)}
                              className="text-[11px] font-sans font-semibold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
                            >
                              Reset ke Asli
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Clause Purpose (Clarity) */}
                      {clause.purpose && (
                        <div className="text-[11px] font-sans text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/70 print:hidden">
                          <span className="font-semibold text-emerald-900">Tujuan Klausul:</span> {clause.purpose}
                        </div>
                      )}

                      {/* Actual Clause Text */}
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800 pt-1">
                        {clause.teks}
                      </p>

                      {/* Clause Legal References and Rules */}
                      {clause.legalSourceIds && clause.legalSourceIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 print:hidden">
                          <span className="text-[10px] text-slate-400 font-sans">Rujukan Hukum:</span>
                          {clause.legalSourceIds.map((srcId) => (
                            <button
                              key={srcId}
                              type="button"
                              onClick={() => setSelectedLegalSourceId(srcId)}
                              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 font-sans font-semibold"
                            >
                              {srcId} ↗
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Penutup & Tanda Tangan */}
                <div className="space-y-8 pt-6 border-t-2 border-slate-900">
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {effectiveDraft.penutup}
                  </p>
                </div>

                {/* Disklaimer di bagian akhir dokumen */}
                <div className="pt-8 border-t border-slate-300">
                  <DisclaimerBanner compact />
                </div>
              </div>

              {/* Research Questionnaire Call to Action */}
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-950 text-sm">
                    Kuesioner Validasi & Uji Coba Riset
                  </h4>
                  <p className="text-amber-900">
                    Mohon luangkan waktu untuk mengisi kuesioner respon dan penilaian kelayakan draf akad ini untuk data skripsi.
                  </p>
                </div>
                <Link
                  href={`/penilaian?akad=${jenis}`}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                >
                  Beri Nilai & Masukan
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons (Prev / Next) */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Sebelumnya
              </button>
            ) : (
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={step === 4 && compliance.hasBlockingErrors}
                onClick={() => setStep(step + 1)}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all ${
                  step === 4 && compliance.hasBlockingErrors
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800 active:scale-95"
                }`}
              >
                {step === 4 ? "Tampilkan Draf Akad" : "Lanjutkan"}
              </button>
            ) : (
              <Link
                href={`/penilaian?akad=${jenis}`}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all"
              >
                Selesai & Nilai Draf Ini
              </Link>
            )}
          </div>
        </div>

        {/* Safe Clause Revision Modal (C.5) */}
        {editingClause && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Pasal {editingClause.nomor}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">
                    Revisi Klausul: {editingClause.judul}
                  </h3>
                  {editingClause.purpose && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tujuan Klausul: {editingClause.purpose}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingClause(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Original Generator Text Preview */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700">Teks Asli Generator:</span>
                <div className="p-3 rounded-xl bg-slate-100 text-slate-600 whitespace-pre-line border border-slate-200 text-xs font-serif leading-relaxed">
                  {editingClause.originalText || editingClause.teks}
                </div>
              </div>

              {/* User Edit Textarea */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Teks Revisi Anda:</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {clauseEditText.length} karakter
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={clauseEditText}
                  onChange={(e) => setClauseEditText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-serif text-slate-900 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Consequence Explanation (Honesty) */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Konsekuensi Hukum Perubahan:</span>
                <p>
                  Sistem tidak menampilkan usulan perubahan sebagai pendapat hukum pasti. Penyuntingan klausul akan menaikkan nomor versi draf (vX.X) dan menandai status draf sebagai <em>Perlu Evaluasi Ulang</em> untuk diverifikasi oleh ahli.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClause(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveClauseEdit}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Terapkan Perubahan Klausul
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legal Source Detail Modal (Verified Registry Detail Modal) */}
        {selectedLegalSourceId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              {(() => {
                const src = legalSources.find((s) => s.id === selectedLegalSourceId);
                if (!src) return null;
                const badgeInfo = getVerificationBadge(src.verificationStatus);

                return (
                  <>
                    <div className="flex items-start justify-between border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            {src.id}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}>
                            {src.verificationStatus || "UNVERIFIED"}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-2">
                          {src.title}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold">{src.officialNumber || src.number}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLegalSourceId(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-xs text-slate-700 space-y-3">
                      {src.specificArticle && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <span className="font-semibold text-emerald-950 block mb-0.5">Pasal / Butir Spesifik yang Dirujuk:</span>
                          <p className="text-emerald-900 font-mono text-[11px]">{src.specificArticle}</p>
                        </div>
                      )}

                      {src.authorityName && (
                        <div>
                          <span className="font-semibold text-slate-900 block">Lembaga Penerbit / Otoritas:</span>
                          <p className="text-slate-600">{src.authorityName}</p>
                        </div>
                      )}

                      {src.note && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="font-semibold text-slate-900 block mb-1">Intisari Norma Rujukan:</span>
                          <p className="text-slate-600 leading-relaxed">{src.note}</p>
                        </div>
                      )}

                      {src.limitationNote && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                          <span className="font-semibold block mb-0.5">Keterbatasan & Catatan Validasi Ahli:</span>
                          <p className="leading-relaxed">{src.limitationNote}</p>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                        <span>Pemeriksaan Terakhir: {src.lastCheckedDate || "2026-03-01"}</span>
                        {src.officialUrl && (
                          <a
                            href={src.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                          >
                            Tautan Resmi Dokumen ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLegalSourceId(null)}
                        className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        Tutup
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
