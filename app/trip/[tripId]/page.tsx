"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "@/app/components/TopNav";
import { getTripDetailsWithFallback } from "../../actions/trip";
import { getLocationImage } from "@/app/lib/destinationImages";

interface TripDetailData {
  id: string;
  place: string;
  name?: string;
  startDate: string;
  endDate: string;
  suggestions: { title: string; description: string }[];
  totalBudget: number;
  spent?: number;
  currency?: string;
  status?: string;
  travelers?: number;
  country?: string;
  image?: string;
  activities?: string[];
  sections: {
    id: string;
    title: string;
    description: string;
    dateRange: string;
    budget: string;
  }[];
  user?: { firstName: string; lastName: string } | null;
  isMock?: boolean;
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tripId = resolvedParams.tripId;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getTripDetailsWithFallback(tripId);
        if (res.error) {
          setError(res.error);
        } else if (res.trip) {
          setTrip(res.trip as TripDetailData);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDurationDays = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
    upcoming: { label: "Upcoming", color: "#1c69d4", bg: "rgba(28,105,212,0.15)" },
    "in-progress": { label: "In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-dark)]">
        <TopNav />
        <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
          <div className="flex flex-col items-center gap-4">
            <div
              className="animate-spin"
              style={{
                width: 40,
                height: 40,
                border: "3px solid rgba(255,255,255,0.15)",
                borderTopColor: "var(--primary)",
                borderRadius: "50%",
              }}
            />
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--on-dark-soft)" }}>
              Loading Trip Details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[var(--surface-dark)]">
        <TopNav />
        <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
          <div className="flex flex-col items-center gap-6 text-center" style={{ maxWidth: 420 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>🗺️</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--on-dark)" }}>
              Trip Not Found
            </h2>
            <p style={{ fontSize: 14, fontWeight: 300, color: "var(--on-dark-soft)", lineHeight: 1.6 }}>
              {error || "The trip you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                backgroundColor: "var(--primary)",
                color: "#fff",
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data derivation ──
  const tripName = trip.name || `${trip.place} Journey`;
  const tripCountry = trip.country || (trip.place.includes(",") ? trip.place.split(",")[1].trim() : "International");
  const tripPhoto = trip.image?.startsWith("http") ? trip.image : getLocationImage(trip.place);
  const duration = getDurationDays(trip.startDate, trip.endDate);
  const status = statusConfig[trip.status || "upcoming"] || statusConfig.upcoming;
  const budgetTotal = trip.totalBudget || 0;
  const budgetSpent = trip.spent || 0;
  const budgetPercent = budgetTotal > 0 ? Math.round((budgetSpent / budgetTotal) * 100) : 0;
  const currencySymbol = trip.currency === "USD" ? "$" : "₹";

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] text-white">
      <TopNav />

      {/* M-Stripe */}
      <div className="m-stripe">
        <div className="m-stripe-segment-1" />
        <div className="m-stripe-segment-2" />
        <div className="m-stripe-segment-3" />
      </div>

      {/* ── Hero Banner ── */}
      <section className="relative" style={{ height: 360 }}>
        <Image
          src={tripPhoto}
          alt={tripName}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(26,33,41,0.95) 0%, rgba(26,33,41,0.4) 50%, rgba(26,33,41,0.2) 100%)",
          }}
        />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-6 sm:px-12 pb-10">
          {/* Status badge */}
          <div
            className="inline-block mb-4"
            style={{
              backgroundColor: status.bg,
              border: `1px solid ${status.color}`,
              padding: "5px 14px",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: status.color, textTransform: "uppercase" }}>
              {status.label}
            </span>
          </div>

          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#fff",
              margin: "0 0 8px 0",
              letterSpacing: "-0.5px",
            }}
          >
            {tripName}
          </h1>
          <p
            style={{
              fontSize: 16,
              fontWeight: 300,
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            {trip.place}, {tripCountry} · {duration} {duration === 1 ? "Day" : "Days"}
          </p>
        </div>

        {/* Back button */}
        <Link
          href="/dashboard"
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 no-underline"
          style={{
            backgroundColor: "rgba(26,33,41,0.6)",
            backdropFilter: "blur(8px)",
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          ‹ Dashboard
        </Link>
      </section>

      {/* ── Main Content ── */}
      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12">

        {/* ── Stats Row ── */}
        <div
          className="grid gap-4 mb-12"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {/* Dates */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--on-dark-soft)", display: "block", marginBottom: 8 }}>
              Travel Dates
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {formatDate(trip.startDate)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 300, color: "var(--on-dark-soft)", margin: "0 8px" }}>→</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {formatDate(trip.endDate)}
            </span>
          </div>

          {/* Travelers */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--on-dark-soft)", display: "block", marginBottom: 8 }}>
              Travelers
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
              {trip.travelers || 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: 300, color: "var(--on-dark-soft)", marginLeft: 6 }}>
              {(trip.travelers || 1) === 1 ? "person" : "people"}
            </span>
          </div>

          {/* Budget */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--on-dark-soft)", display: "block", marginBottom: 8 }}>
              Budget
            </span>
            <div className="flex items-baseline gap-2">
              <span style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
                {currencySymbol}{budgetSpent.toLocaleString()}
              </span>
              <span style={{ fontSize: 14, fontWeight: 300, color: "var(--on-dark-soft)" }}>
                / {currencySymbol}{budgetTotal.toLocaleString()}
              </span>
            </div>
            {budgetTotal > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${budgetPercent}%`,
                      backgroundColor: budgetPercent > 90 ? "#ef4444" : budgetPercent > 70 ? "#f59e0b" : "var(--primary)",
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--on-dark-soft)", marginTop: 4, display: "block" }}>
                  {budgetPercent}% utilized
                </span>
              </div>
            )}
          </div>

          {/* Duration */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--on-dark-soft)", display: "block", marginBottom: 8 }}>
              Duration
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
              {duration}
            </span>
            <span style={{ fontSize: 13, fontWeight: 300, color: "var(--on-dark-soft)", marginLeft: 6 }}>
              {duration === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        {/* ── Activities / Highlights ── */}
        {(trip.activities && trip.activities.length > 0) || (trip.suggestions && trip.suggestions.length > 0) ? (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
                Highlights & Activities
              </h2>
              <div className="flex-1" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {(trip.activities && trip.activities.length > 0 ? trip.activities : trip.suggestions.map(s => s.title)).map((activity, i) => (
                <div
                  key={i}
                  className="group"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "16px 20px",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        backgroundColor: "var(--primary)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{activity}</span>
                  </div>
                  {trip.suggestions[i]?.description && (
                    <p style={{ fontSize: 12, fontWeight: 300, color: "var(--on-dark-soft)", margin: "8px 0 0 18px", lineHeight: 1.5 }}>
                      {trip.suggestions[i].description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Itinerary Sections (DB Trips Only) ── */}
        {trip.sections && trip.sections.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
                Itinerary Overview
              </h2>
              <div className="flex-1" style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
            </div>

            <div className="space-y-4">
              {trip.sections.map((sec, i) => {
                const secBudget = sec.budget || "—";
                return (
                  <div
                    key={sec.id}
                    className="group flex flex-col md:flex-row gap-4"
                  >
                    {/* Day Badge */}
                    <div className="w-[80px] shrink-0 pt-1">
                      <div
                        style={{
                          border: "1px solid rgba(255,255,255,0.25)",
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Day {i + 1}
                      </div>
                    </div>

                    {/* Activity */}
                    <div
                      className="flex-1"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: 20,
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    >
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 6px 0" }}>
                        {sec.title}
                      </h3>
                      <p style={{ fontSize: 13, fontWeight: 300, color: "var(--on-dark-soft)", margin: 0, lineHeight: 1.6 }}>
                        {sec.description}
                      </p>
                      {sec.dateRange && (
                        <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 8, display: "block" }}>
                          {sec.dateRange}
                        </span>
                      )}
                    </div>

                    {/* Expense */}
                    <div
                      className="w-full md:w-[100px] shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "16px 12px",
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{secBudget}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-4 mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {!trip.isMock && (
            <Link
              href={`/trip/${trip.id}/itinerary`}
              style={{
                backgroundColor: "var(--primary)",
                color: "#fff",
                padding: "14px 32px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Full Itinerary
            </Link>
          )}

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              padding: "14px 32px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ‹ Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
