"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";

type ContactCardProps = {
  title?: string;
  subtitle?: string;

  placeName?: string;
  addressLines?: string[];
  phone?: string;
  email?: string;

  /** Google Maps Embed URL (recommended). */
  mapEmbedUrl: string;

  /** Link ke Google Maps (opsional). */
  mapLinkUrl?: string;
};

export function ContactCard({
  title = "Contact",
  subtitle = "Silakan hubungi kami atau kunjungi lokasi masjid.",
  placeName = "Masjid",
  addressLines = ["Batam, Kepulauan Riau", "Indonesia"],
  phone,
  email,
  mapEmbedUrl,
  mapLinkUrl,
}: ContactCardProps) {
  return (
    <section id="contact" aria-label="Contact" className="py-14 md:py-20">
      <Container>
        <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur md:p-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-primary">Get in touch</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">{subtitle}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-12">
            {/* LEFT: address */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border bg-background p-6">
                <p className="text-sm font-medium">{placeName}</p>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {addressLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  {phone ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Phone</span>
                      <a className="font-medium hover:underline" href={`tel:${phone}`}>
                        {phone}
                      </a>
                    </div>
                  ) : null}

                  {email ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Email</span>
                      <a className="font-medium hover:underline" href={`mailto:${email}`}>
                        {email}
                      </a>
                    </div>
                  ) : null}
                </div>

                {mapLinkUrl ? (
                  <div className="mt-6">
                    <Link
                      href={mapLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Open in Google Maps
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            {/* RIGHT: maps */}
            <div className="md:col-span-7">
              <div className="overflow-hidden rounded-2xl border bg-background">
                <div className="relative w-full aspect-video">
                  <iframe
                    src={mapEmbedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title="Google Maps"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">Jika peta tidak muncul, buka melalui tombol “Open in Google Maps”.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
