"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export type DkmOrganizationSectionProps = {
  title?: string;
  subtitle?: string;

  headName?: string;
  headRole?: string;
  headPhotoSrc?: string;

  structureImageSrc?: string;
  structureImageAlt?: string;
};

export function DkmOrganizationSection({
  title = "Struktur Organisasi",
  subtitle = "Susunan pengurus DKM dan pembagian peran untuk mendukung operasional masjid secara efektif.",
  headName = "Nama Kepala DKM",
  headRole = "Kepala DKM",
  headPhotoSrc = "/images/dkm-ketua-placeholder.jpg",
  structureImageSrc = "/images/struktur-organisasi-placeholder.jpg",
  structureImageAlt = "Bagan Struktur Organisasi DKM",
}: DkmOrganizationSectionProps) {
  return (
    <section aria-label="Struktur organisasi DKM" className="py-10 md:py-14">
      <Container>
        <RevealGroup>
          <RevealItem>
            <div>
              <p className="text-xs font-medium text-primary">DKM</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">{subtitle}</p>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="mt-8 grid items-start gap-8 md:grid-cols-12">
              {/* LEFT: Ketua DKM (full width image, name below) */}
              <div className="md:col-span-4">
                <div className="w-full">
                  <div className="group relative w-full overflow-hidden rounded-2xl">
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={headPhotoSrc}
                        alt={headName}
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 420px"
                      />
                      {/* subtle gradient for readability */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/70 to-transparent" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-base font-semibold">{headName}</p>
                    <p className="text-sm text-muted-foreground">{headRole}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Struktur (full width, no forced aspect) */}
              <div className="min-w-0 md:col-span-8">
                <div className="group w-full overflow-hidden rounded-2xl">
                  <Image
                    src={structureImageSrc}
                    alt={structureImageAlt}
                    width={1600}
                    height={900}
                    className="h-auto w-full transition-transform duration-300 ease-out group-hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 900px"
                    priority={false}
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Bagan struktur dapat berupa gambar PNG/JPG atau export dari diagram (Canva/Draw.io).
                </p>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
