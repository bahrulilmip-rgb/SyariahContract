/**
 * core/legalSources.ts
 * Akses data rujukan hukum terpusat untuk SyariahContract.
 */

import rawLegalSources from "../../content/legal-sources.json";
import { LegalSource, LegalSourceCategory } from "./types";

export const legalSources: LegalSource[] = rawLegalSources as LegalSource[];

export function getLegalSourceById(id: string): LegalSource | undefined {
  return legalSources.find((s) => s.id === id);
}

export function getLegalSourcesByIds(ids: string[]): LegalSource[] {
  return ids
    .map((id) => getLegalSourceById(id))
    .filter((s): s is LegalSource => s !== undefined);
}

export function getLegalSourcesByCategory(category: LegalSourceCategory): LegalSource[] {
  return legalSources.filter((s) => s.category === category);
}

export function getVerificationBadge(status?: string): {
  label: string;
  badgeClass: string;
  description: string;
} {
  switch (status) {
    case "VERIFIED":
      return {
        label: "Diverifikasi",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        description: "Norma pasal dan ketentuannya telah ditelaah terhadap dokumen resmi.",
      };
    case "NEEDS_EXPERT_REVIEW":
      return {
        label: "Perlu Telaah Ahli",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
        description: "Penerapan pada klausul ini membutuhkan telaah fatwa/ahli syariah secara khusus.",
      };
    case "UNVERIFIED":
    default:
      return {
        label: "Belum Diverifikasi Ahli",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
        description: "Rujukan dicantumkan secara informatif dan belum diverifikasi secara independen oleh DPS/ahli.",
      };
  }
}

