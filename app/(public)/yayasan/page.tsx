import type { Metadata } from "next";
import { YayasanPageClient } from "@/features/yayasan/pages/yayasan-page";

export const metadata: Metadata = {
  title: "Yayasan",
  description: "Informasi mengenai Yayasan Masjid Asy-Syuhada: visi pengelolaan, program sosial, dan transparansi kegiatan.",
};

export default function YayasanPage() {
  return (
    <main id="yayasan" className="scroll-mt-24">
      <YayasanPageClient />
    </main>
  );
}
