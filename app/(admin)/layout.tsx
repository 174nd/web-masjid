import type { Metadata } from "next";
import { Dosis, Oswald, Mr_Dafoe } from "next/font/google";
import "@/app/globals.css";
import { AdminQueryProvider } from "@/providers/admin-query-provider";

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
  title: "Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${dosis.variable} ${oswald.variable} ${mrDafoe.variable} antialiased`}>
        <AdminQueryProvider>{children}</AdminQueryProvider>
      </body>
    </html>
  );
}
