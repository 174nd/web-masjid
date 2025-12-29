import type { Metadata } from "next";

import HomePageClient from "@/features/home/pages/home-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "Masjid Asy-Syuhada Batam";
const description = "Informasi kegiatan, jadwal sholat, infak & pengeluaran, serta kontak Masjid Asy-Syuhada Batam.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
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

export default function HomePage() {
  return <HomePageClient />;
}
