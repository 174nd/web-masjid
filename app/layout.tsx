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
        <SiteFooter />
      </body>
    </html>
  );
}
