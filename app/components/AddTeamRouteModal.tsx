"use client";

import React, { useState } from "react";
import type { Trip, TripStatus } from "@/app/lib/types";

interface AddTeamRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripAdded: (newTrip: Trip) => void;
}

// ── Sample Team Member Routes for 1-Click Import ────────────────────

const SAMPLE_TEAM_ROUTES = [
  {
    id: "route-alex-swiss",
    code: "GT-SWISS-2026",
    name: "Alex's Alpine Grand Circuit",
    destination: "Zermatt & Lucerne",
    country: "Switzerland",
    author: "Alex Chen (Senior Planner)",
    image: "/images/trip-switzerland.jpg",
    startDate: "2026-07-12",
    endDate: "2026-07-19",
    status: "upcoming" as TripStatus,
    budgetTotal: 3400,
    budgetSpent: 420,
    travelers: 2,
    activities: [
      "Gornergrat Railway",
      "Matterhorn Glacier Trail",
      "Lake Lucerne Steamer Cruise",
      "Traditional Fondue Night",
    ],
  },
  {
    id: "route-sarah-tokyo",
    code: "GT-TOKYO-TEAM",
    name: "Sarah's Tokyo Food & Temple Route",
    destination: "Tokyo & Kyoto",
    country: "Japan",
    author: "Sarah Jenkins (Lead Guide)",
    image: "/images/dest-tokyo.jpg",
    startDate: "2026-10-10",
    endDate: "2026-10-18",
    status: "upcoming" as TripStatus,
    budgetTotal: 2900,
    budgetSpent: 650,
    travelers: 2,
    activities: [
      "Tsukiji Outer Market Tasting",
      "Fushimi Inari Sunset Hike",
      "Akihabara Tech Exploration",
      "Gion Geisha District Walk",
    ],
  },
  {
    id: "route-david-santorini",
    code: "GT-SANTORINI-SUNSET",
    name: "David's Aegean Sunset Odyssey",
    destination: "Santorini & Mykonos",
    country: "Greece",
    author: "David Miller (Team Lead)",
    image: "/images/dest-santorini.jpg",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    status: "upcoming" as TripStatus,
    budgetTotal: 3100,
    budgetSpent: 1200,
    travelers: 3,
    activities: [
      "Oia Sunset & Winery Tour",
      "Caldera Catamaran Cruise",
      "Red Beach Cliff Walk",
      "Akrotiri Prehistoric Site",
    ],
  },
];

export default function AddTeamRouteModal({
  isOpen,
  onClose,
  onTripAdded,
}: AddTeamRouteModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "custom">("import");

  // Import code state
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState("");

  // Custom route state
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("2500");
  const [travelers, setTravelers] = useState(2);
  const [activitiesInput, setActivitiesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle importing a route by code or clicking a sample route
  const handleImportSample = (sample: (typeof SAMPLE_TEAM_ROUTES)[0]) => {
    const newTrip: Trip = {
      id: `trip-team-${Date.now()}`,
      name: sample.name,
      destination: sample.destination,
      country: sample.country,
      image: sample.image,
      startDate: sample.startDate,
      endDate: sample.endDate,
      status: sample.status,
      budget: {
        total: sample.budgetTotal,
        spent: sample.budgetSpent,
        currency: "USD",
      },
      travelers: sample.travelers,
      activities: sample.activities,
    };
    onTripAdded(newTrip);
    onClose();
  };

  const handleImportByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    const cleanedCode = importCode.trim().toUpperCase();
    const found = SAMPLE_TEAM_ROUTES.find(
      (r) => r.code.toUpperCase() === cleanedCode
    );

    if (found) {
      handleImportSample(found);
    } else if (cleanedCode) {
      // Create a generic route from the import code
      const newTrip: Trip = {
        id: `trip-imported-${Date.now()}`,
        name: `Shared Route (${cleanedCode})`,
        destination: "Team Selected Destination",
        country: "International",
        image: "/images/hero-banner.jpg",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 86400000)
          .toISOString()
          .split("T")[0],
        status: "upcoming",
        budget: { total: 3000, spent: 0, currency: "USD" },
        travelers: 2,
        activities: ["Team Itinerary Activity 1", "Team Itinerary Activity 2"],
      };
      onTripAdded(newTrip);
      onClose();
    } else {
      setImportError("Please enter a valid route code (e.g. GT-SWISS-2026).");
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !startDate || !endDate) return;

    setIsSubmitting(true);
    const parsedActivities = activitiesInput
      ? activitiesInput.split(",").map((a) => a.trim()).filter(Boolean)
      : ["Sightseeing", "Local Dining", "City Walking Tour"];

    const newTrip: Trip = {
      id: `trip-custom-${Date.now()}`,
      name: name.trim(),
      destination: destination.trim(),
      country: country.trim() || "Global",
      image: "/images/dest-paris.jpg",
      startDate,
      endDate,
      status: "upcoming",
      budget: {
        total: parseFloat(budgetTotal) || 2000,
        spent: 0,
        currency: "USD",
      },
      travelers,
      activities: parsedActivities,
    };

    try {
      // Call API endpoint
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrip),
      });
    } catch (err) {
      console.warn("Using offline mode for custom trip", err);
    } finally {
      onTripAdded(newTrip);
      setIsSubmitting(false);
      onClose();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--canvas)",
    color: "var(--ink)",
    fontSize: 14,
    fontWeight: 300,
    padding: "10px 14px",
    border: "1px solid var(--hairline)",
    height: 44,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
      style={{
        backgroundColor: "rgba(26,33,41,0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative bg-white w-full max-w-[620px] mx-4 animate-slideUp overflow-hidden"
        style={{
          maxHeight: "90vh",
          border: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--hairline)",
            backgroundColor: "var(--surface-dark)",
            color: "var(--on-dark)",
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Team Collaboration
              </span>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--on-dark)",
                  margin: 0,
                }}
              >
                Plan a Trip / Add Route
              </h2>
            </div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 300,
                color: "var(--on-dark-soft)",
                margin: "4px 0 0",
              }}
            >
              Import a route created by a team member or construct a custom itinerary
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "transparent",
              color: "var(--on-dark)",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div
          className="flex"
          style={{ borderBottom: "1px solid var(--hairline)" }}
        >
          <button
            onClick={() => setActiveTab("import")}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              backgroundColor:
                activeTab === "import" ? "var(--canvas)" : "var(--surface-soft)",
              color: activeTab === "import" ? "var(--primary)" : "var(--muted)",
              border: "none",
              borderBottom:
                activeTab === "import" ? "2px solid var(--primary)" : "none",
              cursor: "pointer",
            }}
          >
            Team Member Routes
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              backgroundColor:
                activeTab === "custom" ? "var(--canvas)" : "var(--surface-soft)",
              color: activeTab === "custom" ? "var(--primary)" : "var(--muted)",
              border: "none",
              borderBottom:
                activeTab === "custom" ? "2px solid var(--primary)" : "none",
              cursor: "pointer",
            }}
          >
            Custom Route
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {activeTab === "import" ? (
            <div className="flex flex-col gap-6">
              {/* Import Code Input */}
              <form onSubmit={handleImportByCode} className="flex flex-col gap-2">
                <label style={labelStyle}>Import by Route Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code e.g. GT-SWISS-2026"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    className="bmw-button-primary"
                    style={{
                      padding: "0 20px",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Import Route
                  </button>
                </div>
                {importError && (
                  <span style={{ fontSize: 12, color: "var(--error)" }}>
                    {importError}
                  </span>
                )}
              </form>

              {/* Shared Team Routes Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span style={labelStyle}>Shared Routes by Colleagues</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      fontWeight: 300,
                    }}
                  >
                    Click to add to your trips
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {SAMPLE_TEAM_ROUTES.map((route) => (
                    <div
                      key={route.id}
                      onClick={() => handleImportSample(route)}
                      className="p-4 border border-[var(--hairline)] hover:border-[var(--primary)] transition-all cursor-pointer bg-[var(--surface-card)] hover:bg-white"
                      style={{ borderRadius: 0 }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: "var(--ink)",
                          }}
                        >
                          {route.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--primary)",
                            backgroundColor: "rgba(28,105,212,0.1)",
                            padding: "2px 8px",
                          }}
                        >
                          {route.code}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 300,
                          color: "var(--muted)",
                          margin: "2px 0 6px",
                        }}
                      >
                        {route.destination}, {route.country} • Shared by{" "}
                        <strong style={{ fontWeight: 700 }}>{route.author}</strong>
                      </p>

                      <div className="flex items-center justify-between text-xs text-[var(--muted-soft)]">
                        <span>
                          {route.startDate} to {route.endDate}
                        </span>
                        <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                          Budget: ${route.budgetTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Route Form */
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Trip Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Mediterranean Exploration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Destination City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Japan"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Total Budget ($)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Key Activities (comma separated)</label>
                <input
                  type="text"
                  placeholder="Temple tour, Ramen tasting, Onsen bath"
                  value={activitiesInput}
                  onChange={(e) => setActivitiesInput(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bmw-button-primary mt-2"
                style={{
                  padding: "12px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? "Adding Trip..." : "Save Route to My Trips"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
