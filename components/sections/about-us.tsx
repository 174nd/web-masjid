"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/layout/container";

type AboutUsProps = {
  title?: string;
  subtitle?: string;
  imagePngSrc?: string;
};

export function AboutUs({
  title = "About Us",
  subtitle = "Kami membangun produk digital yang cepat, rapi, dan mudah di-maintain. Fokus kami: UX yang bersih, performa, dan kualitas implementasi.",
  imagePngSrc = "/images/logo.png",
}: AboutUsProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <section id="about" aria-label="About us" className="">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* LEFT: image + SVG */}
          <motion.div className="relative mx-auto w-full max-w-sm" onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}>
            {/* SVG behind (only background element here) */}
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
            <motion.div className="relative mx-auto aspect-4/5 w-full" whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              <Image src={imagePngSrc} alt="About us" fill className="object-contain select-none" sizes="(max-width: 768px) 85vw, 420px" />
            </motion.div>
          </motion.div>

          {/* RIGHT: text */}
          <div>
            <p className="text-sm font-medium text-primary">Who we are</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>

            <p className="mt-4 text-muted-foreground md:text-lg">{subtitle}</p>

            <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <p>Engineering terstruktur (Next.js, TypeScript, CI/CD).</p>
              </div>
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <p>Design system konsisten (shadcn/ui + Tailwind v4).</p>
              </div>
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <p>Form & data layer yang kuat (TanStack Form & Query).</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Work with us
              </a>

              <a href="#features" className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-accent">
                See features
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
