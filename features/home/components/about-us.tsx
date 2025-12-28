"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

type ProgramMasjidProps = {
  title?: string;
  subtitle?: string;

  imagePngSrc?: string;
  imageAlt?: string;

  points?: string[];
};

export function AboutUs({
  title = "Program Masjid Asy-Syuhadaa",
  subtitle = "Program-program berikut dapat diikuti jamaah maupun didukung melalui infak dan partisipasi. Detail pelaksanaan diumumkan melalui pengurus masjid.",
  imagePngSrc = "/hero/profile.png",
  imageAlt = "Program Masjid",
  points = [
    "Program Qurban (pendaftaran peserta dan distribusi daging).",
    "Renovasi masjid (perbaikan fasilitas dan peningkatan kenyamanan).",
    "Pengadaan karpet/sajadah dan perlengkapan ibadah.",
    "Pengadaan sound system, kipas/AC, dan kebutuhan operasional.",
    "Kegiatan kajian rutin dan pembinaan jamaah.",
    "Santunan & program sosial untuk warga sekitar.",
    "Perawatan kebersihan dan pemeliharaan fasilitas masjid.",
  ],
}: ProgramMasjidProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <section id="about" aria-label="Program masjid" className="py-5 md:py-10 scroll-mt-24">
      <Container>
        <RevealGroup className="grid items-start gap-10 md:grid-cols-12">
          {/* LEFT: image + SVG effect (hidden on mobile) */}
          <RevealItem className="hidden md:col-span-5 md:block">
            <motion.div className="relative mx-auto w-full" onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}>
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

                {/* PNG (no card) */}
                <motion.div className="relative mx-auto aspect-square w-full" whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                  <Image src={imagePngSrc} alt={imageAlt} fill className="object-contain select-none" sizes="(max-width: 768px) 0px, 380px" />
                </motion.div>
              </div>
            </motion.div>
          </RevealItem>

          {/* RIGHT: Title + Subtitle + points */}
          <div className="md:col-span-7">
            <RevealItem>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-primary">
                <span className="text-black">Program Masjid</span> Asy-Syuhadaa
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">{subtitle}</p>
            </RevealItem>

            {/* Points (reveal one-by-one, stagger terasa) */}
            <RevealGroup className="mt-6 grid gap-3 md:grid-cols-2" once amount={0.25}>
              {points.map((text, idx) => (
                <RevealItem
                  key={idx}
                  // optional: sedikit delay per-item supaya benar-benar “satu-satu”
                  transition={{ delay: idx * 0.05 }}
                >
                  <div
                    className="
          flex items-start gap-3 rounded-xl border bg-background px-4 py-3
          transition-colors duration-200
          hover:border-primary
        "
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </RevealGroup>
      </Container>
    </section>
  );
}
