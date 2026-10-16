/**
 * core/legalSources.ts
 * Akses data rujukan hukum terpusat untuk SyariahContract.
 */

import rawLegalSources from "../../content/legal-sources.json";
import { LegalSource } from "./types";

export const legalSources: LegalSource[] = rawLegalSources as LegalSource[];

export function getLegalSourceById(id: string): LegalSource | undefined {
  return legalSources.find((s) => s.id === id);
}
