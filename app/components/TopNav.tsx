"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "";

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Search Activity", href: "/activity/search" },
    { label: "My Trips", href: "/trips" },
    { label: "Destinations", href: "/dashboard#destinations" },
    { label: "Budget", href: "/dashboard#budget" },
  ].map(link => ({
    ...link,
    active: link.href === "/dashboard" 
      ? pathname === "/dashboard" 
      : pathname.startsWith(link.href.split("#")[0])
  }));

  return (
    <nav
      id="top-nav"
      className="sticky top-0 z-50 bg-white border-b border-[var(--hairline)]"
      style={{ height: 64 }}
    >
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-10">
        {/* ── Brand ── */}
        <Link href="/dashboard" className="flex items-center gap-2 no-underline">
          <div
            className="flex items-center justify-center bg-[var(--primary)] text-white"
            style={{
              width: 36,
              height: 36,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.5px",
            }}
          >
            GT
          </div>
          <span
            className="text-[var(--ink)] hidden sm:block"
            style={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 0,
            }}
          >
            GlobeTrotter
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative px-4 py-2 no-underline transition-colors"
              style={{
                fontSize: 14,
                fontWeight: link.active ? 700 : 400,
                letterSpacing: "0.3px",
                color: link.active
                  ? "var(--ink)"
                  : "var(--muted)",
              }}
            >
              {link.label}
              {link.active && (
                <span
                  className="absolute bottom-0 left-4 right-4"
                  style={{
                    height: 2,
                    backgroundColor: "var(--primary)",
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* ── Profile Avatar ── */}
        <div className="flex items-center gap-3">
          <button
            id="profile-avatar"
            className="flex items-center justify-center bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--hairline)] cursor-pointer hover:border-[var(--primary)] transition-colors"
            style={{
              width: 36,
              height: 36,
              borderRadius: "9999px",
              fontSize: 14,
              fontWeight: 700,
            }}
            aria-label="User profile"
          >
            YM
          </button>

          {/* ── Hamburger (Mobile) ── */}
          <button
            id="mobile-menu-toggle"
            className="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className="block bg-[var(--ink)] transition-transform"
              style={{
                width: 20,
                height: 2,
                transform: mobileMenuOpen
                  ? "translateY(7px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              className="block bg-[var(--ink)] transition-opacity"
              style={{
                width: 20,
                height: 2,
                opacity: mobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              className="block bg-[var(--ink)] transition-transform"
              style={{
                width: 20,
                height: 2,
                transform: mobileMenuOpen
                  ? "translateY(-7px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden bg-white border-b border-[var(--hairline)] animate-slideDown"
          style={{ padding: "16px 24px" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 no-underline border-b border-[var(--hairline)]"
              style={{
                fontSize: 14,
                fontWeight: link.active ? 700 : 400,
                letterSpacing: "0.3px",
                color: link.active ? "var(--ink)" : "var(--muted)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
