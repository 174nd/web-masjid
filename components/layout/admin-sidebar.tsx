"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Newspaper, Users, PanelLeftClose, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminUserMenu } from "@/components/layout/admin-user-menu";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Berita", href: "/admin/news", icon: Newspaper },

  { label: "Keuangan", href: "/admin/finance", icon: Wallet },
  { label: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (next: boolean) => void }) {
  const W_OPEN = 280;
  const W_COLLAPSED = 72;

  return (
    <motion.aside
      animate={{ width: collapsed ? W_COLLAPSED : W_OPEN }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className={cn(
        "relative flex h-screen flex-col border-r bg-background",
        "md:sticky md:top-0 md:max-h-screen md:overflow-y-auto md:self-start"
      )}
      style={{ willChange: "width" }}
    >
      <AdminSidebarContent mode="desktop" collapsed={collapsed} onCollapsedChange={onCollapsedChange} />
    </motion.aside>
  );
}

/**
 * Reusable sidebar content:
 * - desktop: support collapsed + tooltip hover label
 * - mobile: always expanded + no collapse button + can close drawer on navigation
 */
export function AdminSidebarContent({
  mode,
  collapsed,
  onCollapsedChange,
  onNavigate,
}: {
  mode: "desktop" | "mobile";
  collapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isMobile = mode === "mobile";

  const handleBrandClick = () => {
    // Mobile: brand selalu ke /admin dan tutup drawer
    if (isMobile) {
      router.push("/admin");
      onNavigate?.();
      return;
    }

    // Desktop behavior: collapsed -> expand, expanded -> go /admin
    if (collapsed) {
      onCollapsedChange(false);
      return;
    }
    router.push("/admin");
  };

  return (
    <>
      {/* Header */}
      <div className={cn("px-3 py-4", isMobile && "border-b")}>
        <div className={cn("flex items-center", collapsed && !isMobile ? "justify-center" : "justify-between")}>
          <button
            type="button"
            onClick={handleBrandClick}
            className={cn("flex items-center gap-3 text-left", collapsed && !isMobile && "justify-center")}
            aria-label={collapsed && !isMobile ? "Buka sidebar" : "Ke dashboard"}
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
              <Image src="/images/logo.png" sizes="36px" alt="Logo" fill className="object-contain" />
            </div>

            {/* Brand text: selalu tampil di mobile, tampil jika tidak collapsed di desktop */}
            <AnimatePresence initial={false}>
              {!collapsed || isMobile ? (
                <motion.div
                  key="brand-text"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 leading-tight"
                >
                  <div className="truncate text-sm font-semibold">Masjid Asy-Syuhada</div>
                  <div className="truncate text-xs text-muted-foreground">Admin Panel</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </button>

          {/* Desktop collapse button only when expanded */}
          {!isMobile && !collapsed ? (
            <Button type="button" variant="ghost" size="icon" onClick={() => onCollapsedChange(true)} aria-label="Collapse sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <Separator className={cn(isMobile && "hidden")} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            const showInlineLabel = isMobile || (!isMobile && !collapsed);
            const showTooltipLabel = !isMobile && collapsed;

            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  onClick={() => {
                    if (isMobile) onNavigate?.();
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    "hover:bg-muted transition-colors",
                    active ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
                    !isMobile && collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4" />

                  {/* Inline label */}
                  <AnimatePresence initial={false}>
                    {showInlineLabel ? (
                      <motion.span
                        key="inline-label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.12 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  {/* Tooltip label for collapsed desktop */}
                  {showTooltipLabel ? (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2",
                        "rounded-md border bg-background px-2 py-1 text-xs text-foreground shadow-sm",
                        "opacity-0 translate-x-1 transition-all duration-150",
                        "group-hover:opacity-100 group-hover:translate-x-0"
                      )}
                    >
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* User area */}
      <div className="p-2">
        <AdminUserMenu collapsed={!isMobile && collapsed} />
      </div>
    </>
  );
}
