"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import {
  AKAD_METADATA,
  AkadType,
  MudharabahFormData,
  MusyarakahFormData,
  MurabahahFormData,
  PartyInfo,
  WitnessInfo,
} from "@/core/types";
import { evaluateCompliance } from "@/core/rules";
import { generateDraft, formatRupiah } from "@/core/generator";
import { legalSources } from "@/core/legalSources";

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

          {/* STEP 4: UJI KEPATUHAN (COMPLIANCE REVIEW) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Langkah 4: Hasil Evaluasi Mesin Aturan Kepatuhan (F3)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pemeriksaan otomatis kesesuaian isian terhadap Fatwa DSN-MUI, KHES, dan KUHPerdata.
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      compliance.hasBlockingErrors
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {compliance.hasBlockingErrors
                      ? "Perlu Perbaikan (Block)"
                      : "Memenuhi Syarat Kepatuhan"}
                  </span>
                </div>
              </div>

              {/* Status summary banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-xl font-bold text-emerald-800">{compliance.passedCount}</div>
                  <div className="text-[11px] font-medium text-emerald-950">Aturan Lolos</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-xl font-bold text-amber-800">{compliance.warningCount}</div>
                  <div className="text-[11px] font-medium text-amber-950">Peringatan (Warn)</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-xl font-bold text-rose-800">{compliance.blockCount}</div>
                  <div className="text-[11px] font-medium text-rose-950">Menolak (Block)</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xl font-bold text-blue-800">{compliance.infoCount}</div>
                  <div className="text-[11px] font-medium text-blue-950">Klausul Otomatis</div>
                </div>
              </div>

              {/* Rule list details */}
              <div className="space-y-3">
                {compliance.results.map((res) => {
                  const badgeColor =
                    res.severity === "block" && !res.passed
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : res.severity === "warn" && !res.passed
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-800";

                  return (
                    <div
                      key={res.ruleId}
                      className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-4 ${badgeColor}`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300">
                            {res.ruleId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              res.passed
                                ? "bg-emerald-100 text-emerald-800"
                                : res.severity === "block"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {res.passed ? "Lolos" : res.severity}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-1">
                          {res.message}
                        </p>
                      </div>

                      {/* Legal references button */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {res.legalSourceIds.map((srcId) => (
                          <button
                            key={srcId}
                            type="button"
                            onClick={() => setSelectedLegalSourceId(srcId)}
                            className="text-[10px] text-emerald-800 hover:text-emerald-950 underline font-medium"
                          >
                            Rujukan: {srcId}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {compliance.hasBlockingErrors && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900">
                  <span className="font-bold">Perhatian:</span> Terdapat aturan berstatus <strong>Block</strong> yang belum terpenuhi. Silakan kembali ke langkah sebelumnya untuk melengkapi atau memperbaiki data sebelum membuat draf dokumen.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: HASIL DRAF & PRATINJAU DOKUMEN (F4 & F5) */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Langkah 5: Pratinjau Dokumen Akad
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Nomor Dokumen: <span className="font-mono font-semibold text-slate-800">{generatedDraft.nomorDokumen}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <span>Cetak / Simpan PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = document.getElementById("document-preview-content")?.innerText || "";
                      navigator.clipboard.writeText(text);
                      alert("Teks draf akad berhasil disalin ke papan klip!");
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 flex items-center gap-2 transition-all"
                  >
                    <span>Salin Teks Dokumen</span>
                  </button>
                </div>
              </div>

              {/* The Contract Document Sheet */}
              <div
                id="document-preview-content"
                className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-12 shadow-sm font-serif text-slate-900 space-y-8 print:border-none print:p-0"
              >
                {/* Header */}
                <div className="text-center space-y-1 border-b-2 border-slate-900 pb-6">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900 font-sans">
                    {generatedDraft.judul}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-slate-600">
                    Nomor: {generatedDraft.nomorDokumen}
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
                  <p className="whitespace-pre-line text-slate-700">{generatedDraft.pertimbangan}</p>
                </div>

                {/* Pasal-Pasal */}
                <div className="space-y-6 pt-2">
                  {generatedDraft.klausul.map((clause) => (
                    <div key={clause.nomor} className="space-y-1.5 border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-900 font-sans">
                          Pasal {clause.nomor}: {clause.judul}
                        </h4>
                        {clause.legalSourceIds.length > 0 && (
                          <div className="flex gap-1 print:hidden">
                            {clause.legalSourceIds.map((srcId) => (
                              <button
                                key={srcId}
                                type="button"
                                onClick={() => setSelectedLegalSourceId(srcId)}
                                className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 font-sans font-medium"
                              >
                                Dasar Hukum: {srcId}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800">
                        {clause.teks}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Penutup & Tanda Tangan */}
                <div className="space-y-8 pt-6 border-t-2 border-slate-900">
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {generatedDraft.penutup}
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

        {/* Legal Source Detail Modal (F6) */}
        {selectedLegalSourceId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              {(() => {
                const src = legalSources.find((s) => s.id === selectedLegalSourceId);
                if (!src) return null;
                return (
                  <>
                    <div className="flex items-start justify-between border-b pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                          {src.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-2">
                          {src.title}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold">{src.number}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLegalSourceId(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
                      >
                        Tutup
                      </button>
                    </div>

                    <div className="text-xs text-slate-700 space-y-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-900 block mb-1">Catatan Verifikasi Ahli:</span>
                        <p className="text-slate-600 leading-relaxed">{src.note || "Belum ada catatan khusus."}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Status Validasi:</span>
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum Diverifikasi Ahli (Tahap Uji Coba)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLegalSourceId(null)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
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
