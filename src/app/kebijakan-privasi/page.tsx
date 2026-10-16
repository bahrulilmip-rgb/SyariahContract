import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Kepatuhan UU No. 27 Tahun 2022 (UU PDP)
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Kebijakan Privasi & Pemrosesan Data
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Terakhir diperbarui: 16 Oktober 2026 • SyariahContract.id (MVP)
            </p>
          </div>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              1. Prinsip Stateless (Tidak Menyimpan Data Para Pihak di Server)
            </h2>
            <p>
              SyariahContract.id dirancang dengan mematuhi prinsip <em>Privacy by Design</em>. Seluruh data identitas para pihak, nilai nominal modal/transaksi, rincian barang, dan data saksi yang diinputkan ke dalam formulir diproses secara <strong>langsung di sisi peramban pengguna (client-side)</strong>.
            </p>
            <p>
              Server aplikasi tidak menyimpan, tidak mengarsipkan, dan tidak mengirimkan data identitas pribadi para pihak ke basis data mana pun. Ketika Anda menutup peramban atau mengunduh draf, data formulir tidak tertinggal di server.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              2. Data Penilaian dan Instrumen Penelitian
            </h2>
            <p>
              Pada modul kuesioner penilaian (/penilaian), sistem hanya menyimpan:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Peran penilai (Validator Ahli atau Pengguna UMKM);</li>
              <li>Jenis akad yang dinilai (Mudharabah, Musyarakah, atau Murabahah);</li>
              <li>Skor skala Likert (1 hingga 5) untuk setiap butir penilaian;</li>
              <li>Kolom saran/catatan kualitatif yang diisikan;</li>
              <li>Waktu pengisian (timestamp).</li>
            </ul>
            <p>
              Sistem <strong>tidak mengumpulkan</strong> nama lengkap, NIK, alamat email, maupun nomor telepon dalam instrumen penelitian, kecuali apabila responden secara sukarela menuliskannya pada kotak saran.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">
              3. Hak Pengguna
            </h2>
            <p>
              Pengguna memiliki kendali penuh atas dokumen yang dihasilkan. Dokumen draf akad yang diunduh (DOCX/PDF) sepenuhnya berada di penyimpanan lokal perangkat pengguna.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              ← Kembali ke Beranda
            </Link>
            <Link
              href="/#pilih-akad"
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              Mulai Susun Akad
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
