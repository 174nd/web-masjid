import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Preloader from "@/components/preloader";
import { SiteHeader } from "@/components/layout/site-header";
import { Dosis, Oswald, Mr_Dafoe } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dosis.variable} ${oswald.variable} ${mrDafoe.variable} antialiased`}>
        <Preloader />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127652.89152841926!2d103.82851849726562!3d1.0464731999999919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98dbe3265b639%3A0xd01b0d815c36ae0a!2sMasjid%20Asy-Syuhada!5e0!3m2!1sid!2sid!4v1765951360338!5m2!1sid!2sid" />
      </body>
    </html>
  );
}
