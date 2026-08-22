"use client";

import React from "react";

interface HeroBannerProps {
  userName: string;
}

export default function HeroBanner({ userName }: HeroBannerProps) {
  return (
    <section
      id="hero-banner"
      className="relative overflow-hidden animate-fadeIn"
      style={{
        backgroundColor: "var(--surface-dark)",
        minHeight: 360,
      }}
    >
      {/* ── Background Image ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/images/hero-banner.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      />

      {/* ── Gradient Overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(26,33,41,0.85) 0%, rgba(26,33,41,0.55) 50%, rgba(26,33,41,0.3) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div
        className="relative max-w-[1440px] mx-auto flex flex-col justify-center"
        style={{
          padding: "80px 24px",
          minHeight: 360,
        }}
      >
        {/* Welcome Tag */}
        <div
          className="inline-flex items-center gap-2 mb-4 animate-slideUp"
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

        {/* Stats Row */}
        <div
          className="flex gap-8 animate-slideUp"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { value: "7", label: "TRIPS COMPLETED" },
            { value: "12", label: "COUNTRIES" },
            { value: "$6.3K", label: "TOTAL SPENT" },
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
      </div>
    </section>
  );
}
