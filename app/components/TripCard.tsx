"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Trip } from "@/app/lib/types";
import { getLocationImage } from "@/app/lib/destinationImages";

interface TripCardProps {
  trip: Trip;
  index: number;
}

export default function TripCard({ trip, index }: TripCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const tripPhoto = trip.image?.startsWith("http") ? trip.image : getLocationImage(trip.destination || trip.name);

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    completed: {
      label: "Completed",
      color: "var(--success)",
      bg: "rgba(34,197,94,0.1)",
    },
    upcoming: {
      label: "Upcoming",
      color: "var(--primary)",
      bg: "rgba(28,105,212,0.1)",
    },
    "in-progress": {
      label: "In Progress",
      color: "var(--warning)",
      bg: "rgba(245,158,11,0.1)",
    },
  };

  const status = statusConfig[trip.status] ?? statusConfig.upcoming;
  const budgetPercent = Math.round((trip.budget.spent / trip.budget.total) * 100);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article
      id={`trip-card-${trip.id}`}
      className="animate-slideUp card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/trip/${trip.id}`)}
      style={{
        backgroundColor: "var(--canvas)",
        border: `1px solid ${isHovered ? "var(--primary)" : "var(--hairline)"}`,
        transition: "border-color 0.2s ease",
        cursor: "pointer",
        animationDelay: `${index * 0.1}s`,
        animationFillMode: "backwards",
      }}
    >
      {/* ── Photo ── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--surface-card)",
          height: 200,
        }}
      >
        <Image
          src={tripPhoto}
          alt={trip.name}
          fill
          className="object-cover transition-transform"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transitionDuration: "0.4s",
          }}
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Status Badge */}
        <div
          className="absolute top-3 left-3"
          style={{
            backgroundColor: status.bg,
            border: `1px solid ${status.color}`,
            padding: "4px 10px",
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
            {status.label}
          </span>
        </div>

        {/* Travelers Badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1"
          style={{
            backgroundColor: "rgba(26,33,41,0.7)",
            padding: "4px 8px",
          }}
        >
          <svg
            style={{ width: 12, height: 12, color: "var(--on-dark)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--on-dark)",
            }}
          >
            {trip.travelers}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: 20 }}>
        {/* Title */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--ink)",
            margin: "0 0 4px 0",
          }}
        >
          {trip.name}
        </h3>

        {/* Destination + Dates */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: "var(--muted)",
            margin: "0 0 4px 0",
          }}
        >
          {trip.destination}, {trip.country}
        </p>
        <p
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: "var(--muted-soft)",
            margin: "0 0 16px 0",
            letterSpacing: "0.5px",
          }}
        >
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
        </p>

        {/* Budget Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-baseline mb-1">
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
                color: "var(--muted)",
              }}
            >
              Budget
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              ₹{trip.budget.spent.toLocaleString()}{" "}
              <span
                style={{
                  fontWeight: 300,
                  color: "var(--muted)",
                }}
              >
                / ₹{trip.budget.total.toLocaleString()}
              </span>
            </span>
          </div>
          <div
            style={{
              height: 4,
              backgroundColor: "var(--surface-strong)",
              overflow: "hidden",
            }}
          >
            <div
              className="transition-all"
              style={{
                height: "100%",
                width: `${budgetPercent}%`,
                backgroundColor:
                  budgetPercent > 90
                    ? "var(--error)"
                    : budgetPercent > 70
                      ? "var(--warning)"
                      : "var(--primary)",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* View Details Link */}
        <Link
          href={`/trip/${trip.id}/itinerary`}
          className="inline-flex items-center gap-1 no-underline hover:gap-2 transition-all"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "var(--ink)",
          }}
        >
          View Details ›
        </Link>
      </div>
    </article>
  );
}
