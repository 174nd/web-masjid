"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { YayasanNewsSection } from "@/components/pages/yayasan-news-section";
import { mockTpqNews } from "@/data/mock-tpq-news";

type TpqPageClientProps = {
  heroImageSrc?: string;
  izinImageSrc?: string;
  izinImageAlt?: string;
  izinNumber?: string;
  izinDate?: string;
};

export function TpqPageClient({
  heroImageSrc = "/hero/bg-3.jpg",
  izinImageSrc = "/images/izin-tpq-placeholder.jpg",
  izinImageAlt = "Foto Izin/Legalitas TPQ (placeholder)",
  izinNumber = "[Nomor Izin/Surat]",
  izinDate = "[Tanggal Izin]",
}: TpqPageClientProps) {
  return (
    <div>
      {/* HERO + ATTACHED CARD */}
      <section aria-label="TPQ hero" className="pt-10 md:pt-14">
        <Container>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border">
              <div className="relative h-[260px] w-full md:h-[340px]">
                <Image src={heroImageSrc} alt="TPQ" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 1024px" />
                <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/45 to-white" />
                <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_40%)]" />

                <div className="absolute inset-0 grid place-items-center">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl">TPQ</h1>
                </div>
              </div>
            </div>

            <div className="-mt-10 md:-mt-14">
              <RevealGroup>
                <RevealItem>
                  <div className="mx-auto w-full max-w-4xl rounded-2xl border bg-background/95 p-6 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary md:p-8">
                    <p className="text-sm font-medium text-primary">Profil TPQ</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Taman Pendidikan Al-Qur&apos;an Masjid Asy-Syuhada</h2>

                    <div className="mt-4 space-y-4 text-muted-foreground md:text-lg">
                      <p>
                        TPQ Masjid Asy-Syuhada menjadi wadah pembelajaran Al-Qur’an bagi anak-anak dan remaja melalui program membaca
                        (Iqra/Al-Qur’an), tahsin, serta pembiasaan adab dan akhlak.
                      </p>

                      <p>
                        Kegiatan TPQ berfokus pada peningkatan kemampuan baca Al-Qur’an, pemahaman dasar ibadah, serta pembinaan karakter. Informasi
                        pendaftaran, jadwal, dan kegiatan TPQ diumumkan secara berkala melalui pengurus.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Program Belajar</p>
                        <p className="mt-2 text-sm text-muted-foreground">Iqra/Al-Qur&apos;an, tahsin, dasar-dasar ibadah, dan pembiasaan adab.</p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Pembinaan</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Kelas bertahap sesuai kemampuan, evaluasi berkala, dan pendampingan santri.
                        </p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Kegiatan</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Kegiatan rutin, agenda bulanan, serta acara bersama orang tua/wali santri.
                        </p>
                      </div>
                    </div>
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>
          </div>
        </Container>
      </section>

      {/* LEGALITY / IZIN TPQ */}
      <section aria-label="Legalitas TPQ" className="py-10 md:py-14">
        <Container>
          <RevealGroup className="grid gap-6 md:grid-cols-12">
            <RevealItem className="md:col-span-5">
              <div className="rounded-2xl border bg-background p-6 transition-colors duration-200 hover:border-primary">
                <p className="text-sm font-medium text-primary">Legalitas</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Izin / Dokumen TPQ</h3>
                <p className="mt-4 text-muted-foreground">
                  Berikut adalah dokumentasi izin/legalitas TPQ. Silakan klik gambar untuk melihat versi yang lebih jelas.
                </p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>
                    Nomor: <span className="font-medium text-foreground">{izinNumber}</span>
                  </p>
                  <p>
                    Tanggal: <span className="font-medium text-foreground">{izinDate}</span>
                  </p>
                </div>
              </div>
            </RevealItem>

            <RevealItem className="md:col-span-7">
              <div className="overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={izinImageSrc} alt={izinImageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
                  <div className="absolute inset-x-0 bottom-0 bg-background/80 p-3 backdrop-blur">
                    <p className="text-xs text-muted-foreground">Placeholder izin TPQ — ganti file ini dengan foto dokumen asli.</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </Container>
      </section>

      {/* NEWS (pagination + skeleton) */}
      <YayasanNewsSection items={mockTpqNews} pageSize={6} title="Berita TPQ" subtitle="Update" />
    </div>
  );
}
