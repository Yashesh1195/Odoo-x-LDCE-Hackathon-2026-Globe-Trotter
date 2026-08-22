"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { getUserProfile, type UserProfileData } from "../actions/profile";

export default function Navbar() {
  const [user, setUser] = useState<UserProfileData | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await getUserProfile();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error("Failed to load user in Navbar:", err);
      }
    }
    loadUser();
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 bg-[var(--canvas)] text-[var(--ink)] h-[64px] border-b border-[var(--hairline)]">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="font-bold text-[18px]">
          GT - Globe Trotter
        </Link>
        <div className="hidden md:flex gap-6">
<<<<<<< Updated upstream
          <Link href="/activity/search" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            Search Activity
=======
          <Link href="/dashboard" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            Dashboard
>>>>>>> Stashed changes
          </Link>
          <Link href="/trip/new" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            Plan a Trip
          </Link>
          <Link href="/trips" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            My Trips
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full bg-[var(--surface-soft)] hover:border-[var(--primary)] border border-[var(--hairline-strong)] flex items-center justify-center cursor-pointer transition-all overflow-hidden group"
          title={user ? `${user.firstName} ${user.lastName} (View Profile)` : "User Profile"}
        >
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName || "User profile"}
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-sm font-bold text-[var(--ink)]">
              {user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "GT"}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
