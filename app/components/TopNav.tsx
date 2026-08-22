"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
<<<<<<< Updated upstream
import { useRouter, usePathname } from "next/navigation";
=======
import { usePathname } from "next/navigation";
import { getUserProfile, type UserProfileData } from "../actions/profile";
>>>>>>> Stashed changes

interface TopNavProps {
  user?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    city?: string;
    country?: string;
  } | null;
}

export default function TopNav({ user: propUser }: TopNavProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
<<<<<<< Updated upstream
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<{
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    city?: string;
    country?: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("gt_user");
      if (stored) {
        setLocalUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const activeUser = propUser || localUser;

  const getInitials = () => {
    if (!activeUser) return "GT";
    let f = activeUser.firstName ? activeUser.firstName.trim()[0] : "";
    let l = activeUser.lastName ? activeUser.lastName.trim()[0] : "";

    // If last name initial is missing, try splitting name or full name
    if (!l && activeUser.name) {
      const parts = activeUser.name.trim().split(/\s+/);
      if (parts.length > 1) {
        l = parts[parts.length - 1][0] || "";
      }
      if (!f && parts.length > 0) {
        f = parts[0][0] || "";
      }
    }

    const initials = (f + l).toUpperCase();
    return initials || "GT";
  };

  const handleLogout = () => {
    localStorage.removeItem("gt_user");
    document.cookie = "gt_user_id=; path=/; max-age=0";
    document.cookie = "auth_token=; path=/; max-age=0";
    router.push("/login");
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Search Activity", href: "/activity/search" },
    { label: "My Trips", href: "/trips" },
  ].map((link) => {
    const isExact = pathname === link.href;
    const isPrefix = link.href !== "/dashboard" && pathname.startsWith(link.href);
    return {
      ...link,
      active: isExact || isPrefix,
    };
  });
=======
  const [user, setUser] = useState<UserProfileData | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await getUserProfile();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error("Failed to load user in TopNav:", err);
      }
    }
    loadUser();
  }, []);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", active: pathname === "/dashboard" },
    { label: "My Trips", href: "/trips", active: pathname === "/trips" },
    { label: "Plan a Trip", href: "/trip/new", active: pathname === "/trip/new" },
  ];
>>>>>>> Stashed changes

  const isProfileActive = pathname === "/profile";

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

        {/* ── Desktop Nav (No separate Profile link) ── */}
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

<<<<<<< Updated upstream
        {/* ── Profile Avatar & Dropdown ── */}
        <div className="flex items-center gap-3 relative">
          <button
            id="profile-avatar"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-center bg-[#1c69d4] text-white border border-[var(--primary)] cursor-pointer hover:bg-[#0653b6] transition-colors shadow-sm"
            style={{
              width: 38,
              height: 38,
              borderRadius: "9999px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
=======
        {/* ── Profile Avatar in Top-Right with User Photo ── */}
        <div className="flex items-center gap-3">
          <Link
            id="profile-avatar"
            href="/profile"
            className="flex items-center justify-center overflow-hidden transition-all no-underline relative group cursor-pointer"
            style={{
              width: 40,
              height: 40,
              borderRadius: "9999px",
              border: isProfileActive
                ? "2px solid var(--primary)"
                : "2px solid var(--hairline-strong)",
              backgroundColor: "var(--surface-soft)",
              boxShadow: isProfileActive ? "0 0 0 2px rgba(28,105,212,0.25)" : "none",
>>>>>>> Stashed changes
            }}
            title={user ? `${user.firstName} ${user.lastName} (View Profile)` : "View Profile"}
            aria-label="User profile"
            title={
              activeUser
                ? `${activeUser.firstName || ""} ${activeUser.lastName || activeUser.name || ""}`.trim()
                : "User Profile"
            }
          >
<<<<<<< Updated upstream
            {getInitials()}
          </button>
=======
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName || "User profile"}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
              />
            ) : (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isProfileActive ? "var(--primary)" : "var(--ink)",
                }}
              >
                {user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "GT"}
              </span>
            )}
          </Link>
>>>>>>> Stashed changes

          {/* User Profile Dropdown Menu */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-12 w-64 bg-white border border-[var(--hairline)] shadow-xl z-50 animate-slideDown p-4"
              style={{ borderRadius: 0 }}
            >
              <div className="border-b border-[var(--hairline)] pb-3 mb-3">
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
                  {activeUser?.firstName
                    ? `${activeUser.firstName} ${activeUser.lastName || ""}`
                    : activeUser?.name || "Member Profile"}
                </div>
                {activeUser?.email && (
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}>
                    {activeUser.email}
                  </div>
                )}
                {activeUser?.city && activeUser?.country && (
                  <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>
                    📍 {activeUser.city}, {activeUser.country}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/trips"
                  onClick={() => setUserMenuOpen(false)}
                  className="text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] py-1 no-underline uppercase tracking-wider"
                >
                  My Saved Trips ›
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-[#dc2626] hover:underline text-left py-1 uppercase tracking-wider cursor-pointer border-none bg-transparent"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

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
