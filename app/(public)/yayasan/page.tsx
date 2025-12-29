import type { Metadata } from "next";
import { YayasanPageClient } from "@/features/yayasan/pages/yayasan-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "Yayasan";
const description = "Informasi mengenai Yayasan Masjid Asy-Syuhada: visi pengelolaan, program sosial, dan transparansi kegiatan.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/yayasan",
  },
  openGraph: {
    type: "website",
    url: "/yayasan",
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

export default function YayasanPage() {
  return (
    <main id="yayasan" className="scroll-mt-24">
      <YayasanPageClient />
    </main>
  );
}
