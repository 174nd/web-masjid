"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Phone, MessageCircle, Mail, Instagram, Facebook, Youtube } from "lucide-react";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

type ContactCardProps = {
  title?: string;
  subtitle?: string;

  placeName?: string;
  addressLines?: string[];

  phone?: string;
  whatsapp?: string;
  email?: string;

  socialLinks?: SocialLinks;

  mapEmbedUrl: string;
  mapLinkUrl?: string;
};

function toWaNumber(input: string) {
  return input.replace(/\D/g, "");
}

export function ContactCard({
  title = "Kontak",
  subtitle = "Hubungi kami atau kunjungi lokasi masjid.",
  placeName = "Masjid Asy-Syuhada",
  addressLines = ["2XWJ+H9P, Buliang, Kec. Batu Aji", "Kota Batam, Kepulauan Riau 29424"],
  phone = "+62 812-3456-7890",
  whatsapp = "+62 812-3456-7890",
  email = "info@masjid.id",
  socialLinks = {
    instagram: "https://instagram.com/USERNAME_MASJID",
    facebook: "https://facebook.com/PAGE_MASJID",
    youtube: "https://youtube.com/@CHANNEL_MASJID",
  },
  mapEmbedUrl,
  mapLinkUrl = "https://www.google.com/maps?q=Masjid+Asy-Syuhada+Batam",
}: ContactCardProps) {
  return (
    <section id="contact" aria-label="Contact" className="py-14 md:py-20 scroll-mt-24">
      <Container>
        {/* Background overlay primary only inside container */}
        <div className="relative overflow-hidden rounded-3xl border">
          {/* primary overlay */}
          <div className="absolute inset-0 bg-primary/90" />
          {/* subtle pattern */}
          <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_40%),radial-gradient(circle_at_50%_90%,white,transparent_45%)]" />

          <div className="relative p-4 md:p-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-primary-foreground/90">Get in touch</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">{title}</h2>
              <p className="mt-3 text-primary-foreground/80 md:text-lg">{subtitle}</p>
            </div>

            {/* Cards */}
            <div className="grid items-stretch gap-6 md:grid-cols-12">
              {/* Left card */}
              <div className="md:col-span-5">
                <div className="h-full rounded-2xl border border-primary-foreground/15 bg-background/95 p-6 text-foreground shadow-sm">
                  <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-semibold">{placeName}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {addressLines.map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                        aria-label="Telepon"
                      >
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          Telepon
                        </span>
                        <span className="text-sm font-semibold">{phone}</span>
                      </a>
                    ) : null}

                    {whatsapp ? (
                      <a
                        href={`https://wa.me/${toWaNumber(whatsapp)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                        aria-label="WhatsApp"
                      >
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </span>
                        <span className="text-sm font-semibold">{whatsapp}</span>
                      </a>
                    ) : null}

                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                        aria-label="Email"
                      >
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          Email
                        </span>
                        <span className="text-sm font-semibold">{email}</span>
                      </a>
                    ) : null}
                  </div>

                  {socialLinks.instagram || socialLinks.facebook || socialLinks.youtube ? (
                    <div className="mt-6">
                      <p className="text-xs font-medium">Social Media</p>
                      <div className="mt-2 flex items-center gap-2">
                        {socialLinks.instagram ? (
                          <a
                            href={socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
                            aria-label="Instagram"
                            title="Instagram"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        ) : null}

                        {socialLinks.facebook ? (
                          <a
                            href={socialLinks.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
                            aria-label="Facebook"
                            title="Facebook"
                          >
                            <Facebook className="h-4 w-4" />
                          </a>
                        ) : null}

                        {socialLinks.youtube ? (
                          <a
                            href={socialLinks.youtube}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
                            aria-label="YouTube"
                            title="YouTube"
                          >
                            <Youtube className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={mapLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Open in Google Maps
                    </Link>

                    {whatsapp ? (
                      <a
                        href={`https://wa.me/${toWaNumber(whatsapp)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-semibold hover:bg-accent"
                      >
                        Chat WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right map card (height matches left) */}
              <div className="md:col-span-7">
                <div className="h-full overflow-hidden rounded-2xl border border-primary-foreground/15 bg-background/95 shadow-sm">
                  <div className="h-full min-h-[260px]">
                    <iframe
                      src={mapEmbedUrl}
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      title="Google Maps"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-primary-foreground/85">Jika peta tidak muncul, buka melalui tombol “Open in Google Maps”.</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
