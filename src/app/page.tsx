import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { AKAD_METADATA } from "@/core/types";
import { legalSources } from "@/core/legalSources";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-50 via-emerald-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-emerald-100/60 bg-linear-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Academic & Innovation Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>R&D Skripsi Ilmu Hukum — UIN Walisongo Semarang</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
                  Penyusunan Draf Akad Syariah UMKM yang{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-amber-300">
                    Sah, Tertib & Praktis
                  </span>
                </h1>

                {/* Subtitle with Product Identity */}
                <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Membantu pelaku usaha memahami apa yang mereka sepakati, mengapa suatu klausul diperlukan, dan bagian mana yang masih membutuhkan pemeriksaan lebih lanjut sesuai rujukan Fatwa DSN-MUI, KHES, dan KUHPerdata.
                </p>

                {/* Core Principles */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-emerald-200">
                  <span className="bg-emerald-800/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Clarity</span>
                  <span className="bg-emerald-800/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Traceability</span>
                  <span className="bg-emerald-800/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Honesty</span>
                  <span className="bg-emerald-800/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Human Oversight</span>
                  <span className="bg-emerald-800/40 border border-emerald-400/30 px-2.5 py-1 rounded-lg">Privacy</span>
                </div>

                {/* CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="#pilih-akad"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-emerald-950 bg-linear-to-r from-amber-300 via-amber-200 to-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    <span>Mulai Susun Draf Sekarang</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="#dasar-hukum"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-medium text-emerald-100 bg-white/10 hover:bg-white/15 border border-white/20 active:scale-98 transition-all backdrop-blur-xs"
                  >
                    <span>Pustaka Rujukan Hukum</span>
                  </Link>
                </div>

                {/* Key Badges */}
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">Generator</div>
                    <div className="text-sm font-semibold text-white mt-0.5">Adaptif & Aman</div>
                    <div className="text-[11px] text-emerald-200/70">Klausul relevan berdasar fakta</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono uppercase text-teal-300 font-bold">Kepatuhan</div>
                    <div className="text-sm font-semibold text-white mt-0.5">Rule Engine</div>
                    <div className="text-[11px] text-emerald-200/70">Status terstruktur & dapat diuji</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">Format</div>
                    <div className="text-sm font-semibold text-white mt-0.5">Word & PDF</div>
                    <div className="text-[11px] text-emerald-200/70">Ekspor siap cetak + audit trail</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] font-mono uppercase text-blue-300 font-bold">Privasi</div>
                    <div className="text-sm font-semibold text-white mt-0.5">Lokal (Klien)</div>
                    <div className="text-[11px] text-emerald-200/70">Tanpa simpan di server luar</div>
                  </div>
                </div>
              </div>

              {/* Hero Visual Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md bg-white/95 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl shadow-emerald-950/50 border border-emerald-200">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl p-1 bg-white border border-emerald-200/90 shadow-xs flex items-center justify-center shrink-0">
                        <Image
                          src="/logo-icon.png"
                          alt="SyariahContract"
                          width={44}
                          height={44}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Pratinjau Draf & Klausul</div>
                        <div className="text-xs text-emerald-700 font-medium">Model R&D Hukum Ekonomi Syariah</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-300">
                      Rujukan Terbuka
                    </span>
                  </div>

                  <div className="space-y-3.5 my-5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/70 font-mono">
                    <p className="font-bold text-center text-slate-800 uppercase tracking-wider text-[11px]">
                      CONTOH AKAD MURABAHAH (ADAPTIF)
                    </p>
                    <p className="text-justify leading-relaxed">
                      &quot;...Pihak Pertama menjual dan Pihak Kedua membeli barang secara transparan dengan harga pokok Rp 40.000.000 dan margin keuntungan tetap Rp 5.000.000...&quot;
                    </p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                      <span>Fatwa DSN 04/2000</span>
                      <span>KHES Buku II Pasal 118</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Pemeriksaan Aturan Spesifik:</span>
                      <span className="font-bold text-emerald-700">Terbuka & Terstruktur</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold text-center">
                      <div className="bg-emerald-100 text-emerald-800 py-1 rounded">PASS</div>
                      <div className="bg-amber-100 text-amber-800 py-1 rounded">NEEDS INFO</div>
                      <div className="bg-orange-100 text-orange-800 py-1 rounded">REVIEW REQ</div>
                      <div className="bg-slate-100 text-slate-700 py-1 rounded">NOT CHECKED</div>
                    </div>
                  </div>

                  <Link
                    href="#pilih-akad"
                    className="mt-6 w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-center block text-xs transition-colors shadow-xs"
                  >
                    Pilih Jenis Akad Anda
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Akad Selection Section (F1) */}
        <section id="pilih-akad" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Fitur Utama F1
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Pilih Jenis Akad Sesuai Skema Usaha Anda
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Setiap akad memiliki karakteristik fikih, pembagian hak-kewajiban, serta aturan kepatuhan syariah yang berbeda. Pilih salah satu untuk memulai formulir bertahap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {AKAD_METADATA.map((akad) => {
              const themeStyles = {
                mudharabah: {
                  border: "border-emerald-200 hover:border-emerald-500",
                  headerBg: "bg-emerald-50/80",
                  badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  btn: "bg-emerald-700 hover:bg-emerald-800 text-white",
                  codeBg: "bg-emerald-800 text-white",
                },
                musyarakah: {
                  border: "border-blue-200 hover:border-blue-500",
                  headerBg: "bg-blue-50/80",
                  badge: "bg-blue-100 text-blue-800 border-blue-200",
                  btn: "bg-blue-700 hover:bg-blue-800 text-white",
                  codeBg: "bg-blue-800 text-white",
                },
                murabahah: {
                  border: "border-amber-200 hover:border-amber-500",
                  headerBg: "bg-amber-50/80",
                  badge: "bg-amber-100 text-amber-800 border-amber-200",
                  btn: "bg-amber-700 hover:bg-amber-800 text-white",
                  codeBg: "bg-amber-800 text-white",
                },
              }[akad.type];

              return (
                <div
                  key={akad.type}
                  className={`flex flex-col justify-between bg-white rounded-3xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${themeStyles.border}`}
                >
                  <div>
                    {/* Card Header */}
                    <div className={`p-6 ${themeStyles.headerBg} border-b border-slate-100`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm tracking-wider ${themeStyles.codeBg}`}>
                          {akad.type.slice(0, 3).toUpperCase()}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${themeStyles.badge} uppercase tracking-wider`}>
                          Akad {akad.nama}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {akad.nama}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {akad.deskripsi}
                      </p>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      {/* Case Example Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="font-semibold text-slate-800 mb-1">
                          Contoh Kasus UMKM:
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {akad.contohKasus}
                        </p>
                      </div>

                      {/* Key features checklist */}
                      <div className="space-y-2 pt-2 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                          Ketentuan Pokok:
                        </div>
                        {akad.type === "mudharabah" && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Modal 100% dari Shahibul Maal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Bagi hasil dalam persentase nisbah</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Kerugian finansial ditanggung pemodal</span>
                            </div>
                          </>
                        )}
                        {akad.type === "musyarakah" && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>Kemitraan modal dari dua pihak atau lebih</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>Keuntungan sesuai nisbah disepakati</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>Kerugian dibagi sesuai proporsi modal</span>
                            </div>
                          </>
                        )}
                        {akad.type === "murabahah" && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              <span>Jual beli dengan transparansi harga pokok</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              <span>Margin keuntungan tetap (fixed)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              <span>Pembayaran tunai atau cicilan tangguh</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/akad/${akad.type}`}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-center block transition-all shadow-xs ${themeStyles.btn}`}
                    >
                      Susun Draf {akad.nama} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Alur Penyusunan Draf Akad
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                4 langkah terarah untuk menghasilkan dokumen akad yang dapat dipertanggungjawabkan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Pilih Jenis Akad</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tentukan jenis akad bisnis: Mudharabah (modal usaha), Musyarakah (kongsi bersama), atau Murabahah (jual beli).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Isi Formulir Wizard</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Masukkan identitas para pihak, nilai nominal, nisbah, objek usaha, domisili, dan saksi secara bertahap.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Evaluasi Kepatuhan</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Mesin aturan kepatuhan otomatis memeriksa apakah isian melanggar prinsip syariah atau syarat sah perjanjian.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm mb-3">
                  4
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Pratinjau & Ekspor</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tinjau klausul lengkap dengan panel dasar hukum per pasal, lalu unduh dalam format DOCX atau cetak PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Sources Section (Verified Legal Source Registry) */}
        <section id="dasar-hukum" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-semibold">
              Verified Legal Source Registry
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Pustaka Rujukan Hukum & Fikih Muamalah
            </h2>
            <p className="text-base text-slate-600">
              Setiap klausul dan aturan kepatuhan terhubung ke sumber hukum positif dan fatwa resmi. Sesuai prinsip kejujuran ilmiah, seluruh rujukan diberi label status verifikasi nyata dan disertai catatan keterbatasan.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left max-w-2xl mx-auto">
              <strong>Catatan Integritas R&D:</strong> Seluruh sumber berlabel <em>UNVERIFIED</em> sampai divalidasi oleh validator ahli atau Dewan Pengawas Syariah (DPS). Sistem tidak mengklaim kepastian hukum yang belum diuji secara formal.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legalSources.map((source) => (
              <div
                key={source.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {source.id}
                      </span>
                      {source.category && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {source.category.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {source.verificationStatus || "UNVERIFIED"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{source.title}</h3>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">{source.officialNumber || source.number}</p>

                  {source.specificArticle && (
                    <p className="text-xs text-slate-700 font-mono bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-2">
                      <span className="font-semibold text-emerald-900">Pasal/Bagian Rujukan:</span> {source.specificArticle}
                    </p>
                  )}

                  {source.note && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {source.note}
                    </p>
                  )}

                  {source.limitationNote && (
                    <p className="text-[11px] text-amber-900 mt-2 bg-amber-50/60 p-2 rounded-lg border border-amber-100 leading-relaxed">
                      <span className="font-semibold">Keterbatasan & Kebutuhan Telaah:</span> {source.limitationNote}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-slate-400">Aturan terkait:</span>
                    {(source.usedForRules || source.usedFor).map((ruleId) => (
                      <span
                        key={ruleId}
                        className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                      >
                        {ruleId}
                      </span>
                    ))}
                  </div>

                  {source.officialUrl && (
                    <a
                      href={source.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      Tautan Dokumen ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Research & Validation Callout (F8) */}
        <section id="tentang" className="py-14 bg-emerald-950 text-white border-t border-emerald-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Instrumen Penelitian Skripsi
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Bantu Validasi Produk Riset Ini
                </h2>
                <p className="text-sm text-emerald-100/80 leading-relaxed max-w-2xl">
                  Aplikasi ini merupakan bagian dari penelitian tugas akhir model 3D (Define, Design, Develop) pada Program Studi Ilmu Hukum, Fakultas Syariah dan Hukum, UIN Walisongo Semarang. Kami mengundang validator ahli dan pengguna UMKM untuk memberikan evaluasi objektif.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href="/penilaian?role=ahli"
                  className="w-full text-center px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-sm shadow-md transition-colors"
                >
                  Instrumen Validator Ahli
                </Link>
                <Link
                  href="/penilaian?role=pengguna"
                  className="w-full text-center px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-600 transition-colors"
                >
                  Kuesioner Pengguna UMKM
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DisclaimerBanner />
        </section>
      </main>

      <Footer />
    </div>
  );
}
