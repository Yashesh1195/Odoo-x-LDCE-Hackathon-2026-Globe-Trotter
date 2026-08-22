import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 bg-[var(--canvas)] text-[var(--ink)] h-[64px] border-b border-[var(--hairline)]">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold text-[18px]">
          GT - Globe Trotter
        </Link>
        <div className="hidden md:flex gap-6">
          <Link href="/trip/new" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            Plan a Trip
          </Link>
          <Link href="/trips" className="text-[14px] font-normal tracking-[0.3px] hover:text-[var(--primary)] transition-colors">
            My Trips
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-[var(--surface-strong)] flex items-center justify-center cursor-pointer">
          {/* Avatar placeholder */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[var(--muted)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
