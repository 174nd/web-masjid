import Link from "next/link";
import { Container } from "@/components/layout/container";

type SiteFooterProps = {
  brand?: string;
  description?: string;
  addressLines?: string[];
  phone?: string;
  email?: string;

  mapEmbedUrl?: string;
  mapLinkUrl?: string;
};

export function SiteFooter({
  brand = "Masjid Asy-Syuhada",
  description = "Pusat ibadah, dakwah, dan kegiatan sosial untuk jamaah di wilayah Batam.",
  addressLines = ["2XWJ+H9P, Buliang, Kec. Batu Aji", "Kota Batam, Kepulauan Riau 29424"],
  phone,
  email,
  mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127652.89152841926!2d103.82851849726562!3d1.0464731999999919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98dbe3265b639%3A0xd01b0d815c36ae0a!2sMasjid%20Asy-Syuhada!5e0!3m2!1sid!2sid!4v1765951360338!5m2!1sid!2sid",
  mapLinkUrl = "https://www.google.com/maps?q=Masjid+Asy-Syuhada+Batam",
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">M</span>
              <span>{brand}</span>
            </Link>

            <p className="mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <p className="text-sm font-semibold">Quick Links</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="#main">
                  Beranda
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#about">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#infak">
                  Infak
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#prayer-times">
                  Jadwal Sholat
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#contact">
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          {/* Contact + Map */}
          <div className="md:col-span-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Contact</p>
              <Link href={mapLinkUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                Open in Maps
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Alamat</p>
                {addressLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {phone ? (
                <div className="flex items-center justify-between gap-4">
                  <span>Phone</span>
                  <a className="font-medium text-foreground hover:underline" href={`tel:${phone}`}>
                    {phone}
                  </a>
                </div>
              ) : null}

              {email ? (
                <div className="flex items-center justify-between gap-4">
                  <span>Email</span>
                  <a className="font-medium text-foreground hover:underline" href={`mailto:${email}`}>
                    {email}
                  </a>
                </div>
              ) : null}
            </div>

            {/* Map embed */}
            <div className="mt-6 overflow-hidden rounded-xl border">
              <div className="relative aspect-video w-full">
                <iframe
                  src={mapEmbedUrl}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  title="Google Maps - Masjid Asy-Syuhada"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={mapLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-accent"
              >
                Google Maps
              </Link>
              <Link
                href="#infak"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Infak
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {brand}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
