import { AboutUs } from "../components/about-us";
import { Hero } from "../components/hero";
import { InfakCard } from "../components/infak-card";
import { NewsRotating } from "../components/news";
import { PrayerTimesBatam } from "../components/prayer-times";
import { ContactCard } from "@/features/home/components/contact-card";
import { SITE_URL } from "@/lib/seo";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Place",
  name: "Masjid Asy-Syuhada",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Buliang, Kec. Batu Aji",
    addressLocality: "Kota Batam",
    addressRegion: "Kepulauan Riau",
    postalCode: "29424",
    addressCountry: "ID",
  },
  telephone: "+62 812-3456-7890",
  url: SITE_URL,
  sameAs: ["https://instagram.com/USERNAME_MASJID", "https://facebook.com/PAGE_MASJID", "https://youtube.com/@CHANNEL_MASJID"],
};

export default function HomePageClient() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero cycleMs={6500} />
      <AboutUs />
      <NewsRotating intervalMs={6500} maxList={4} />
      <InfakCard />
      <PrayerTimesBatam liveVideoId="7-Qf3g-0xEI" />

      <ContactCard
        mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127652.89152841926!2d103.82851849726562!3d1.0464731999999919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98dbe3265b639%3A0xd01b0d815c36ae0a!2sMasjid%20Asy-Syuhada!5e0!3m2!1sid!2sid!4v1765951360338!5m2!1sid!2sid"
        backgroundImageSrc="/images/contact-bg.jpg"
      />
    </>
  );
}
