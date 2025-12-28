"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { motion, useScroll, useTransform } from "motion/react";
import { Phone, MessageCircle, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

type ContactSectionProps = {
  brand?: string;

  title?: string;
  subtitle?: string;

  addressLines?: string[];

  phone?: string;
  whatsapp?: string;
  email?: string;

  socialLinks?: SocialLinks;

  mapEmbedUrl: string;
  mapLinkUrl?: string;

  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
};

function toWaNumber(input: string) {
  return input.replace(/\D/g, "");
}

export function ContactCard({
  brand = "Masjid Asy-Syuhada",
  title = "Kontak & Lokasi",
  subtitle = "Hubungi kami untuk informasi kegiatan, kerja sama, atau bantuan. Anda juga dapat langsung menuju lokasi melalui Google Maps.",
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
  backgroundImageSrc = "/images/contact-bg.jpg",
  backgroundImageAlt = "Background Masjid",
}: ContactSectionProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax range (lebih terasa dari sebelumnya)
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="contact" aria-label="Contact" className="py-14 md:py-10 scroll-mt-24">
      <Container>
        <RevealGroup>
          <RevealItem>
            <div ref={ref} className="relative overflow-hidden rounded-3xl border">
              {/* Background image (parallax) */}
              <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ y }}>
                <Image
                  src={backgroundImageSrc}
                  alt={backgroundImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1024px"
                  className="object-cover scale-110 blur-md brightness-75 contrast-110"
                  priority={false}
                />
              </motion.div>

              {/* Overlay tint (biar gambar tetap terlihat) */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-b from-primary/35 via-primary/55 to-primary/70" />

              {/* Subtle highlight */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-10 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_40%),radial-gradient(circle_at_50%_90%,white,transparent_45%)]" />

              {/* Content */}
              <div className="relative z-20 p-4 md:p-8">
                <div className="mb-6 flex items-center flex-col">
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl text-center">{title}</h2>
                  <p className="mt-3 max-w-2xl text-white/80 md:text-lg text-center">{subtitle}</p>
                </div>

                <div className="grid items-stretch gap-6 md:grid-cols-12">
                  {/* LEFT: Contact card */}
                  <div className="md:col-span-5">
                    <div className="h-full rounded-2xl border border-primary-foreground/15 bg-background/95 p-6 shadow-sm">
                      {/* Address */}
                      <div className="rounded-xl border bg-background p-4">
                        <p className="text-sm font-semibold">{brand}</p>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {addressLines.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>

                      {/* Contact rows */}
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

                      {/* Social icons */}
                      {socialLinks.instagram || socialLinks.facebook || socialLinks.youtube ? (
                        <div className="mt-6">
                          <p className="text-xs font-medium text-foreground">Social Media</p>
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

                      {/* CTA */}
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

                  {/* RIGHT: Map card (height matches left) */}
                  <div className="md:col-span-7">
                    <div className="h-full overflow-hidden rounded-2xl border border-primary-foreground/15 bg-background/95 shadow-sm">
                      <div className="h-full min-h-65">
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
                  </div>
                </div>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
