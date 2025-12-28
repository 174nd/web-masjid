"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/layout/container";

type HeroProps = {
  backgroundImages?: string[];
  cycleMs?: number;
};

const DEFAULT_BACKGROUNDS = ["/hero/bg-1.jpg", "/hero/bg-2.jpg", "/hero/bg-3.jpg"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function map01(value: number, inMin: number, inMax: number) {
  if (inMax === inMin) return 0;
  return clamp((value - inMin) / (inMax - inMin), 0, 1);
}

export function Hero({ backgroundImages = DEFAULT_BACKGROUNDS, cycleMs = 6000 }: HeroProps) {
  const [index, setIndex] = React.useState(0);
  const [isPhotoHover, setIsPhotoHover] = React.useState(false);

  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const bgParallaxRef = React.useRef<HTMLDivElement | null>(null);
  const photoParallaxRef = React.useRef<HTMLDivElement | null>(null);

  // Cycle background (smooth crossfade)
  React.useEffect(() => {
    if (backgroundImages.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % backgroundImages.length);
    }, cycleMs);
    return () => window.clearInterval(id);
  }, [backgroundImages.length, cycleMs]);

  // Preload next bg (reduce flash)
  React.useEffect(() => {
    if (!backgroundImages.length) return;
    const next = backgroundImages[(index + 1) % backgroundImages.length];
    const img = new window.Image();
    img.src = next;
  }, [index, backgroundImages]);

  const activeBg = backgroundImages[index] ?? backgroundImages[0];

  // Smooth parallax (background + photo) via rAF + lerp (no React re-render per scroll)
  React.useEffect(() => {
    let raf = 0;

    // current & target offsets
    let bgCur = 0,
      bgTarget = 0;
    let photoCur = 0,
      photoTarget = 0;

    const computeTargets = () => {
      const el = shellRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      /**
       * progress 0..1 saat hero “melewati” viewport:
       * - ketika hero masih di bawah (rect.top ~ vh) => mendekati 0
       * - ketika hero sudah lewat atas (rect.bottom ~ 0) => mendekati 1
       */
      const progress = map01(vh - rect.top, 0, vh + rect.height);

      // BIKIN TERASA: pakai range lebih besar + arah berlawanan
      // Background: -80px .. +80px (lebih dramatis)
      bgTarget = lerp(-80, 80, progress);

      // Foto: -35px .. +35px (lebih subtle daripada bg)
      // Bisa searah atau berlawanan; biasanya lebih terasa jika beda arah dengan bg
      photoTarget = lerp(25, -25, progress);
    };

    const tick = () => {
      // lebih responsif (0.18–0.25)
      const ease = 0.22;

      bgCur += (bgTarget - bgCur) * ease;
      photoCur += (photoTarget - photoCur) * ease;

      if (bgParallaxRef.current) {
        // scale cukup besar agar tidak kelihatan “pinggir” saat bergerak
        bgParallaxRef.current.style.transform = `translate3d(0, ${bgCur}px, 0) scale(1.12)`;
      }
      if (photoParallaxRef.current) {
        photoParallaxRef.current.style.transform = `translate3d(0, ${photoCur}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => computeTargets();
    const onResize = () => computeTargets();

    computeTargets();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section aria-label="Hero" className="py-10 md:py-14">
      <Container>
        <div ref={shellRef} className="relative overflow-hidden rounded-2xl border bg-background/30">
          {/* Background (max container) */}
          <div className="absolute inset-0 -z-10">
            <div ref={bgParallaxRef} className="absolute inset-0 will-change-transform">
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={activeBg}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  <Image src={activeBg} alt="" fill priority={index === 0} sizes="(max-width: 768px) 100vw, 896px" className="object-cover blur-xs" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Overlay primary */}
            <div className="absolute inset-0 bg-white/35" />
            <div className="absolute inset-0 bg-background/10" />
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              {/* Left copy */}
              <div>
                <motion.h1
                  className="text-4xl tracking-tight md:text-5xl font-dosis font-light"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  Selamat Datang
                  <br />
                  <span className="font-oswald">
                    Di Masjid <br />
                    <strong className="text-primary">Asy-Syuhada</strong>
                  </span>
                </motion.h1>

                <motion.p
                  className="mt-4 text-base text-black md:text-lg font-mr-dafoe"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                >
                  Assalamualaikum warahamatullahi wabarakatuh
                </motion.p>
                <motion.p
                  className="mt-4 text-base text-black md:text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                >
                  Segala puji hanya milik Allah yang Maha Pengasih lagi Maha Penyayang. Sholawat serta salam kepada Nabi Muhammad SAW dan para
                  keluarganya, sahabat, tabiin, tabiut taabiin. Semoga kita menjadi umatnya yang senantiasa istiqomah di jalan yang lurus hingga
                  yaumil qiyamah. Amin
                </motion.p>
                <motion.p
                  className="mt-4 text-base text-black md:text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                >
                  Selamat datang di website resmi Masjid Cut Meutia. Tagline kami{" "}
                  <em>
                    <strong>“Dari Masjid Membangun Indonesia”</strong>
                  </em>
                  . Semoga hadirnya website ini menjadi wasilah silaturahim kita semua untuk bisa lebih mengenal Masjid Cut Meutia. Semoga website ini
                  bermanfaat, terima kasih.
                </motion.p>
              </div>

              {/* Right: PNG photo (no background, only SVG behind) */}
              <div ref={photoParallaxRef} className="will-change-transform">
                <motion.div
                  className="relative mx-auto w-full max-w-sm md:ml-auto md:mr-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                  onHoverStart={() => setIsPhotoHover(true)}
                  onHoverEnd={() => setIsPhotoHover(false)}
                >
                  {/* SVG behind photo (only background element) */}
                  <motion.div
                    className="absolute -inset-8 -z-10"
                    animate={isPhotoHover ? { rotate: 3, scale: 1.03, x: 6, y: -4 } : { rotate: 0, scale: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 600 600" className="h-full w-full">
                      <defs>
                        <linearGradient id="heroBlob" x1="0" x2="1" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#heroBlob)"
                        d="M421.5,77.5Q482,155,503,250.5Q524,346,457.5,414Q391,482,295.5,510Q200,538,124,472.5Q48,407,66,307Q84,207,140,126Q196,45,293,49Q390,53,421.5,77.5Z"
                      />
                    </svg>
                  </motion.div>

                  {/* PNG image only (no card, no border, no bg) */}
                  <motion.div className="relative mx-auto aspect-4/5 w-full" whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                    <Image
                      src="/hero/profile.png"
                      alt="Hero photo"
                      fill
                      className="object-contain select-none"
                      sizes="(max-width: 768px) 80vw, 420px"
                      priority
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
