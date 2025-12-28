import type { Metadata } from "next";
import { DkmPageClient } from "@/features/dkm/pages/dkm-page";

export const metadata: Metadata = {
  title: "DKM",
  description: "Informasi DKM Masjid Asy-Syuhada, rekap cashflow pemasukan dan pengeluaran, serta berita kegiatan.",
};

export default function DkmPage() {
  return (
    <main id="dkm" className="scroll-mt-24">
      <DkmPageClient />
    </main>
  );
}
