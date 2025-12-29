import type { Metadata } from "next";
import { TpqPageClient } from "@/features/tpq/pages/tpq-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "TPQ";
const description = "Informasi TPQ Masjid Asy-Syuhada: profil, legalitas, dan berita kegiatan TPQ.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/tpq",
  },
  openGraph: {
    type: "website",
    url: "/tpq",
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

export default function TpqPage() {
  return (
    <main id="tpq" className="scroll-mt-24">
      <TpqPageClient />
    </main>
  );
}
