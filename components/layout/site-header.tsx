"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, easeOut, motion } from "motion/react";
import { Menu, X, Phone, MessageCircle, Mail, Instagram, Facebook, Youtube } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Beranda" },
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

const navContainer = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut, staggerChildren: 0.06 },
  },
};

const navItem = {
  hidden: { opacity: 0, y: -6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } },
};

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
  const pathname = usePathname();
  const router = useRouter();

  const [topBarVisible, setTopBarVisible] = React.useState(true);
  const [borderPrimary, setBorderPrimary] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [activeId, setActiveId] = React.useState<string>("main");
  const [mounted, setMounted] = React.useState(false);

  // track section visibility (agar "Contak" aktif hanya ketika section-nya terlihat)
  const [inViewMap, setInViewMap] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setMounted(true);
    // Penting: jangan setActiveId dari hash di sini,
    // karena active diminta hanya saat section terlihat.
  }, []);

  const prevTopBarVisibleRef = React.useRef(true);
  const headerRef = React.useRef<HTMLElement | null>(null);

  // Programmatic scroll guard
  const programmaticScrollRef = React.useRef(false);
  const programmaticTimerRef = React.useRef<number | null>(null);

  // hash yang perlu di-scroll setelah pindah route
  const pendingHashRef = React.useRef<string>("");

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
   * Track "in view" untuk section (khususnya contact).
   * Active untuk link hash akan bergantung pada inViewMap[id] === true.
   */
  React.useEffect(() => {
    if (!mounted) return;
    if (pathname !== "/") {
      setInViewMap({});
      setActiveId("main");
      return;
    }

    const ids = ["main", ...NAV_ITEMS.map((n) => getHashId(n.href)).filter(Boolean)];
    const uniqueIds = Array.from(new Set(ids));

    const els = uniqueIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setInViewMap((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            next[entry.target.id] = entry.isIntersecting;
          }
          return next;
        });
      },
      {
        // section dianggap "terlihat" jika cukup masuk viewport
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, pathname]);

  /**
   * Scroll spy (POS-based):
   * - Tetap menentukan activeId berdasar posisi, tapi hanya berjalan di "/"
   * - Active UI untuk link hash tetap bergantung pada inViewMap (agar "Contak" tidak aktif kalau tidak terlihat)
   */
  React.useEffect(() => {
    if (pathname !== "/") {
      setActiveId("main");
      return;
    }

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

      let bestId = "main";
      let bestScore = Number.POSITIVE_INFINITY;
      let bestInside = false;

      for (const el of els) {
        const rect = el.getBoundingClientRect();
        const inside = rect.top <= anchorY && rect.bottom > anchorY;

        const score = inside ? Math.abs(rect.top - anchorY) : Math.abs(rect.top - anchorY) + 2000;

        if (score < bestScore || (inside && !bestInside)) {
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

    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [getHeaderOffset, pathname]);

  /**
   * Setelah pindah ke "/" dengan hash (contoh dari halaman lain klik /#contact),
   * lakukan scroll offset-aware.
   */
  React.useEffect(() => {
    if (!mounted) return;
    if (pathname !== "/") return;

    const hash = pendingHashRef.current || window.location.hash.replace("#", "");
    if (!hash) return;

    // reset pending agar tidak looping
    pendingHashRef.current = "";

    // close mobile panel kalau masih kebuka
    setMobileOpen(false);

    // jika topbar masih visible, collapse dulu, lalu scroll
    if (topBarVisible) {
      markProgrammaticScroll();
      setTopBarVisible(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const offset = getHeaderOffset();
          scrollToSection(hash, offset);
        });
      });

      return;
    }

    markProgrammaticScroll();
    requestAnimationFrame(() => {
      const offset = getHeaderOffset();
      scrollToSection(hash, offset);
    });
  }, [mounted, pathname, topBarVisible, getHeaderOffset, markProgrammaticScroll]);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    const id = getHashId(href);

    // Jika tidak ada hash: biarkan navigasi normal (pindah halaman)
    if (!id) return;

    e.preventDefault();

    // close mobile panel
    setMobileOpen(false);

    // Kalau sedang di halaman selain "/", navigasi ke "/" dulu lalu scroll
    if (pathname !== "/") {
      pendingHashRef.current = id;
      router.push(`/#${id}`);
      return;
    }

    // di halaman "/" => scroll offset-aware seperti sebelumnya
    if (topBarVisible) {
      markProgrammaticScroll();
      setTopBarVisible(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const offset = getHeaderOffset();
          scrollToSection(id, offset);
        });
      });

      return;
    }

    markProgrammaticScroll();
    const offset = getHeaderOffset();
    scrollToSection(id, offset);
  };

  const desktopLinkClass = (href: string) => {
    const id = getHashId(href);
    const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

    // route biasa (tanpa hash) => active berdasarkan pathname
    if (!id) {
      const isActive = mounted ? normalize(pathname) === normalize(href) : false;
      return [linkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
    }

    // hash => active hanya jika:
    // - di halaman "/" dan
    // - section benar-benar terlihat (inViewMap)
    const isActive = mounted && pathname === "/" && inViewMap[id] === true;

    return [linkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
  };

  const mobileLinkClass = (href: string) => {
    const id = getHashId(href);
    const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

    if (!id) {
      const isActive = mounted ? normalize(pathname) === normalize(href) : false;
      return [mobileLinkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
    }

    const isActive = mounted && pathname === "/" && inViewMap[id] === true;

    return [mobileLinkUnderlineClass, isActive ? "font-semibold text-foreground after:scale-x-100 after:origin-left" : ""].join(" ");
  };

  return (
    <motion.header ref={headerRef} className="sticky top-0 z-50 w-full py-2" initial="hidden" animate="show" variants={navContainer}>
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
              variants={navItem}
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
                <></>
                <motion.nav aria-label="Primary" className="hidden items-center gap-4 md:flex" variants={navItem}>
                  {NAV_ITEMS.map((item) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      variants={navItem}
                      className={desktopLinkClass(item.href)}
                      onClick={handleNavClick(item.href)}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </motion.nav>

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

                    {/* CTA Contact (aktif hanya jika section contact terlihat) */}
                    <a
                      href="/#contact"
                      onClick={handleNavClick("/#contact")}
                      className={[
                        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
                        mounted && pathname === "/" && inViewMap["contact"] === true
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary text-primary-foreground hover:opacity-90",
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
