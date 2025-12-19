"use client";

import * as React from "react";
import Preloader from "@/components/preloader";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useUiPreloader } from "@/stores/ui-preloader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const done = useUiPreloader((s) => s.isPreloaderDone);

  return (
    <>
      {/* Preloader ALWAYS mounted first and on top */}
      <Preloader />

      {/* Render the rest only when preloader is done */}
      {done ? (
        <>
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter mapEmbedUrl="https://www.google.com/maps/embed?pb=..." />
        </>
      ) : null}
    </>
  );
}
