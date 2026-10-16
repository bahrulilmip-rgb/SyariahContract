import { Suspense } from "react";
import AkadWizardClient from "./AkadWizardClient";
import { AkadType } from "@/core/types";

export function generateStaticParams() {
  return [
    { jenis: "mudharabah" },
    { jenis: "musyarakah" },
    { jenis: "murabahah" },
  ];
}

interface PageProps {
  params: Promise<{ jenis: string }>;
}

export default async function AkadWizardPage({ params }: PageProps) {
  const resolved = await params;
  const jenis = (resolved.jenis || "mudharabah") as AkadType;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Memuat formulir akad...</div>}>
      <AkadWizardClient jenis={jenis} />
    </Suspense>
  );
}
