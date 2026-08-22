"use client";

import React, { useEffect } from "react";
import type { DbTrip } from "@/app/components/TripOverviewCard";

interface TripDetailModalProps {
  trip: DbTrip | null;
  computedStatus: "ongoing" | "upcoming" | "completed";
  onClose: () => void;
}

export default function TripDetailModal({
  trip,
  computedStatus,
  onClose,
}: TripDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (trip) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [trip]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!trip) return null;

  const statusConfig = {
    ongoing: {
      label: "Ongoing",
      color: "var(--warning)",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.3)",
    },
    upcoming: {
      label: "Upcoming",
      color: "var(--primary)",
      bg: "rgba(28,105,212,0.08)",
      border: "rgba(28,105,212,0.3)",
    },
    completed: {
      label: "Completed",
      color: "var(--success)",
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.3)",
    },
  };

  const status = statusConfig[computedStatus];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  // Trip progress for ongoing trips
  const daysIntoTrip = () => {
    if (computedStatus !== "ongoing") return null;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const today = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const tripProgress = daysIntoTrip();

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 animate-fadeIn"
        style={{ backgroundColor: "rgba(26, 33, 41, 0.5)" }}
        onClick={onClose}
      />

      {/* ── Slide-in Panel ── */}
      <div
        id="trip-detail-modal"
        className="fixed top-0 right-0 z-50 h-full slide-in-right"
        style={{
          width: "min(520px, 90vw)",
          backgroundColor: "var(--canvas)",
          borderLeft: "1px solid var(--hairline)",
          overflowY: "auto",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            backgroundColor: "var(--surface-dark)",
            padding: "32px 32px 28px",
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            id="trip-detail-close"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--on-dark)",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 300,
              transition: "background-color 0.15s ease",
            }}
            aria-label="Close trip details"
          >
            ✕
          </button>

          {/* Status Badge */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: status.bg,
              border: `1px solid ${status.border}`,
              padding: "4px 12px",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase" as const,
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>

          {/* Trip Place */}
          <h2
            style={{
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "var(--on-dark)",
              margin: "0 0 6px 0",
            }}
          >
            {trip.place}
          </h2>

          {/* Created date */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 300,
              color: "var(--on-dark-soft)",
              margin: 0,
            }}
          >
            Created{" "}
            {new Date(trip.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "28px 32px 40px" }}>
          {/* ── Trip Progress (Ongoing only) ── */}
          {computedStatus === "ongoing" && tripProgress !== null && (
            <div style={{ marginBottom: 28 }}>
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase" as const,
                    color: "var(--ink)",
                  }}
                >
                  Trip Progress
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--warning)",
                  }}
                >
                  {tripProgress}%
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: "var(--surface-strong)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${tripProgress}%`,
                    backgroundColor: "var(--warning)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Dates Section ── */}
          <div style={{ marginBottom: 28 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase" as const,
                color: "var(--muted)",
                margin: "0 0 12px 0",
              }}
            >
              Travel Dates
            </h3>
            <div
              className="flex gap-4"
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--surface-soft)",
                border: "1px solid var(--hairline)",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--muted-soft)",
                    margin: "0 0 4px 0",
                    letterSpacing: "0.5px",
                  }}
                >
                  Start
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {formatDate(trip.startDate)}
                </p>
              </div>
              <div
                style={{
                  width: 1,
                  backgroundColor: "var(--hairline)",
                  alignSelf: "stretch",
                }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--muted-soft)",
                    margin: "0 0 4px 0",
                    letterSpacing: "0.5px",
                  }}
                >
                  End
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {formatDate(trip.endDate)}
                </p>
              </div>
              <div
                style={{
                  width: 1,
                  backgroundColor: "var(--hairline)",
                  alignSelf: "stretch",
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--muted-soft)",
                    margin: "0 0 4px 0",
                    letterSpacing: "0.5px",
                  }}
                >
                  Duration
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  {getDuration()}
                </p>
              </div>
            </div>
          </div>

          {/* ── Budget Section (from itinerary sections) ── */}
          {trip.totalBudget > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Estimated Budget
              </h3>
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--surface-soft)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <div className="flex items-baseline gap-2">
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    ₹{trip.totalBudget.toLocaleString()}
                  </p>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 300,
                      color: "var(--muted)",
                    }}
                  >
                    total estimated
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: "var(--muted-soft)",
                    margin: "8px 0 0 0",
                  }}
                >
                  Aggregated from {trip.sectionCount} itinerary section
                  {trip.sectionCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* ── Itinerary Sections Summary ── */}
          {trip.sectionCount > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Itinerary
              </h3>
              <div
                className="flex items-center gap-3"
                style={{
                  padding: "16px 20px",
                  backgroundColor: "var(--surface-soft)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <svg
                  style={{ width: 20, height: 20, color: "var(--primary)", flexShrink: 0 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    {trip.sectionCount} section{trip.sectionCount !== 1 ? "s" : ""} planned
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 300,
                      color: "var(--muted)",
                      margin: "2px 0 0 0",
                    }}
                  >
                    View the full itinerary for detailed day-wise plans
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Suggestions ── */}
          {trip.suggestions.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  color: "var(--muted)",
                  margin: "0 0 12px 0",
                }}
              >
                Suggested Activities
              </h3>
              <div className="flex flex-col gap-2">
                {trip.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "var(--surface-soft)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        margin: "0 0 2px 0",
                      }}
                    >
                      {suggestion.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: "var(--muted)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="flex gap-3">
            <a
              href={`/trip/${trip.id}/itinerary`}
              className="flex-1 flex items-center justify-center gap-2 no-underline bmw-button-primary"
              style={{
                padding: "14px 32px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textAlign: "center",
                height: 48,
              }}
            >
              <svg
                style={{ width: 16, height: 16 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              View Itinerary
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center"
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                backgroundColor: "var(--canvas)",
                color: "var(--ink)",
                border: "1px solid var(--hairline-strong)",
                cursor: "pointer",
                height: 48,
                transition: "border-color 0.15s ease",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
