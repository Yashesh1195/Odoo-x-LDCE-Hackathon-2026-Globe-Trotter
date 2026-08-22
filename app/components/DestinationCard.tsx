"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Destination } from "@/app/lib/types";
import { getLocationImage } from "@/app/lib/destinationImages";

interface DestinationCardProps {
  destination: Destination;
  index: number;
}

export default function DestinationCard({
  destination,
  index,
}: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const destinationPhoto = destination.image?.startsWith("http")
    ? destination.image
    : getLocationImage(destination.name);

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <span key={i} style={{ color: "#f59e0b", fontSize: 12 }}>
            ★
          </span>
        );
      } else if (i === full && hasHalf) {
        stars.push(
          <span key={i} style={{ color: "#f59e0b", fontSize: 12 }}>
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: "var(--hairline-strong)", fontSize: 12 }}>
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <article
      id={`destination-card-${destination.id}`}
      className="flex-shrink-0 animate-slideUp card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 220,
        backgroundColor: "var(--canvas)",
        border: `1px solid ${isHovered ? "var(--primary)" : "var(--hairline)"}`,
        transition: "border-color 0.2s ease",
        cursor: "pointer",
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "backwards",
      }}
    >
      {/* ── Photo Plate ── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--surface-card)",
          height: 260,
        }}
      >
        <Image
          src={destinationPhoto}
          alt={`${destination.name}, ${destination.country}`}
          fill
          className="object-cover transition-transform"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transitionDuration: "0.4s",
          }}
          sizes="220px"
        />

        {/* Budget Badge */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            padding: "8px 12px",
            background:
              "linear-gradient(transparent, rgba(26,33,41,0.85))",
          }}
        >
          <span
            style={{
              color: "var(--on-dark)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            ${destination.budgetRange.min.toLocaleString()} –{" "}
            ${destination.budgetRange.max.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ padding: 16 }}>
        {/* Title */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--ink)",
            margin: "0 0 2px 0",
          }}
        >
          {destination.name}
        </h3>

        {/* Country */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "var(--muted)",
            margin: "0 0 8px 0",
          }}
        >
          {destination.country}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {renderStars(destination.rating)}
          <span
            style={{
              fontSize: 12,
              fontWeight: 400,
              color: "var(--muted)",
              marginLeft: 4,
            }}
          >
            {destination.rating} ({destination.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {destination.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase" as const,
                color: "var(--primary)",
                backgroundColor: "rgba(28,105,212,0.08)",
                padding: "3px 8px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Learn More Link */}
        <a
          href="#"
          className="inline-flex items-center gap-1 no-underline hover:gap-2 transition-all"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase" as const,
            color: "var(--ink)",
          }}
        >
          Learn More ›
        </a>
      </div>
    </article>
  );
}
