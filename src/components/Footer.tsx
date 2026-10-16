import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl p-1.5 bg-white shadow-md border border-emerald-400/50 flex items-center justify-center shrink-0">
                <Image
                  src="/logo-icon.png"
                  alt="Logo SyariahContract.id"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                SyariahContract<span className="text-amber-400">.id</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Aplikasi pendukung penyusunan draf akad syariah interaktif bagi pelaku UMKM. 
              Dokumen disusun berbasis aturan kepatuhan fatwa DSN-MUI, Kompilasi Hukum Ekonomi Syariah (KHES), dan hukum nasional.
            </p>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="font-semibold text-emerald-400">Konteks Akademik:</span> Produk Riset & Pengembangan (R&D) Model 3D (Define, Design, Develop) — Prodi Ilmu Hukum, Fakultas Syariah dan Hukum, UIN Walisongo Semarang.
            </div>
          </div>

          {/* Col 2: Akad Syariah */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Akad yang Tersedia
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/akad/mudharabah"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Akad Mudharabah</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/akad/musyarakah"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Akad Musyarakah</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/akad/murabahah"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Akad Murabahah</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi & Riset */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Penelitian & Validasi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/penilaian?role=ahli"
                  className="hover:text-amber-400 transition-colors"
                >
                  Instrumen Validator Ahli
                </Link>
              </li>
              <li>
                <Link
                  href="/penilaian?role=pengguna"
                  className="hover:text-amber-400 transition-colors"
                >
                  Kuesioner Uji Coba Pengguna
                </Link>
              </li>
              <li>
                <Link
                  href="/#dasar-hukum"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pustaka Dasar Hukum
                </Link>
              </li>
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privasi & UU PDP (Stateless)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SyariahContract.id — Dikembangkan untuk Keperluan Skripsi R&D.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Tidak Menyimpan Data Pribadi di Server (Client-side / Stateless)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
