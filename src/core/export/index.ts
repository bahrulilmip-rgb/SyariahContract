/**
 * core/export/index.ts
 * Generator Dokumen Ekspor Resmi (Word/DOC, Markdown, dan Laporan Audit Kepatuhan).
 * Berjalan sepenuhnya di sisi klien (Client-Side Privacy Preservation, Zero-Server).
 */

import { GeneratedDraft } from "../types";
import { getLegalSourceById } from "../legalSources";

/**
 * Menghasilkan konten HTML yang kompatibel penuh dengan Microsoft Word (.doc)
 * dengan layout dokumen hukum rapi, nomor pasal, lampiran kepatuhan, dan disklaimer.
 */
export function generateWordHtmlContent(draft: GeneratedDraft): string {
  const partiesHtml = draft.paraPihak
    .map(
      (p, i) => `
      <div style="margin-bottom: 8pt;">
        <strong>${i + 1}. ${escapeHtml(p.nama)}</strong><br/>
        <span>${escapeHtml(p.jenisIdentitas)}: ${escapeHtml(p.identitas)}</span><br/>
        <span>Alamat: ${escapeHtml(p.alamat)}</span><br/>
        <em>Selanjutnya disebut sebagai "Pihak ke-${i + 1}" (${escapeHtml(p.peran.replace("_", " "))}).</em>
      </div>`
    )
    .join("");

  const clausesHtml = draft.klausul
    .map(
      (c) => `
      <div style="margin-top: 14pt; margin-bottom: 12pt;">
        <h4 style="margin: 0 0 4pt 0; font-size: 11pt; text-transform: uppercase;">
          Pasal ${c.nomor}: ${escapeHtml(c.judul)}
        </h4>
        ${
          c.purpose
            ? `<p style="margin: 0 0 4pt 0; font-size: 8.5pt; color: #555; font-style: italic;">
                Tujuan Klausul: ${escapeHtml(c.purpose)}
               </p>`
            : ""
        }
        <p style="margin: 0; line-height: 1.5; white-space: pre-line; text-align: justify;">
          ${escapeHtml(c.teks)}
        </p>
        ${
          c.legalSourceIds && c.legalSourceIds.length > 0
            ? `<p style="margin: 4pt 0 0 0; font-size: 8pt; color: #2e7d32;">
                Rujukan Dasar: ${c.legalSourceIds.map((id) => escapeHtml(id)).join(", ")}
               </p>`
            : ""
        }
      </div>`
    )
    .join("");

  const findingsRows = (draft.kepatuhan?.results || [])
    .map((r) => {
      const statusBadge =
        r.status === "PASS"
          ? `<span style="color: #2e7d32; font-weight: bold;">PASS</span>`
          : r.status === "FAIL"
          ? `<span style="color: #c62828; font-weight: bold;">FAIL</span>`
          : r.status === "REVIEW_REQUIRED"
          ? `<span style="color: #ef6c00; font-weight: bold;">REVIEW REQUIRED</span>`
          : r.status === "NEEDS_INFORMATION"
          ? `<span style="color: #f57f17; font-weight: bold;">NEEDS INFO</span>`
          : `<span style="color: #616161; font-weight: bold;">NOT CHECKED</span>`;

      return `
        <tr>
          <td style="border: 1px solid #ccc; padding: 6pt; font-family: monospace; font-size: 9pt;">${escapeHtml(r.ruleId)}</td>
          <td style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt;">${statusBadge}</td>
          <td style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt;">${escapeHtml(r.requirementTested || "-")}</td>
          <td style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt;">${escapeHtml(r.message)}</td>
          <td style="border: 1px solid #ccc; padding: 6pt; font-size: 8.5pt; color: #555;">${escapeHtml(r.legalSourceIds.join(", "))}</td>
        </tr>`;
    })
    .join("");

  const staleNotice = draft.isStale
    ? `<div style="background-color: #fff3e0; border: 1px solid #ffe082; padding: 8pt; margin-bottom: 12pt; font-size: 9pt; color: #e65100;">
        <strong>Perhatian Integritas Dokumen:</strong> Draf ini telah mengalami perubahan manual pada salah satu atau beberapa klausul setelah pemeriksaan kepatuhan terakhir dijalankan. Silakan jalankan evaluasi ulang pada aplikasi untuk memastikan konsistensi hukum.
       </div>`
    : "";

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(draft.judul)}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #111;
    }
    h1, h2, h3, h4 {
      font-family: Arial, Helvetica, sans-serif;
    }
  </style>
</head>
<body>
  ${staleNotice}

  <div style="text-align: center; border-bottom: 2pt solid #111; padding-bottom: 8pt; margin-bottom: 16pt;">
    <h2 style="margin: 0; font-size: 14pt; letter-spacing: 1px;">${escapeHtml(draft.judul)}</h2>
    <p style="margin: 4pt 0 0 0; font-family: monospace; font-size: 10pt;">
      Nomor: ${escapeHtml(draft.nomorDokumen || "-")}
    </p>
    <p style="margin: 2pt 0 0 0; font-size: 8.5pt; color: #666;">
      Draf Versi: v${draft.draftVersion || 1}.0 | Rules Engine: ${escapeHtml(draft.rulesVersion || "v1.2.0")} | Tanggal: ${escapeHtml(draft.tanggalDibuat)}
    </p>
  </div>

  <div style="margin-bottom: 14pt; text-align: justify;">
    <p>Pada hari ini, telah dibuat dan disepakati perjanjian kerja sama berdasarkan prinsip syariah oleh dan antara:</p>
    ${partiesHtml}
    <p>Para pihak tersebut di atas secara bersama-sama selanjutnya disebut sebagai <strong>"Para Pihak"</strong>.</p>
  </div>

  <div style="margin-bottom: 14pt;">
    <h4 style="margin: 0 0 4pt 0; font-size: 11pt; text-transform: uppercase;">Pertimbangan</h4>
    <p style="margin: 0; line-height: 1.5; white-space: pre-line; text-align: justify;">
      ${escapeHtml(draft.pertimbangan)}
    </p>
  </div>

  <div>
    ${clausesHtml}
  </div>

  <div style="margin-top: 20pt; border-top: 1pt solid #111; padding-top: 10pt;">
    <p style="margin: 0; line-height: 1.5; white-space: pre-line;">
      ${escapeHtml(draft.penutup)}
    </p>
  </div>

  <div style="margin-top: 20pt; page-break-inside: avoid;">
    <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 16pt;">
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 10pt;">
          <strong>Pihak Pertama</strong><br/><br/><br/><br/>
          ( _________________________ )<br/>
          ${escapeHtml(draft.paraPihak[0]?.nama || "Pihak Pertama")}
        </td>
        <td style="width: 50%; vertical-align: top; padding: 10pt;">
          <strong>Pihak Kedua</strong><br/><br/><br/><br/>
          ( _________________________ )<br/>
          ${escapeHtml(draft.paraPihak[1]?.nama || "Pihak Kedua")}
        </td>
      </tr>
      <tr>
        <td style="width: 50%; vertical-align: top; padding: 10pt;">
          <strong>Saksi I</strong><br/><br/><br/><br/>
          ( _________________________ )<br/>
          ${escapeHtml(draft.saksi[0]?.nama || "Saksi 1")}
        </td>
        <td style="width: 50%; vertical-align: top; padding: 10pt;">
          <strong>Saksi II</strong><br/><br/><br/><br/>
          ( _________________________ )<br/>
          ${escapeHtml(draft.saksi[1]?.nama || "Saksi 2")}
        </td>
      </tr>
    </table>
  </div>

  <!-- LAMPIRAN AUDIT TRAIL KEPATUHAN -->
  <div style="page-break-before: always; margin-top: 30pt;">
    <h3 style="margin: 0 0 6pt 0; font-size: 12pt; border-bottom: 1pt solid #444; padding-bottom: 4pt;">
      LAMPIRAN I: Laporan Pemeriksaan Kepatuhan Syariah & Hukum (Audit Trail)
    </h3>
    <p style="font-size: 9pt; color: #555; margin-bottom: 10pt;">
      Dokumen pendamping ini dihasilkan otomatis oleh Mesin Aturan Kepatuhan SyariahContract (${escapeHtml(draft.rulesVersion || "v1.2.0")}) untuk mempermudah telaah oleh Dewan Pengawas Syariah (DPS), Notaris, atau Advokat.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16pt;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left;">Kode</th>
          <th style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left;">Status</th>
          <th style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left;">Aspek Diuji</th>
          <th style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left;">Uraian Hasil Pemeriksaan</th>
          <th style="border: 1px solid #ccc; padding: 6pt; font-size: 9pt; text-align: left;">Rujukan</th>
        </tr>
      </thead>
      <tbody>
        ${findingsRows}
      </tbody>
    </table>

    <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 10pt; font-size: 8.5pt; color: #444; margin-top: 14pt;">
      <strong>Disklaimer Hukum & Syariah:</strong><br/>
      ${escapeHtml(draft.disklaimer)}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Menghasilkan teks Markdown murni dari draf akad
 */
export function generateMarkdownContract(draft: GeneratedDraft): string {
  const parts: string[] = [];

  parts.push(`# ${draft.judul}`);
  parts.push(`**Nomor Dokumen:** \`${draft.nomorDokumen || "-"}\``);
  parts.push(
    `*Versi Draf:* v${draft.draftVersion || 1}.0 | *Versi Aturan:* ${draft.rulesVersion || "v1.2.0"} | *Tanggal:* ${draft.tanggalDibuat}\n`
  );

  if (draft.isStale) {
    parts.push(
      `> [!WARNING]\n> **Draf Diubah Manual**: Dokumen ini telah mengalami revisi klausul setelah evaluasi kepatuhan terakhir. Jalankan evaluasi ulang untuk memastikan keabsahan.\n`
    );
  }

  parts.push(`## Para Pihak`);
  draft.paraPihak.forEach((p, idx) => {
    parts.push(
      `${idx + 1}. **${p.nama}** (${p.peran.replace("_", " ")})\n   - ${p.jenisIdentitas}: ${p.identitas}\n   - Alamat: ${p.alamat}`
    );
  });

  parts.push(`\n## Pertimbangan\n${draft.pertimbangan}\n`);

  parts.push(`## Klausul Perjanjian\n`);
  draft.klausul.forEach((c) => {
    parts.push(`### Pasal ${c.nomor}: ${c.judul}`);
    if (c.purpose) {
      parts.push(`*Tujuan Klausul:* ${c.purpose}`);
    }
    parts.push(`\n${c.teks}\n`);
    if (c.legalSourceIds && c.legalSourceIds.length > 0) {
      parts.push(`*Rujukan Dasar Hukum:* ${c.legalSourceIds.join(", ")}\n`);
    }
  });

  parts.push(`## Penutup\n${draft.penutup}\n`);

  parts.push(`---\n### Disklaimer\n${draft.disklaimer}\n`);

  return parts.join("\n");
}

/**
 * Memicu pengunduhan file di browser (Client-Side)
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Ekspor dokumen Word (.doc)
 */
export function exportToWordDoc(draft: GeneratedDraft): void {
  const html = generateWordHtmlContent(draft);
  const safeTitle = (draft.nomorDokumen || "draf-akad").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadFile(html, `${safeTitle}.doc`, "application/msword;charset=utf-8");
}

/**
 * Ekspor dokumen Markdown (.md)
 */
export function exportToMarkdown(draft: GeneratedDraft): void {
  const md = generateMarkdownContract(draft);
  const safeTitle = (draft.nomorDokumen || "draf-akad").replace(/[^a-zA-Z0-9_-]/g, "_");
  downloadFile(md, `${safeTitle}.md`, "text/markdown;charset=utf-8");
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
