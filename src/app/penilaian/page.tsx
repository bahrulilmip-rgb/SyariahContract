"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AkadType, PenilaiRole, PenilaianItem } from "@/core/types";

const ASPEK_AHLI = [
  {
    aspekId: "isi-hukum",
    aspekLabel: "Ketepatan Isi Hukum & Syarat Sah Perjanjian (KUHPerdata 1320 & KHES)",
    deskripsi: "Klausul komparisi, hak dan kewajiban, serta domisili hukum memenuhi standar perancangan kontrak.",
  },
  {
    aspekId: "kesesuaian-syariah",
    aspekLabel: "Kesesuaian dengan Fikih Muamalah & Fatwa DSN-MUI",
    deskripsi: "Ketentuan nisbah, modal, pembagian risiko, objek halal, dan larangan riba/maysir terakomodasi.",
  },
  {
    aspekId: "kebahasaan",
    aspekLabel: "Kerapian & Kebakuan Bahasa Hukum Indonesia",
    deskripsi: "Penggunaan istilah hukum syariah dan bahasa Indonesia baku yang jelas dan tidak multitafsir.",
  },
  {
    aspekId: "tampilan",
    aspekLabel: "Struktur & Keterbacaan Tampilan Dokumen",
    deskripsi: "Hierarki pasal, penomoran, format tanggal, kolom tanda tangan, dan panel dasar hukum informatif.",
  },
  {
    aspekId: "kepraktisan",
    aspekLabel: "Kepraktisan Mesin Aturan Kepatuhan (Rule Engine)",
    deskripsi: "Mesin aturan efektif mendeteksi dan mencegah kekeliruan mendasar pada perancangan draf akad.",
  },
];

const ASPEK_PENGGUNA = [
  {
    aspekId: "kemudahan-penggunaan",
    aspekLabel: "Kemudahan Pengisian Formulir Bertahap",
    deskripsi: "Langkah-langkah wizard mudah dipahami oleh pelaku usaha tanpa latar belakang hukum formal.",
  },
  {
    aspekId: "kecepatan-penyusunan",
    aspekLabel: "Efisiensi Waktu Penyusunan Draf (< 10 Menit)",
    deskripsi: "Aplikasi membantu menghasilkan draf kontrak bisnis secara cepat dan tidak berbelit-belit.",
  },
  {
    aspekId: "kejelasan-petunjuk",
    aspekLabel: "Kejelasan Penjelasan & Contoh Kasus",
    deskripsi: "Contoh kasus UMKM dan pesan peringatan kepatuhan membantu saya memahami isi perjanjian.",
  },
  {
    aspekId: "kegunaan-dokumen",
    aspekLabel: "Kemanfaatan Dokumen bagi Kemitraan Bisnis",
    deskripsi: "Draf yang dihasilkan siap digunakan sebagai dasar kesepakatan tertulis yang adil dengan mitra.",
  },
  {
    aspekId: "kepuasan-tampilan",
    aspekLabel: "Kepuasan terhadap Tampilan & Fitur Cetak/PDF",
    deskripsi: "Tampilan aplikasi rapi, profesional, dan dokumen mudah disimpan atau dicetak.",
  },
];

function PenilaianContent() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") || "pengguna") as PenilaiRole;
  const initialAkad = (searchParams.get("akad") || "mudharabah") as AkadType;

  const [role, setRole] = useState<PenilaiRole>(initialRole);
  const [selectedAkad, setSelectedAkad] = useState<AkadType>(initialAkad);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saran, setSaran] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [showAdminExport, setShowAdminExport] = useState(false);
  const [savedDataCount, setSavedDataCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem("syariah_contract_penilaian");
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const currentAspek = role === "ahli" ? ASPEK_AHLI : ASPEK_PENGGUNA;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const items: PenilaianItem[] = currentAspek.map((a) => ({
      aspekId: a.aspekId,
      aspekLabel: a.aspekLabel,
      nilai: scores[a.aspekId] || 4,
    }));

    const payload = {
      id: `val-${Date.now()}`,
      peran: role,
      jenisAkad: selectedAkad,
      timestamp: new Date().toISOString(),
      items,
      saran,
    };

    // Save to localStorage as stateless fallback (stateless PRD requirement)
    try {
      const existing = JSON.parse(
        localStorage.getItem("syariah_contract_penilaian") || "[]"
      );
      existing.push(payload);
      localStorage.setItem(
        "syariah_contract_penilaian",
        JSON.stringify(existing)
      );
      setSavedDataCount(existing.length);
    } catch {
      // ignore
    }

    setIsSubmitted(true);
  };

  const exportCSV = () => {
    try {
      const existing = JSON.parse(
        localStorage.getItem("syariah_contract_penilaian") || "[]"
      );
      if (existing.length === 0) {
        alert("Belum ada data penilaian yang tersimpan.");
        return;
      }

      // Convert to CSV
      const headers = ["ID", "Waktu", "Peran", "Akad", "Skor Rata-Rata", "Saran"];
      const rows = existing.map((row: { id: string; timestamp: string; peran: string; jenisAkad: string; items: { nilai: number }[]; saran: string }) => {
        const avg = (
          row.items.reduce((s: number, i: { nilai: number }) => s + i.nilai, 0) /
          (row.items.length || 1)
        ).toFixed(2);
        return [
          row.id,
          row.timestamp,
          row.peran,
          row.jenisAkad,
          avg,
          `"${(row.saran || "").replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `penilaian_skripsi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Gagal mengekspor CSV.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              Instrumen Validasi & Uji Coba Riset (Fitur F8)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kuesioner Penilaian Kelayakan Aplikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Instrumen ini digunakan untuk mengumpulkan data penelitian skripsi model 3D (Define, Design, Develop). Evaluasi Anda akan digunakan untuk mengukur skor kelayakan dan kepraktisan aplikasi.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Terima Kasih atas Penilaian Anda
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Masukan dan skor evaluasi Anda sangat berharga bagi kelengkapan data penelitian skripsi R&D Fakultas Syariah dan Hukum, UIN Walisongo Semarang.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Isi Kuesioner Baru
                </button>
                <Link
                  href="/"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role & Akad Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                    Peran Penilai:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("ahli")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        role === "ahli"
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Validator Ahli (Hukum / Syariah)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("pengguna")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        role === "pengguna"
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Pelaku Usaha UMKM
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                    Jenis Akad yang Dievaluasi:
                  </label>
                  <select
                    value={selectedAkad}
                    onChange={(e) => setSelectedAkad(e.target.value as AkadType)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-emerald-600"
                  >
                    <option value="mudharabah">Akad Mudharabah (Bagi Hasil Investasi)</option>
                    <option value="musyarakah">Akad Musyarakah (Kemitraan Modal Bersama)</option>
                    <option value="murabahah">Akad Murabahah (Jual Beli)</option>
                  </select>
                </div>
              </div>

              {/* Likert Scale Guidelines */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">Skala Penilaian (1 s.d. 5):</span>
                <span className="flex items-center gap-3">
                  <span><strong>1:</strong> Sangat Tidak Layak</span>
                  <span><strong>2:</strong> Kurang</span>
                  <span><strong>3:</strong> Cukup</span>
                  <span><strong>4:</strong> Layak</span>
                  <span><strong>5:</strong> Sangat Layak</span>
                </span>
              </div>

              {/* Likert Rating Items */}
              <div className="space-y-6">
                {currentAspek.map((item, index) => (
                  <div
                    key={item.aspekId}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">
                          {index + 1}. {item.aspekLabel}
                        </h3>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          Nilai: {scores[item.aspekId] || 4}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Radio Likert 1-5 */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = (scores[item.aspekId] || 4) === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setScores({ ...scores, [item.aspekId]: val })
                            }
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-emerald-700 text-white shadow-xs scale-102"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Text Suggestions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kritik, Saran, dan Catatan Penyempurnaan (Kualitatif):
                </label>
                <textarea
                  rows={4}
                  value={saran}
                  onChange={(e) => setSaran(e.target.value)}
                  placeholder="Tuliskan saran perbaikan untuk redaksi klausul hukum, aturan kepatuhan syariah, atau kenyamanan antarmuka..."
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs focus:outline-emerald-600 bg-white"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdminExport(!showAdminExport)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Admin Export ({savedDataCount} tersimpan)
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  Kirim Penilaian Penelitian →
                </button>
              </div>
            </form>
          )}

          {/* Admin CSV Export Modal */}
          {showAdminExport && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">Panel Admin: Ekspor Data Riset (CSV)</span>
                <button
                  type="button"
                  onClick={() => setShowAdminExport(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Data penilaian tersimpan secara lokal dan anonim (tanpa identitas pribadi) untuk analisis instrumen skripsi.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Masukkan Kunci Akses Admin (default: admin123)"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (adminPass === "admin123" || adminPass === "walisongo") {
                      exportCSV();
                    } else {
                      alert("Kunci akses admin salah. Gunakan 'admin123' atau 'walisongo'.");
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white text-xs"
                >
                  Unduh CSV
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PenilaianPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Memuat instrumen penilaian...</div>}>
      <PenilaianContent />
    </Suspense>
  );
}
