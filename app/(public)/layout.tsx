import type { Metadata } from "next";
import { Dosis, Oswald, Mr_Dafoe } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import "@/app/globals.css";

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-dosis",
  display: "swap",
  // sesuaikan kebutuhan
  weight: ["300", "400", "500", "600", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const mrDafoe = Mr_Dafoe({
  subsets: ["latin"],
  variable: "--font-mr-dafoe",
  display: "swap",
  weight: "400", // Mr Dafoe umumnya cuma 400
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Masjid Asy-Syuhada Batam",
    template: "%s | Masjid Asy-Syuhada Batam",
  },
  description: "Informasi kegiatan, jadwal sholat, infak & pengeluaran, serta kontak Masjid Asy-Syuhada Batam.",
  applicationName: "Masjid Asy-Syuhada",
  keywords: ["Masjid", "Batam", "Jadwal Sholat", "Infak", "Kajian"],
  openGraph: {
    type: "website",
    url: "/",
    title: "Masjid Asy-Syuhada Batam",
    description: "Informasi kegiatan, jadwal sholat, infak & pengeluaran, serta kontak Masjid Asy-Syuhada Batam.",
    images: [{ url: DEFAULT_OG_IMAGE, alt: "Masjid Asy-Syuhada" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masjid Asy-Syuhada Batam",
    description: "Informasi kegiatan, jadwal sholat, infak & pengeluaran, serta kontak Masjid Asy-Syuhada Batam.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${dosis.variable} ${oswald.variable} ${mrDafoe.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
