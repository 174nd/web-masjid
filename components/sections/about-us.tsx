"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/layout/container";

type AboutUsProps = {
  title?: string;
  subtitle?: string;

  imagePngSrc?: string;
  imageAlt?: string;

  visionTitle?: string;
  visionText?: string;

  missionTitle?: string;
  missionText?: string;
};

export function AboutUs({
  title = "Tentang Masjid",
  subtitle = "Masjid Asy-Syuhada menjadi pusat ibadah, dakwah, pendidikan, dan pelayanan sosial bagi jamaah. Kami berupaya menghadirkan lingkungan yang nyaman dan bermanfaat bagi masyarakat sekitar.",
  imagePngSrc = "/hero/profile.png",
  imageAlt = "Kegiatan Masjid",

  visionTitle = "Visi",
  visionText = "Menjadi masjid yang makmur, ramah jamaah, dan berperan aktif dalam pembinaan umat di wilayah Batam.",

  missionTitle = "Misi",
  missionText = "Menyelenggarakan ibadah berjamaah, kajian rutin, pendidikan Al-Qur’an, serta program sosial yang transparan dan tepat sasaran.",
}: AboutUsProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <section id="about" aria-label="About us" className="py-5 md:py-10 scroll-mt-24">
      <Container>
        <div className="grid items-start gap-10 md:grid-cols-12">
          {/* LEFT: image + SVG (hidden on mobile) */}
          <motion.div
            className="relative mx-auto hidden w-full md:col-span-5 md:block"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
          >
            {/* make image a bit smaller than previous */}
            <div className="relative mx-auto w-full max-w-xs lg:max-w-sm">
              {/* SVG blob behind */}
              <motion.div
                className="absolute -inset-8 -z-10"
                animate={hovered ? { rotate: 4, scale: 1.04, x: 6, y: -4 } : { rotate: 0, scale: 1, x: 0, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                aria-hidden="true"
              >
                <svg viewBox="0 0 600 600" className="h-full w-full">
                  <defs>
                    <linearGradient id="aboutBlob" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.14" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#aboutBlob)"
                    d="M435,90Q510,180,500,285Q490,390,400,455Q310,520,205,490Q100,460,85,345Q70,230,145,140Q220,50,325,60Q430,70,435,90Z"
                  />
                </svg>
              </motion.div>

              {/* PNG (no card/bg/border) */}
              <motion.div className="relative mx-auto aspect-square w-full" whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <Image src={imagePngSrc} alt={imageAlt} fill className="object-contain select-none" sizes="(max-width: 768px) 0px, 380px" />
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: title + subtitle + cards */}
          <div className="md:col-span-7">
            <p className="text-sm font-medium text-primary">Who we are</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>

            <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">{subtitle}</p>

            {/* Visi & Misi: side-by-side on desktop, stacked on mobile */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm font-semibold">{visionTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{visionText}</p>
              </div>

              <div className="rounded-2xl border bg-background p-5 shadow-sm">
                <p className="text-sm font-semibold">{missionTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{missionText}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
