import type { Metadata } from "next";
import { DkmPageClient } from "@/features/dkm/pages/dkm-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "DKM";
const description = "Informasi DKM Masjid Asy-Syuhada, rekap cashflow pemasukan dan pengeluaran, serta berita kegiatan.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/dkm",
  },
  openGraph: {
    type: "website",
    url: "/dkm",
    title,
    description,
    images: [{ url: DEFAULT_OG_IMAGE, alt: "Masjid Asy-Syuhada" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function DkmPage() {
  return (
    <main id="dkm" className="scroll-mt-24">
      <DkmPageClient />
    </main>
  );
}
