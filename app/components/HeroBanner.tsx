"use client";

import React, { useState, useEffect } from "react";

interface HeroBannerProps {
  userName: string;
  userCity?: string;
  userCountry?: string;
  stats?: {
    tripsCompleted: number;
    countriesVisited: number;
    totalSpentFormatted: string;
  };
}

const CAROUSEL_IMAGES = [
  { url: "/images/hero-banner.jpg", label: "Coastal Highway" },
  { url: "/images/dest-paris.jpg", label: "Paris, France" },
  { url: "/images/dest-tokyo.jpg", label: "Tokyo, Japan" },
  { url: "/images/dest-santorini.jpg", label: "Santorini, Greece" },
  { url: "/images/dest-bali.jpg", label: "Bali, Indonesia" },
  { url: "/images/dest-dubai.jpg", label: "Dubai, UAE" },
];

export default function HeroBanner({
  userName,
  userCity,
  userCountry,
  stats,
}: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const completedTrips = stats ? String(stats.tripsCompleted) : "7";
  const countries = stats ? String(stats.countriesVisited) : "12";
  const spent = stats ? stats.totalSpentFormatted : "$6.3K";

  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden animate-fadeIn"
      style={{
        backgroundColor: "var(--surface-dark)",
        minHeight: 360,
      }}
    >
      {/* ── Background Carousel Images ── */}
      {CAROUSEL_IMAGES.map((img, idx) => (
        <div
          key={img.url}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${img.url})`,
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            opacity: idx === currentSlide ? 1 : 0,
            zIndex: 1,
          }}
        />
      ))}

      {/* ── Gradient Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(26,33,41,0.85) 0%, rgba(26,33,41,0.55) 50%, rgba(26,33,41,0.3) 100%)",
          zIndex: 2,
        }}
      />

      {/* ── Prev / Next Side Navigation Arrows ── */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer opacity-70 hover:opacity-100"
        title="Previous Destination Slide"
        aria-label="Previous Slide"
      >
        ‹
      </button>

      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer opacity-70 hover:opacity-100"
        title="Next Destination Slide"
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* ── Content ── */}
      <div
        className="relative max-w-[1440px] mx-auto flex flex-col justify-center"
        style={{
          padding: "80px 24px",
          minHeight: 360,
          zIndex: 3,
        }}
      >
        {/* Welcome Tag & User Location */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div
            className="inline-flex items-center gap-2 animate-slideUp"
            style={{
              backgroundColor: "rgba(28,105,212,0.2)",
              border: "1px solid rgba(28,105,212,0.4)",
              padding: "6px 14px",
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "9999px",
                backgroundColor: "var(--success)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                color: "var(--on-dark)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
              }}
            >
              Welcome Back
            </span>
          </div>

          {(userCity || userCountry) && (
            <div
              className="inline-flex items-center gap-1.5 animate-slideUp"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--on-dark)",
                letterSpacing: "1px",
                textTransform: "uppercase" as const,
              }}
            >
              <span>{userCity ? `${userCity}, ` : ""}{userCountry || ""}</span>
            </div>
          )}
        </div>

        {/* Headline */}
        <h1
          className="animate-slideUp"
          style={{
            color: "var(--on-dark)",
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: 0,
            margin: "0 0 16px 0",
            animationDelay: "0.1s",
          }}
        >
          Hello, {userName}
        </h1>

        {/* Subtitle */}
        <p
          className="animate-slideUp"
          style={{
            color: "var(--on-dark-soft)",
            fontSize: 16,
            fontWeight: 300,
            lineHeight: 1.55,
            maxWidth: 480,
            margin: "0 0 32px 0",
            animationDelay: "0.2s",
          }}
        >
          Plan your next adventure, explore new destinations, and manage your
          travel budget — all in one place.
        </p>

        {/* Dynamic Stats Row */}
        <div
          className="flex gap-8 animate-slideUp"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { value: completedTrips, label: "TRIPS COMPLETED" },
            { value: countries, label: "COUNTRIES" },
            { value: spent, label: "TOTAL SPENT" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  color: "var(--on-dark)",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1.25,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "var(--on-dark-soft)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Carousel Slide Indicators (6 Dots Only) ── */}
        <div
          className="absolute bottom-6 right-6 z-10 flex items-center gap-2"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            padding: "8px 14px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {CAROUSEL_IMAGES.map((img, idx) => (
            <button
              key={img.url}
              onClick={() => setCurrentSlide(idx)}
              className="cursor-pointer transition-all duration-300 border-none p-0 focus:outline-none"
              style={{
                width: idx === currentSlide ? 24 : 8,
                height: 6,
                backgroundColor:
                  idx === currentSlide ? "var(--primary)" : "rgba(255,255,255,0.4)",
                borderRadius: 3,
              }}
              title={`Switch to slide ${idx + 1}: ${img.label}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
