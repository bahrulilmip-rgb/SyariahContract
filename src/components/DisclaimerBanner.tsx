import { DISCLAIMER_TEXT } from "@/core/types";

interface DisclaimerBannerProps {
  compact?: boolean;
}

export default function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3">
        <span className="font-mono text-[10px] font-bold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded uppercase shrink-0">
          Pemberitahuan
        </span>
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-900">Batasan Tanggung Jawab:</span>{" "}
          {DISCLAIMER_TEXT}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border-l-4 border-amber-600 rounded-r-2xl p-5 text-amber-950 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Disklaimer Penting & Batasan Tanggung Jawab Hukum
          </h4>
          <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed font-normal">
            {DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
}
