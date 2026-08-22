"use client";

import React, { useState } from "react";
import type {
  TripPlanRequest,
  BudgetLevel,
  TripPace,
  Interest,
} from "@/app/lib/types";
import { INTEREST_OPTIONS } from "@/app/lib/types";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (request: TripPlanRequest) => void;
}

type Step = 1 | 2 | 3;

const BUDGET_LEVELS: { value: BudgetLevel; label: string; icon: string }[] = [
  { value: "budget", label: "Budget", icon: "$" },
  { value: "moderate", label: "Moderate", icon: "$$" },
  { value: "comfortable", label: "Comfortable", icon: "$$$" },
  { value: "luxury", label: "Luxury", icon: "$$$$" },
  { value: "ultra-luxury", label: "Ultra-Luxury", icon: "$$$$$" },
];

const PACE_OPTIONS: { value: TripPace; label: string; desc: string }[] = [
  {
    value: "relaxed",
    label: "Relaxed",
    desc: "2–3 activities per day, plenty of downtime",
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "3–5 activities, balanced schedule",
  },
  {
    value: "packed",
    label: "Packed",
    desc: "5–7 activities, maximize every moment",
  },
];

export default function TripPlannerModal({
  isOpen,
  onClose,
  onGenerate,
}: TripPlannerModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("comfortable");
  const [pace, setPace] = useState<TripPace>("moderate");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

  if (!isOpen) return null;

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const canProceedStep1 = destination.trim() && startDate && endDate;
  const canProceedStep2 = interests.length > 0;

  const handleSubmit = () => {
    onGenerate({
      destination: destination.trim(),
      startDate,
      endDate,
      travelers,
      budgetLevel,
      pace,
      interests,
      specialRequests: specialRequests.trim(),
    });
  };

  const resetAndClose = () => {
    setStep(1);
    setDestination("");
    setStartDate("");
    setEndDate("");
    setTravelers(2);
    setBudgetLevel("comfortable");
    setPace("moderate");
    setInterests([]);
    setSpecialRequests("");
    onClose();
  };

  // Shared styles
  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 8,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--canvas)",
    color: "var(--ink)",
    fontSize: 16,
    fontWeight: 300,
    lineHeight: 1.55,
    padding: "12px 16px",
    border: "1px solid var(--hairline)",
    height: 48,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{ backgroundColor: "rgba(26,33,41,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative bg-white w-full max-w-[640px] mx-4 animate-slideUp overflow-y-auto"
        style={{
          maxHeight: "90vh",
          border: "1px solid var(--hairline)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between sticky top-0 bg-white z-10"
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Plan Your Trip
            </h2>
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "var(--muted)",
                margin: "4px 0 0",
              }}
            >
              AI-powered itinerary by GlobeTrotter
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="flex items-center justify-center hover:bg-[var(--surface-soft)] transition-colors"
            style={{
              width: 36,
              height: 36,
              border: "1px solid var(--hairline)",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: 18,
              color: "var(--muted)",
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Progress Bar ── */}
        <div
          className="flex"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 flex items-center justify-center gap-2 transition-colors"
              style={{
                padding: "12px 0",
                backgroundColor:
                  s === step
                    ? "var(--canvas)"
                    : s < step
                      ? "var(--surface-soft)"
                      : "var(--canvas)",
                borderBottom:
                  s === step ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: s < step ? "pointer" : "default",
              }}
              onClick={() => {
                if (s < step) setStep(s as Step);
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: "9999px",
                  backgroundColor:
                    s <= step ? "var(--primary)" : "var(--surface-strong)",
                  color: s <= step ? "var(--on-primary)" : "var(--muted)",
                }}
              >
                {s < step ? "✓" : s}
              </span>
              <span
                className="hidden sm:inline"
                style={{
                  fontSize: 12,
                  fontWeight: s === step ? 700 : 400,
                  color: s === step ? "var(--ink)" : "var(--muted)",
                  letterSpacing: "0.3px",
                }}
              >
                {s === 1
                  ? "Where & When"
                  : s === 2
                    ? "Preferences"
                    : "Final Details"}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step Content ── */}
        <div style={{ padding: 24 }}>
          {/* ════════════ STEP 1: Where & When ════════════ */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              {/* Destination */}
              <div>
                <label style={labelStyle}>Destination</label>
                <input
                  id="trip-destination"
                  type="text"
                  placeholder="e.g. Paris, France"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="bmw-input"
                  style={inputStyle}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    id="trip-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bmw-input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    id="trip-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bmw-input"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label style={labelStyle}>Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid var(--hairline-strong)",
                      backgroundColor: "var(--canvas)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "var(--ink)",
                      minWidth: 48,
                      textAlign: "center",
                    }}
                  >
                    {travelers}
                  </span>
                  <button
                    onClick={() => setTravelers(Math.min(20, travelers + 1))}
                    style={{
                      width: 48,
                      height: 48,
                      border: "1px solid var(--hairline-strong)",
                      backgroundColor: "var(--canvas)",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--ink)",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 300,
                      color: "var(--muted)",
                    }}
                  >
                    {travelers === 1 ? "traveler" : "travelers"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 2: Preferences ════════════ */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Budget Level */}
              <div>
                <label style={labelStyle}>Budget Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {BUDGET_LEVELS.map((bl) => (
                    <button
                      key={bl.value}
                      onClick={() => setBudgetLevel(bl.value)}
                      className="flex flex-col items-center gap-1 transition-colors"
                      style={{
                        padding: "12px 4px",
                        border:
                          budgetLevel === bl.value
                            ? "2px solid var(--primary)"
                            : "1px solid var(--hairline)",
                        backgroundColor:
                          budgetLevel === bl.value
                            ? "rgba(28,105,212,0.05)"
                            : "var(--canvas)",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color:
                            budgetLevel === bl.value
                              ? "var(--primary)"
                              : "var(--ink)",
                        }}
                      >
                        {bl.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                          color:
                            budgetLevel === bl.value
                              ? "var(--primary)"
                              : "var(--muted)",
                        }}
                      >
                        {bl.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Pace */}
              <div>
                <label style={labelStyle}>Trip Pace</label>
                <div className="flex flex-col gap-2">
                  {PACE_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPace(p.value)}
                      className="flex items-center gap-3 transition-colors text-left"
                      style={{
                        padding: "14px 16px",
                        border:
                          pace === p.value
                            ? "2px solid var(--primary)"
                            : "1px solid var(--hairline)",
                        backgroundColor:
                          pace === p.value
                            ? "rgba(28,105,212,0.05)"
                            : "var(--canvas)",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "9999px",
                          border:
                            pace === p.value
                              ? "6px solid var(--primary)"
                              : "2px solid var(--hairline-strong)",
                        }}
                      />
                      <div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--ink)",
                            display: "block",
                          }}
                        >
                          {p.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 300,
                            color: "var(--muted)",
                          }}
                        >
                          {p.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label style={labelStyle}>
                  Interests{" "}
                  <span
                    style={{
                      fontWeight: 300,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (select at least 1)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className="transition-colors"
                        style={{
                          padding: "8px 14px",
                          fontSize: 12,
                          fontWeight: selected ? 700 : 400,
                          letterSpacing: "0.5px",
                          border: selected
                            ? "1px solid var(--primary)"
                            : "1px solid var(--hairline-strong)",
                          backgroundColor: selected
                            ? "var(--ink)"
                            : "var(--canvas)",
                          color: selected
                            ? "var(--on-dark)"
                            : "var(--ink)",
                          cursor: "pointer",
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ STEP 3: Final Details ════════════ */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              {/* Summary */}
              <div
                style={{
                  backgroundColor: "var(--surface-soft)",
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    margin: "0 0 12px",
                  }}
                >
                  Trip Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Destination", value: destination },
                    {
                      label: "Dates",
                      value: `${startDate} → ${endDate}`,
                    },
                    {
                      label: "Travelers",
                      value: `${travelers} ${travelers === 1 ? "person" : "people"}`,
                    },
                    {
                      label: "Budget",
                      value:
                        BUDGET_LEVELS.find((b) => b.value === budgetLevel)
                          ?.label ?? budgetLevel,
                    },
                    {
                      label: "Pace",
                      value:
                        PACE_OPTIONS.find((p) => p.value === pace)?.label ??
                        pace,
                    },
                    {
                      label: "Interests",
                      value: interests.join(", "),
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: "var(--muted-soft)",
                          display: "block",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label style={labelStyle}>
                  Special Requests{" "}
                  <span
                    style={{
                      fontWeight: 300,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  id="special-requests"
                  placeholder="Any dietary restrictions, mobility needs, must-visit spots, allergies, or other preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="bmw-input"
                  style={{
                    ...inputStyle,
                    height: 120,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div
          className="flex items-center justify-between sticky bottom-0 bg-white"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <button
            onClick={() => {
              if (step > 1) setStep((step - 1) as Step);
              else resetAndClose();
            }}
            style={{
              padding: "13px 24px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
              border: "1px solid var(--hairline-strong)",
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
              className="bmw-button-primary"
              style={{
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                cursor:
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                    ? 0.5
                    : 1,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bmw-button-primary flex items-center gap-2"
              style={{
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg
                style={{ width: 16, height: 16 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Generate My Trip Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
