"use client";

import React from "react";
import ProfileTripCard from "./ProfileTripCard";
import type { Trip } from "../lib/types";
import Link from "next/link";

interface ProfileTripGridProps {
  id: string;
  title: string;
  subtitle?: string;
  trips: Trip[];
  badgeColor?: string;
  onViewTrip: (trip: Trip) => void;
}

export default function ProfileTripGrid({
  id,
  title,
  subtitle,
  trips,
  badgeColor = "var(--primary)",
  onViewTrip,
}: ProfileTripGridProps) {
  return (
    <section
      id={id}
      className="w-full max-w-[1440px] mx-auto"
      style={{ padding: "40px 24px" }}
    >
      {/* ── Section Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-baseline gap-3">
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.25,
              color: "var(--ink)",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: badgeColor,
              backgroundColor: `${badgeColor}15`,
              padding: "2px 10px",
              letterSpacing: "0.5px",
            }}
          >
            {trips.length}
          </span>
        </div>

        {/* Decorative Hairline */}
        <div
          className="flex-1"
          style={{
            height: 1,
            backgroundColor: "var(--hairline)",
          }}
        />
      </div>

      {subtitle && (
        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: "var(--muted)",
            margin: "-16px 0 24px 0",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* ── Grid of Trip Cards (Wireframe 3-up Layout) ── */}
      {trips.length > 0 ? (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {trips.map((trip, idx) => (
            <ProfileTripCard
              key={trip.id || idx}
              trip={trip}
              index={idx}
              onView={onViewTrip}
            />
          ))}
        </div>
      ) : (
        <div
          className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-[var(--surface-soft)] border border-[var(--hairline)]"
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: "var(--muted)",
              margin: "0 0 16px 0",
            }}
          >
            No trips currently found in this category.
          </p>
          <Link
            href="/trip/new"
            className="bmw-button-primary no-underline inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Plan a Trip Now ›
          </Link>
        </div>
      )}
    </section>
  );
}
