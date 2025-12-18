import { AboutUs } from "@/components/sections/about-us";
import { Hero } from "@/components/sections/hero";
import { InfakCard } from "@/components/sections/infak-card";
import { NewsRotating } from "@/components/sections/news-rotating";
import { PrayerTimesBatam } from "@/components/sections/prayer-times-batam";
import { ContactCard } from "@/components/sections/contact-card";

export default function HomePage() {
  return (
    <>
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
