"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Phone, MessageCircle, Mail, Instagram, Facebook, Youtube } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/#main", label: "Beranda" },
  { href: "/yayasan", label: "Yayasan" },
  { href: "/dkm", label: "DKM (Pengurus)" },
  { href: "/tpq", label: "TPQ" },
  { href: "/#contact", label: "Contak" },
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

function getHashId(href: string) {
  // support "#contact" dan "/#contact"
  const i = href.indexOf("#");
  if (i === -1) return "";
  return href.slice(i + 1);
}

function scrollToSection(id: string, headerOffsetPx: number) {
  const el = document.getElementById(id);
  if (!el) return;

  const gap = 10;
  const y = window.scrollY + el.getBoundingClientRect().top - headerOffsetPx - gap;

  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

export function SiteHeader() {
  const [topBarVisible, setTopBarVisible] = React.useState(true);
  const [borderPrimary, setBorderPrimary] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [activeId, setActiveId] = React.useState<string>("main");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Setelah mount, baru sync dari hash kalau ada
    const hash = window.location.hash.replace("#", "");
    if (hash) setActiveId(hash);
  }, []);

  const prevTopBarVisibleRef = React.useRef(true);
  const headerRef = React.useRef<HTMLElement | null>(null);

  // Programmatic scroll guard
  const programmaticScrollRef = React.useRef(false);
  const programmaticTimerRef = React.useRef<number | null>(null);

  const markProgrammaticScroll = React.useCallback(() => {
    programmaticScrollRef.current = true;
    if (programmaticTimerRef.current) window.clearTimeout(programmaticTimerRef.current);
    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 900);
  }, []);

  const getHeaderOffset = React.useCallback(() => {
    const h = headerRef.current?.getBoundingClientRect().height ?? 96;
    return Math.ceil(h);
  }, []);

  // Scroll handler: topbar show/hide + border
  React.useEffect(() => {
    let raf = 0;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setBorderPrimary(y > BORDER_PRIMARY_AT);

      if (!programmaticScrollRef.current) {
        setTopBarVisible((prev) => {
          if (prev && y > TOPBAR_HIDE_AT) return false;
          if (!prev && y < TOPBAR_SHOW_AT) return true;
          return prev;
        });
      }
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
    if (programmaticScrollRef.current) return;

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

  // Close mobile menu on outside click
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

  /**
   * Scroll spy (POS-based):
   * Active = section yang sedang “meng-cover” garis referensi tepat di bawah header.
   * Jika dekat atas, paksa active "main".
   */
  React.useEffect(() => {
    const ids = ["main", ...NAV_ITEMS.map((n) => getHashId(n.href)).filter(Boolean)];
    const uniqueIds = Array.from(new Set(ids));

    const els = uniqueIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    let raf = 0;
    const computeActive = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;

      // Kalau dekat atas, paksa ke main
      if (y <= 40) {
        setActiveId("main");
        return;
      }

      const headerOffset = getHeaderOffset();
      const anchorY = headerOffset + 8; // garis referensi tepat di bawah header

      // Pilih section yang posisi top-nya paling dekat ke anchorY
      // Aturan:
      // - Jika anchorY berada di dalam section (top <= anchorY < bottom) => prioritas utama
      // - Jika tidak ada, ambil yang top-nya paling dekat (berdasarkan abs(top - anchorY))
      let bestId = "main";
      let bestScore = Number.POSITIVE_INFINITY;
      let bestInside = false;

      for (const el of els) {
        const rect = el.getBoundingClientRect();
        const inside = rect.top <= anchorY && rect.bottom > anchorY;

        // Score untuk inside: pakai jarak kecil agar selalu menang
        // Score untuk non-inside: jarak absolut dari top ke anchor
        const score = inside ? Math.abs(rect.top - anchorY) : Math.abs(rect.top - anchorY) + 2000;

        if (
          score < bestScore ||
          // kalau sama-sama inside, pilih yang lebih dekat
          (inside && bestInside && score < bestScore) ||
          // kalau best sebelumnya non-inside tapi sekarang inside, pilih inside
          (inside && !bestInside)
        ) {
          bestInside = inside;
          bestScore = score;
          bestId = el.id;
        }
      }

      setActiveId(bestId || "main");
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeActive);
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeActive);
    };

    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) setActiveId(hash);
      else setActiveId("main");
      onScroll();
    };

    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [getHeaderOffset]);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    const id = getHashId(href);

    // Jika tidak ada hash, biarkan navigasi normal (pindah halaman)
    if (!id) return;

    e.preventDefault();

    // close mobile panel
    setMobileOpen(false);

    // 1-click behavior:
    // kalau topbar masih visible, collapse dulu lalu scroll setelah layout berubah
    if (topBarVisible) {
      markProgrammaticScroll();
      setTopBarVisible(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const offset = getHeaderOffset();
          scrollToSection(id, offset);
          setActiveId(id);
        });
      });

      return;
    }

    markProgrammaticScroll();
    const offset = getHeaderOffset();
    scrollToSection(id, offset);
    setActiveId(id);
  };

  const desktopLinkClass = (href: string) => {
    const id = getHashId(href);
    const isActive = mounted && id ? activeId === id : false;

    return [linkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
  };

  const mobileLinkClass = (href: string) => {
    const id = getHashId(href);
    const isActive = mounted && id ? activeId === id : false;

    return [mobileLinkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
  };

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
                {/* LEFT: Phone + WhatsApp + Email */}
                <div className="flex items-center gap-3">
                  <a
                    href="tel:+6281234567890"
                    className="inline-flex items-center gap-2 text-xs text-primary-foreground/90 hover:text-primary-foreground"
                    aria-label="Telepon"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">+62 812-3456-7890</span>
                    <span className="sm:hidden">Telepon</span>
                  </a>

                  <span className="h-4 w-px bg-primary-foreground/25" />

                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-primary-foreground/90 hover:text-primary-foreground"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                    <span className="sm:hidden">WA</span>
                  </a>

                  <span className="h-4 w-px bg-primary-foreground/25" />

                  <a
                    href="mailto:info@masjid.id"
                    className="inline-flex items-center gap-2 text-xs text-primary-foreground/90 hover:text-primary-foreground"
                    aria-label="Email"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">info@masjid.id</span>
                    <span className="sm:hidden">Email</span>
                  </a>
                </div>

                {/* RIGHT: Social icons */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com/USERNAME_MASJID"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>

                  <a
                    href="https://facebook.com/PAGE_MASJID"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>

                  <a
                    href="https://youtube.com/@CHANNEL_MASJID"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navbar */}
      <nav aria-label="Primary">
        <Container>
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
                <Link href="/" className="flex items-center gap-2 tracking-tight">
                  <Image src="/images/logo.png" className="h-full" alt="Brand logo" width={36} height={36} priority />
                  <span className="text-xl font-bold">Masjid Asy-Syuhada</span>
                </Link>

                <div className="flex-1" />

                {/* Desktop */}
                <div className="hidden items-center gap-4 md:flex">
                  {NAV_ITEMS.map((item) => (
                    <a key={item.href} href={item.href} className={desktopLinkClass(item.href)} onClick={handleNavClick(item.href)}>
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

            {/* Mobile dropdown */}
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
                      <a key={item.href} href={item.href} className={mobileLinkClass(item.href)} onClick={handleNavClick(item.href)}>
                        {item.label}
                      </a>
                    ))}
                  </div>

                  <div className="my-4 h-px w-full bg-border" />

                  <div className="flex flex-col gap-3">
                    <Link href="/login" className={mobileLinkUnderlineClass} onClick={() => setMobileOpen(false)}>
                      Sign in
                    </Link>

                    {/* CTA Contact (tetap scroll 1x klik) */}
                    <a
                      href="/#contact"
                      onClick={handleNavClick("/#contact")}
                      className={[
                        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                        activeId === "contact" ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:opacity-90",
                      ].join(" ")}
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
