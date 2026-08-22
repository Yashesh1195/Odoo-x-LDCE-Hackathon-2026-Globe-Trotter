"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getUserProfile, type UserProfileData } from "../actions/profile";
import { logoutUser } from "../actions/auth";

export interface TopNavUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  city?: string;
  country?: string;
  photoUrl?: string | null;
  avatar?: string;
}

interface TopNavProps {
  user?: TopNavUser | null;
}

export default function TopNav({ user: propUser }: TopNavProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<UserProfileData | null>(null);
  const [localUser, setLocalUser] = useState<TopNavUser | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname() || "";

  // Load user from localStorage and profile action
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gt_user");
      if (stored) {
        setLocalUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    async function loadUser() {
      try {
        const res = await getUserProfile();
        if (res?.success && res.user) {
          setFetchedUser(res.user);
        }
      } catch (err) {
        console.error("Failed to load user profile in TopNav:", err);
      }
    }

    if (!propUser) {
      loadUser();
    }
  }, [propUser]);

  // Close menus when route changes
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const activeUser: TopNavUser | null = propUser || fetchedUser || localUser;

  const getInitials = () => {
    if (!activeUser) return "GT";
    let f = activeUser.firstName ? activeUser.firstName.trim()[0] : "";
    let l = activeUser.lastName ? activeUser.lastName.trim()[0] : "";

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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Call server action to clear httpOnly cookies on the server
      await logoutUser();
    } catch (err) {
      console.error("Server action logout error:", err);
    }

    try {
      // 2. Call API route as fallback
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // ignore
    }

    try {
      // 3. Clear client storage
      localStorage.removeItem("gt_user");
      sessionStorage.clear();
      document.cookie = "gt_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    } catch (e) {
      console.error("Client storage clear error:", e);
    }

    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    // 4. Force full page refresh to /login to ensure clean state
    window.location.href = "/login";
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Plan a Trip", href: "/trip/new" },
    { label: "Calendar", href: "/calendar" },
    { label: "Search Activity", href: "/activity/search" },
    { label: "Community", href: "/community" },
    { label: "My Trips", href: "/trips" },
  ].map((link) => {
    const isExact = pathname === link.href;
    const isPrefix = link.href !== "/dashboard" && pathname.startsWith(link.href);
    return {
      ...link,
      active: isExact || isPrefix,
    };
  });

  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile");
  const userPhoto = activeUser?.photoUrl || activeUser?.avatar;
  const displayName = activeUser?.firstName
    ? `${activeUser.firstName} ${activeUser.lastName || ""}`.trim()
    : activeUser?.name || "GlobeTrotter Member";

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
            className="flex items-center justify-center bg-[var(--primary)] text-white shadow-sm"
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

        {/* ── Desktop Nav Links ── */}
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
                color: link.active ? "var(--ink)" : "var(--muted)",
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

        {/* ── Profile Avatar & Dropdown / Mobile Toggle ── */}
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          <button
            id="profile-avatar"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center justify-center overflow-hidden transition-all cursor-pointer rounded-full relative group border-none p-0 bg-transparent"
            style={{
              width: 38,
              height: 38,
              outline:
                isProfileActive || userMenuOpen
                  ? "2px solid var(--primary)"
                  : "2px solid var(--hairline-strong)",
              outlineOffset: "1px",
              backgroundColor: "var(--surface-soft)",
            }}
            title={displayName ? `${displayName} (Account Menu)` : "Account Menu"}
            aria-label="User profile and navigation menu"
            aria-expanded={userMenuOpen}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={displayName}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-[#1c69d4] text-white hover:bg-[#0653b6] transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                {getInitials()}
              </div>
            )}
          </button>

          {/* User Profile Dropdown Menu */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-12 w-64 bg-white border border-[var(--hairline)] shadow-xl z-50 animate-slideDown p-4"
              style={{ borderRadius: 0 }}
            >
              <div className="border-b border-[var(--hairline)] pb-3 mb-3">
                <div
                  className="truncate"
                  style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
                >
                  {displayName}
                </div>
                {activeUser?.email && (
                  <div
                    className="truncate"
                    style={{ fontSize: 12, color: "var(--muted)", fontWeight: 300 }}
                  >
                    {activeUser.email}
                  </div>
                )}
                {activeUser?.city && activeUser?.country && (
                  <div
                    className="truncate"
                    style={{
                      fontSize: 11,
                      color: "var(--primary)",
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    {activeUser.city}, {activeUser.country}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] px-2 py-2 no-underline uppercase tracking-wider transition-colors"
                >
                  <span>My Profile</span>
                  <span>›</span>
                </Link>
                <Link
                  href="/trips"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] px-2 py-2 no-underline uppercase tracking-wider transition-colors"
                >
                  <span>My Saved Trips</span>
                  <span>›</span>
                </Link>
                <Link
                  href="/trip/new"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] px-2 py-2 no-underline uppercase tracking-wider transition-colors"
                >
                  <span>Plan a New Trip</span>
                  <span>›</span>
                </Link>
                <Link
                  href="/activity/search"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] px-2 py-2 no-underline uppercase tracking-wider transition-colors"
                >
                  <span>Search Activities</span>
                  <span>›</span>
                </Link>
                <Link
                  href="/community"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-bold text-[var(--ink)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] px-2 py-2 no-underline uppercase tracking-wider transition-colors"
                >
                  <span>Community</span>
                  <span>›</span>
                </Link>
                <div className="border-t border-[var(--hairline)] my-1 pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-xs font-bold text-[#dc2626] hover:bg-red-50 hover:text-red-700 text-left px-2 py-2 uppercase tracking-wider cursor-pointer border-none bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                  >
                    <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                    {isLoggingOut && (
                      <span className="animate-spin text-xs">⟳</span>
                    )}
                  </button>
                </div>
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
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 no-underline border-b border-[var(--hairline)]"
            style={{
              fontSize: 14,
              fontWeight: isProfileActive ? 700 : 400,
              letterSpacing: "0.3px",
              color: isProfileActive ? "var(--ink)" : "var(--muted)",
            }}
          >
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left py-3 text-sm font-bold text-[#dc2626] border-none bg-transparent cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      )}
    </nav>
  );
}
