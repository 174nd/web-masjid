export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://DOMAINKAMU.COM";
export const DEFAULT_OG_IMAGE = "/images/masjid.jpg";

export function toAbsoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
