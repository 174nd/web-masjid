"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { YayasanNewsSection } from "../component/yayasan-news-section";

export function YayasanPageClient() {
  return (
    <div>
      {/* HERO + ATTACHED CARD */}
      <section aria-label="Yayasan hero" className="py-10 md:py-14">
        <Container>
          <div className="relative">
            {/* Hero image */}
            <div className="relative overflow-hidden rounded-3xl border">
              <div className="relative h-48 w-full md:h-64">
                <Image src="/hero/bg-3.jpg" alt="Yayasan" fill priority className="object-cover blur-xs" sizes="(max-width: 768px) 100vw, 1024px" />

                {/* Gradient overlay: cerah -> putih */}
                <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/45 to-white" />

                {/* subtle highlight */}
                <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_40%)]" />

                {/* centered title */}
                <div className="absolute inset-0 grid place-items-center -mt-10">
                  {/* <p className="text-sm font-medium text-primary">Profil Yayasan</p> */}
                  {/* <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Yayasan Masjid Asy-Syuhada</h2> */}
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-center">
                    Yayasan Masjid <br />
                    <span className="text-primary">Asy-Syuhada</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Attached card (menyatu dengan gambar) */}
            <div className="-mt-10 md:-mt-14">
              <RevealGroup>
                <RevealItem>
                  <div className="mx-auto w-full max-w-5xl rounded-2xl border bg-background/95 p-6 shadow-sm backdrop-blur md:p-8">
                    <p className="text-sm font-medium text-primary">Profil Yayasan</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Tentang Yayasan Masjid Asy-Syuhada</h2>

                    <p className="mt-4 text-muted-foreground md:text-lg">
                      Yayasan berperan dalam mendukung pengelolaan kegiatan masjid secara terstruktur, transparan, dan berkelanjutan. Fokus utama
                      yayasan adalah memastikan program ibadah, pendidikan, dan sosial berjalan konsisten serta memberikan manfaat nyata bagi jamaah
                      dan masyarakat sekitar.
                    </p>

                    {/* Highlights (isi webnya) */}
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Transparansi</p>
                        <p className="mt-2 text-sm text-muted-foreground">Rekap pemasukan & pengeluaran dapat dipantau secara berkala.</p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Program Sosial</p>
                        <p className="mt-2 text-sm text-muted-foreground">Qurban, santunan, dan bantuan warga sekitar sesuai kebutuhan.</p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Pengembangan</p>
                        <p className="mt-2 text-sm text-muted-foreground">Renovasi & pengadaan fasilitas untuk meningkatkan kenyamanan jamaah.</p>
                      </div>
                    </div>

                    {/* LEGALITY / IZIN TPQ */}
                    <RevealGroup className="mt-6 grid gap-6 md:grid-cols-12">
                      <RevealItem className="md:col-span-5">
                        <div className="rounded-2xl border bg-background p-6 transition-colors duration-200 hover:border-primary">
                          <p className="text-sm font-medium text-primary">Legalitas</p>
                          <h3 className="mt-2 text-2xl font-bold tracking-tight">Izin / Dokumen TPQ</h3>
                          <p className="mt-4 text-muted-foreground">
                            Berikut adalah dokumentasi izin/legalitas TPQ. Silakan klik gambar untuk melihat versi yang lebih jelas.
                          </p>

                          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <p>
                              Nomor: <span className="font-medium text-foreground">xxxx</span>
                            </p>
                            <p>
                              Tanggal: <span className="font-medium text-foreground">xxxxx</span>
                            </p>
                          </div>
                        </div>
                      </RevealItem>

                      <RevealItem className="md:col-span-7">
                        <div className="overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary">
                          <div className="relative aspect-4/3 w-full">
                            <Image src={"/dkm/struktur.jpg"} alt={"Struktur"} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
                          </div>
                        </div>
                      </RevealItem>
                    </RevealGroup>
                  </div>

                  <YayasanNewsSection pageSize={6} />
                </RevealItem>
              </RevealGroup>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
