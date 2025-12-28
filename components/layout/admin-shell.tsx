"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Container } from "@/components/layout/container";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebarContent } from "@/components/layout/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false); // desktop default terbuka
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <Container className="px-0!">
        <div className="min-h-screen rounded-xl border bg-background overflow-hidden md:overflow-visible">
          {/* MOBILE TOP NAVBAR */}
          <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                <Image src="/images/logo.png" alt="Logo" sizes="36px" fill className="object-contain" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Masjid Asy-Syuhada</div>
                <div className="text-xs text-muted-foreground">Admin Panel</div>
              </div>
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              {/* Drawer kiri */}
              <SheetContent side="left" className="w-80 p-0" aria-describedby={undefined}>
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Navigation</SheetTitle>
                </SheetHeader>

                <AdminSidebarContent mode="mobile" collapsed={false} onCollapsedChange={() => {}} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden min-h-[calc(100svh-3rem)] md:flex">
            <AdminSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

            <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6">{children}</main>
          </div>

          {/* MOBILE CONTENT */}
          <main className="px-4 py-6 md:hidden">{children}</main>
        </div>
      </Container>
    </div>
  );
}
