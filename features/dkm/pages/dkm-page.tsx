"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { DkmCashflowCard } from "../component/dkm-cashflow-card";
import { mockYayasanNews } from "@/data/mock-yayasan-news";
import { mockDkmCashflow } from "@/data/mock-dkm-cashflow";
import { DkmOrganizationSection } from "../component/dkm-organization-section";
import { DkmNewsSection } from "../component/dkm-news-section";

export function DkmPageClient() {
  return (
    <div>
      {/* HERO + ATTACHED CARD */}
      <section aria-label="DKM hero" className="py-10 md:py-14">
        <Container>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border">
              <div className="relative h-48 w-full md:h-64">
                <Image src="/hero/bg-3.jpg" alt="DKM" fill priority className="object-cover blur-xs" sizes="(max-width: 768px) 100vw, 1024px" />

                <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/45 to-white" />
                <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_40%)]" />

                <div className="absolute inset-0 grid place-items-center -mt-10">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-center">
                    Dewan Kemakmuran <span className="text-primary">Masjid</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Attached card */}
            <div className="-mt-10 md:-mt-14">
              <RevealGroup>
                <RevealItem>
                  <div className="mx-auto w-full max-w-5xl rounded-2xl border bg-background/95 p-6 shadow-sm backdrop-blur md:p-8">
                    <p className="text-sm font-medium text-primary">Profil DKM</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Tentang DKM Masjid Asy-Syuhada</h2>

                    <p className="mt-4 text-muted-foreground md:text-lg">
                      DKM bertanggung jawab dalam pengelolaan operasional masjid, pelaksanaan kegiatan ibadah, serta pengadministrasian pemasukan dan
                      pengeluaran secara transparan. Data cashflow berikut disajikan untuk memudahkan jamaah memantau penggunaan dana.
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Operasional</p>
                        <p className="mt-2 text-sm text-muted-foreground">Kebersihan, utilitas, konsumsi kegiatan, dan pemeliharaan rutin.</p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Kegiatan</p>
                        <p className="mt-2 text-sm text-muted-foreground">Kajian, pembinaan, program sosial, serta koordinasi acara masjid.</p>
                      </div>

                      <div className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                        <p className="text-sm font-semibold">Transparansi</p>
                        <p className="mt-2 text-sm text-muted-foreground">Rekap pemasukan & pengeluaran ditampilkan untuk akuntabilitas.</p>
                      </div>
                    </div>

                    <DkmOrganizationSection
                      headName="Nama Ketua DKM"
                      headRole="Kepala DKM"
                      headPhotoSrc="/dkm/kepala.jpg"
                      structureImageSrc="/dkm/struktur.jpg"
                    />

                    <DkmCashflowCard items={mockDkmCashflow} pageSize={6} />
                  </div>
                </RevealItem>
              </RevealGroup>
            </div>
          </div>
        </Container>
      </section>

      {/* CASHFLOW TABLE (pagination inside card) */}

      {/* NEWS (same as before) */}
      <DkmNewsSection items={mockYayasanNews} pageSize={6} />
    </div>
  );
}
