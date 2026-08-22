"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Trip } from "../lib/types";
import { getLocationImage } from "@/app/lib/destinationImages";

interface ProfileTripCardProps {
  trip: Trip;
  index: number;
  onView: (trip: Trip) => void;
}

export default function ProfileTripCard({ trip, index, onView }: ProfileTripCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    upcoming: {
      label: "Upcoming",
      color: "var(--primary)",
      bg: "rgba(28,105,212,0.08)",
    },
    completed: {
      label: "Completed ✓",
      color: "var(--success)",
      bg: "rgba(34,197,94,0.08)",
    },
    "in-progress": {
      label: "In Progress",
      color: "var(--warning)",
      bg: "rgba(245,158,11,0.08)",
    },
  };

  const currentStatus = statusConfig[trip.status] || statusConfig.upcoming;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={`profile-trip-${trip.id}`}
      className="bg-[var(--canvas)] flex flex-col justify-between transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1px solid ${isHovered ? "var(--ink)" : "var(--hairline)"}`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      <div>
        {/* ── Photo Plate ── */}
        <div
          className="relative w-full overflow-hidden bg-[var(--surface-card)]"
          style={{ height: 180 }}
        >
          <img
            src={trip.image?.startsWith("http") ? trip.image : getLocationImage(trip.destination || trip.name)}
            alt={trip.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />

          {/* Status Badge */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1"
            style={{
              backgroundColor: currentStatus.bg,
              border: `1px solid ${currentStatus.color}`,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: currentStatus.color,
                textTransform: "uppercase",
              }}
            >
              {currentStatus.label}
            </span>
          </div>

          {/* Travelers Count */}
          {trip.travelers && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 text-white"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>{trip.travelers}</span>
            </div>
          )}
        </div>

        {/* ── Content Details ── */}
        <div style={{ padding: "20px 20px 16px" }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--ink)",
              margin: "0 0 6px 0",
            }}
          >
            {trip.name}
          </h3>

          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: "var(--body)",
              margin: "0 0 4px 0",
            }}
          >
            {trip.destination}{trip.country ? `, ${trip.country}` : ""}
          </p>

          <p
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: "var(--muted-soft)",
              margin: "0 0 12px 0",
              letterSpacing: "0.3px",
            }}
          >
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </p>

          {/* Activities snippet */}
          {trip.activities && trip.activities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {trip.activities.slice(0, 2).map((act, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[11px] bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--hairline)]"
                >
                  {act}
                </span>
              ))}
              {trip.activities.length > 2 && (
                <span className="px-1.5 py-0.5 text-[11px] text-[var(--muted-soft)]">
                  +{trip.activities.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Action: Wireframe [ View ] Button ── */}
      <div style={{ padding: "0 20px 20px" }}>
        <button
          type="button"
          onClick={() => onView(trip)}
          className="w-full h-10 bmw-button-primary cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            border: "none",
          }}
        >
          <span>View</span>
          <span className="text-xs">›</span>
        </button>
      </div>
    </div>
  );
}
