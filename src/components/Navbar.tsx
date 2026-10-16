import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 rounded-2xl p-1 bg-white border border-emerald-200/90 shadow-xs group-hover:scale-105 group-hover:border-emerald-400 transition-all flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="Logo SyariahContract.id"
                width={44}
                height={44}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-emerald-950">
                  SyariahContract<span className="text-amber-600">.id</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Penyusun Draf Akad Syariah UMKM
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#pilih-akad"
              className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Pilih Akad
            </Link>
            <Link
              href="/#dasar-hukum"
              className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Dasar Hukum
            </Link>
            <Link
              href="/#tentang"
              className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Tentang Riset
            </Link>
            <Link
              href="/penilaian"
              className="inline-flex items-center text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Kuesioner Validasi
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/#pilih-akad"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all"
            >
              Mulai Susun Akad
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
