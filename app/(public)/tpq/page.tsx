import type { Metadata } from "next";
import { TpqPageClient } from "@/features/tpq/pages/tpq-page";

export const metadata: Metadata = {
  title: "TPQ",
  description: "Informasi TPQ Masjid Asy-Syuhada: profil, legalitas, dan berita kegiatan TPQ.",
};

export default function TpqPage() {
  return (
    <main id="tpq" className="scroll-mt-24">
      <TpqPageClient />
    </main>
  );
}
