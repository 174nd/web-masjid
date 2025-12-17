"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "#features", label: "Yayasan" },
  { href: "#pricing", label: "DKM (Pengurus)" },
  { href: "#faq", label: "TPQ" },
  { href: "#contact", label: "Contact" },
];

const TOPBAR_HIDE_AT = 80;
const TOPBAR_SHOW_AT = 20;
const BORDER_PRIMARY_AT = 12;

const AUTO_SCROLL_TO_TOP_ON_TOPBAR_SHOW = true;
const AUTO_SCROLL_BEHAVIOR: ScrollBehavior = "smooth";

const linkUnderlineClass =
  "relative pb-1 text-sm text-muted-foreground hover:text-foreground " +
  "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary " +
  "after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left " +
  "after:transition-transform after:duration-300 after:ease-out";

const mobileLinkUnderlineClass =
  "relative inline-block pb-1 text-base text-muted-foreground hover:text-foreground " +
  "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary " +
  "after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left " +
  "after:transition-transform after:duration-300 after:ease-out";

const topbarLinkClass =
  "relative pb-0.5 text-xs text-primary-foreground/90 hover:text-primary-foreground " +
  "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary-foreground " +
  "after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left " +
  "after:transition-transform after:duration-300 after:ease-out";

export function SiteHeader() {
  const [topBarVisible, setTopBarVisible] = React.useState(true);
  const [borderPrimary, setBorderPrimary] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const prevTopBarVisibleRef = React.useRef(true);
  const headerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    let raf = 0;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setBorderPrimary(y > BORDER_PRIMARY_AT);

      setTopBarVisible((prev) => {
        if (prev && y > TOPBAR_HIDE_AT) return false;
        if (!prev && y < TOPBAR_SHOW_AT) return true;
        return prev;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Auto scroll ke paling atas saat topbar muncul lagi
  React.useEffect(() => {
    const prev = prevTopBarVisibleRef.current;
    const next = topBarVisible;
    prevTopBarVisibleRef.current = next;

    if (!AUTO_SCROLL_TO_TOP_ON_TOPBAR_SHOW) return;
    if (prev === false && next === true) {
      setBorderPrimary(false);
      window.scrollTo({ top: 0, behavior: AUTO_SCROLL_BEHAVIOR });

      window.setTimeout(
        () => {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          setBorderPrimary(y > BORDER_PRIMARY_AT);
        },
        AUTO_SCROLL_BEHAVIOR === "smooth" ? 450 : 60
      );
    }
  }, [topBarVisible]);

  // Tutup mobile menu saat klik di luar area header
  React.useEffect(() => {
    if (!mobileOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = headerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setMobileOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen]);

  return (
    <motion.header
      ref={headerRef}
      className="sticky top-0 z-50 w-full py-2"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 rounded-md border bg-background px-3 py-2 text-sm"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <AnimatePresence initial={false}>
        {topBarVisible ? (
          <motion.div
            key="topbar"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <Container>
              <div className="flex h-10 items-center justify-between rounded-t-md bg-primary px-3 text-primary-foreground">
                <p className="text-xs text-primary-foreground/90">New: Launch promo ends this week.</p>

                <div className="flex items-center gap-4">
                  <Link href="/docs" className={topbarLinkClass}>
                    Docs
                  </Link>
                  <Link href="/changelog" className={topbarLinkClass}>
                    Changelog
                  </Link>
                </div>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navbar */}
      <nav aria-label="Primary">
        <Container>
          {/* Relatif agar dropdown mobile bisa “nempel” di bawah navbar */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
              className={[
                "flex h-16 items-center border bg-background/80 backdrop-blur",
                "supports-backdrop-filter:bg-background/80",
                "transition-colors duration-200",
                borderPrimary ? "border-primary rounded-md" : "border-border rounded-b-md",
              ].join(" ")}
            >
              <div className="flex w-full items-center gap-4 px-4">
                {/* Logo + Brand */}
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                  <Image src="/images/logo.png" className="h-full" alt="Brand logo" width={36} height={36} priority />
                  <span>Masjid Asy-Syuhada</span>
                </Link>

                <div className="flex-1" />

                {/* Desktop actions */}
                <div className="hidden items-center gap-4 md:flex">
                  {NAV_ITEMS.map((item) => (
                    <a key={item.href} href={item.href} className={linkUnderlineClass}>
                      {item.label}
                    </a>
                  ))}
                </div>

                {/* Mobile toggle */}
                <div className="md:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-nav-panel"
                    onClick={() => setMobileOpen((v) => !v)}
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Mobile dropdown panel: muncul tepat di bawah navbar */}
            <AnimatePresence initial={false}>
              {mobileOpen ? (
                <motion.div
                  id="mobile-nav-panel"
                  key="mobile-panel"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-md border bg-background/95 p-4 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80"
                >
                  <div className="flex flex-col gap-3">
                    {NAV_ITEMS.map((item) => (
                      <a key={item.href} href={item.href} className={mobileLinkUnderlineClass} onClick={() => setMobileOpen(false)}>
                        {item.label}
                      </a>
                    ))}
                  </div>

                  <div className="my-4 h-px w-full bg-border" />

                  <div className="flex flex-col gap-3">
                    <Link href="/login" className={mobileLinkUnderlineClass} onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>

                    <a
                      href="#contact"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                      Contact
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </Container>
      </nav>
    </motion.header>
  );
}
