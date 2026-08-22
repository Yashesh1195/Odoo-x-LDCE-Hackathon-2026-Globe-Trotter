"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getLocationImage } from "@/app/lib/destinationImages";

// DB-sourced trip shape
export interface DbTrip {
  id: string;
  place: string;
  startDate: string;
  endDate: string;
  suggestions: { title: string; description: string }[];
  totalBudget: number;
  sectionCount: number;
  createdAt: string;
}

interface TripOverviewCardProps {
  trip: DbTrip;
  index: number;
  computedStatus: "ongoing" | "upcoming" | "completed";
  onClick: () => void;
}

export default function TripOverviewCard({
  trip,
  index,
  computedStatus,
  onClick,
}: TripOverviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const tripPhoto = getLocationImage(trip.place);

  const statusConfig = {
    ongoing: {
      label: "Ongoing",
      color: "var(--warning)",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.3)",
      icon: "●",
    },
    upcoming: {
      label: "Upcoming",
      color: "var(--primary)",
      bg: "rgba(28,105,212,0.08)",
      border: "rgba(28,105,212,0.3)",
      icon: "◆",
    },
    completed: {
      label: "Completed",
      color: "var(--success)",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.3)",
      icon: "✓",
    },
  };

  const status = statusConfig[computedStatus];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : "1 day";
  };

  return (
    <article
      id={`trip-card-${trip.id}`}
      className="card-hover overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "var(--canvas)",
        border: `1px solid ${isHovered ? "var(--primary)" : "var(--hairline)"}`,
        cursor: "pointer",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${index * 0.06}s`,
        animationFillMode: "backwards",
        padding: 0,
      }}
    >
      <div className="flex flex-col sm:flex-row" style={{ minHeight: 0 }}>
        {/* ── Photo Plate ── */}
        <div
          className="relative w-full sm:w-[180px] h-[140px] sm:h-auto flex-shrink-0 overflow-hidden bg-[var(--surface-card)]"
        >
          <Image
            src={tripPhoto}
            alt={trip.place}
            fill
            className="object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
            sizes="(max-width: 640px) 100vw, 180px"
          />
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          {/* Top row: Place name + Status badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                {trip.place}
              </h3>
            </div>
            <div
              style={{
                backgroundColor: status.bg,
                border: `1px solid ${status.border}`,
                padding: "3px 10px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: status.color,
                }}
              >
                {status.icon} {status.label}
              </span>
            </div>
          </div>

          {/* Date + Duration */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <svg
                style={{ width: 13, height: 13, color: "var(--muted-soft)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: "var(--muted-soft)",
                  letterSpacing: "0.3px",
                }}
              >
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "var(--muted-soft)",
              }}
            >
              · {getDuration()}
            </span>
          </div>

          {/* Bottom row: Budget + Sections + Suggestions count */}
          <div className="flex items-center gap-4">
            {/* Budget from itinerary sections */}
            {trip.totalBudget > 0 && (
              <div className="flex items-center gap-1.5">
                <svg
                  style={{ width: 13, height: 13, color: "var(--muted-soft)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  ₹{trip.totalBudget.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 300,
                    color: "var(--muted-soft)",
                  }}
                >
                  est. budget
                </span>
              </div>
            )}

            {/* Itinerary sections count */}
            {trip.sectionCount > 0 && (
              <div className="flex items-center gap-1.5">
                <svg
                  style={{ width: 13, height: 13, color: "var(--muted-soft)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {trip.sectionCount} section{trip.sectionCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Suggestions count */}
            {trip.suggestions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <svg
                  style={{ width: 13, height: 13, color: "var(--muted-soft)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--muted)",
                  }}
                >
                  {trip.suggestions.length} suggestion{trip.suggestions.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* View arrow */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
                color: isHovered ? "var(--primary)" : "var(--ink)",
                transition: "color 0.2s ease",
                marginLeft: "auto",
              }}
            >
              VIEW ›
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
