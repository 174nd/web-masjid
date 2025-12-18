import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Phone, MessageCircle, Mail, Instagram, Facebook, Youtube } from "lucide-react";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

type SiteFooterProps = {
  brand?: string;
  description?: string;
  logoSrc?: string;

  quickLinks?: Array<{ label: string; href: string }>;

  addressLines?: string[];
  phone?: string;
  whatsapp?: string; // format bebas, akan di-sanitize untuk wa.me
  email?: string;

  socialLinks?: SocialLinks;

  mapEmbedUrl: string;
  mapLinkUrl?: string;
};

function toWaNumber(input: string) {
  // ambil digit saja (contoh: +62 812-xxx -> 62812xxx)
  return input.replace(/\D/g, "");
}

export function SiteFooter({
  brand = "Masjid Asy-Syuhada",
  description = "Masjid Asy-Syuhada adalah pusat ibadah, dakwah, dan kegiatan sosial untuk jamaah di wilayah Batam. Mari bersama memakmurkan masjid dengan shalat berjamaah, kajian, dan program kemaslahatan.",
  logoSrc = "/images/logo.png",
  quickLinks = [
    { label: "Beranda", href: "/#main" },
    { label: "About", href: "/#about" },
    { label: "Infak", href: "/#infak" },
    { label: "Jadwal Sholat", href: "/#prayer-times" },
    { label: "Contact", href: "/#contact" },
  ],
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
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background">
      {/* MAIN */}
      <div className="border-t">
        <Container>
          <div className="grid gap-10 py-12 md:grid-cols-12">
            {/* 1) Brand */}
            <div className="md:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2 font-semibold">
                <Image src={logoSrc} alt={`${brand} logo`} width={40} height={40} priority />
                <span>{brand}</span>
              </Link>

              <p className="mt-4 text-sm text-muted-foreground">{description}</p>
            </div>

            {/* 2) Quick Links */}
            <div className="md:col-span-2">
              <p className="text-sm font-semibold">Quick Links</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <a className="hover:text-foreground" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3) Kontak Kami (disamakan dengan topbar) */}
            <div className="md:col-span-3">
              <p className="text-sm font-semibold">Kontak Kami</p>

              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                {/* Telepon */}
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                    aria-label="Telepon"
                  >
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-foreground">{phone}</span>
                  </a>
                ) : null}

                {/* WhatsApp */}
                {whatsapp ? (
                  <a
                    href={`https://wa.me/${toWaNumber(whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                    aria-label="WhatsApp"
                  >
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-foreground">{whatsapp}</span>
                  </a>
                ) : null}

                {/* Email */}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
                    aria-label="Email"
                  >
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-foreground">{email}</span>
                  </a>
                ) : null}

                {/* Social icons (seperti topbar kanan) */}
                {socialLinks.instagram || socialLinks.facebook || socialLinks.youtube ? (
                  <div>
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
              </div>
            </div>

            {/* 4) Maps */}
            <div className="md:col-span-3">
              <p className="text-sm font-semibold">Lokasi</p>

              {/* Alamat */}
              <div className="text-sm">
                <p>Perumahan Tering Raya Melcem RW 018 Kelurahan Tanjung Sengkuang Kecamatan Batu Ampar</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border">
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

              <Link
                href={mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center mt-4 justify-center rounded-md border px-3 text-sm hover:bg-accent"
              >
                Open in Google Maps
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-primary">
        <Container>
          <div className="flex flex-col gap-3 py-5 text-xs text-primary-foreground/90 md:flex-row md:items-center md:justify-between">
            <p>
              © {year} {brand}. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="hover:text-primary-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary-foreground">
                Terms
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
