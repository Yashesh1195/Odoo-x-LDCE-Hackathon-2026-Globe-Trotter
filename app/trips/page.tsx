"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import TopNav from "@/app/components/TopNav";
import TripOverviewCard from "@/app/components/TripOverviewCard";
import TripDetailModal from "@/app/components/TripDetailModal";
import type { DbTrip } from "@/app/components/TripOverviewCard";

type TripCategory = "ongoing" | "upcoming" | "completed";
type DropdownType = "sort" | "group" | "filter" | null;
type SortField = "name" | "date";

interface CategorizedTrips {
  ongoing: DbTrip[];
  upcoming: DbTrip[];
  completed: DbTrip[];
}

function categorizeTrips(trips: DbTrip[]): CategorizedTrips {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ongoing: DbTrip[] = [];
  const upcoming: DbTrip[] = [];
  const completed: DbTrip[] = [];

  for (const trip of trips) {
    const start = new Date(trip.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(trip.endDate);
    end.setHours(0, 0, 0, 0);

    if (start <= today && end >= today) {
      ongoing.push(trip);
    } else if (start > today) {
      upcoming.push(trip);
    } else {
      completed.push(trip);
    }
  }

  return { ongoing, upcoming, completed };
}

export default function TripsListingPage() {
  const [trips, setTrips] = useState<DbTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [selectedTrip, setSelectedTrip] = useState<DbTrip | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TripCategory>("ongoing");
  const [collapsedSections, setCollapsedSections] = useState<Record<TripCategory, boolean>>({
    ongoing: false,
    upcoming: false,
    completed: false,
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (sortField) params.set("sort", sortField);

      const res = await fetch(`/api/my-trips?${params.toString()}`);
      const json = await res.json();
      setTrips(json.trips);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortField]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const categorized = categorizeTrips(trips);

  const toggleSection = (section: TripCategory) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTripClick = (trip: DbTrip, category: TripCategory) => {
    setSelectedTrip(trip);
    setSelectedCategory(category);
  };

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date" },
  ];

  const buttonBaseStyle: React.CSSProperties = {
    backgroundColor: "var(--canvas)",
    color: "var(--ink)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.5px",
    padding: "10px 18px",
    border: "1px solid var(--hairline-strong)",
    cursor: "pointer",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap" as const,
  };

  const sectionHeaderStyle = (
    category: TripCategory,
    count: number
  ): React.CSSProperties => {
    const colors = {
      ongoing: "var(--warning)",
      upcoming: "var(--primary)",
      completed: "var(--success)",
    };
    return {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 0",
      cursor: count > 0 ? "pointer" : "default",
      userSelect: "none" as const,
      borderBottom: `2px solid ${colors[category]}`,
      marginBottom: 16,
    };
  };

  const renderSection = (
    category: TripCategory,
    label: string,
    sectionTrips: DbTrip[]
  ) => {
    const isCollapsed = collapsedSections[category];
    const colors = {
      ongoing: "var(--warning)",
      upcoming: "var(--primary)",
      completed: "var(--success)",
    };

    return (
      <div key={category} style={{ marginBottom: 36 }}>
        {/* Section Header */}
        <div
          onClick={() => sectionTrips.length > 0 && toggleSection(category)}
          style={sectionHeaderStyle(category, sectionTrips.length)}
        >
          {/* Collapse chevron */}
          {sectionTrips.length > 0 && (
            <svg
              style={{
                width: 16,
                height: 16,
                color: colors[category],
                transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}

          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            {label}
          </h2>

          {/* Count badge */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: colors[category],
              backgroundColor: `${colors[category]}15`,
              padding: "2px 10px",
              letterSpacing: "0.5px",
            }}
          >
            {sectionTrips.length}
          </span>

          {/* Divider line */}
          <div
            className="flex-1"
            style={{
              height: 1,
              backgroundColor: "var(--hairline)",
            }}
          />
        </div>

        {/* Cards */}
        {!isCollapsed && (
          <div className="flex flex-col gap-3">
            {sectionTrips.length > 0 ? (
              sectionTrips.map((trip, i) => (
                <TripOverviewCard
                  key={trip.id}
                  trip={trip}
                  index={i}
                  computedStatus={category}
                  onClick={() => handleTripClick(trip, category)}
                />
              ))
            ) : (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: 14,
                  fontWeight: 300,
                  backgroundColor: "var(--surface-soft)",
                  border: "1px solid var(--hairline)",
                }}
              >
                No {label.toLowerCase()} trips
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  if (loading && trips.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div
          className="flex items-center justify-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="animate-pulse"
              style={{
                width: 48,
                height: 48,
                backgroundColor: "var(--surface-strong)",
              }}
            />
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "var(--muted)",
              }}
            >
              Loading your trips...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <TopNav />

      {/* ── Page Header (Dark Band) ── */}
      <section
        id="trips-hero"
        style={{
          backgroundColor: "var(--surface-dark)",
          padding: "48px 24px 40px",
        }}
      >
        <div className="max-w-[1440px] mx-auto">
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
              color: "var(--on-dark-soft)",
              margin: "0 0 8px 0",
            }}
          >
            My Trips
          </p>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--on-dark)",
              margin: "0 0 8px 0",
            }}
          >
            User Trip Listing
          </h1>
          <p
            style={{
              fontSize: 16,
              fontWeight: 300,
              color: "var(--on-dark-soft)",
              margin: 0,
              maxWidth: 560,
            }}
          >
            View and manage all your travel plans. Trips are automatically
            organized by their dates.
          </p>
        </div>
      </section>

      {/* ── Search & Filter Bar ── */}
      <div
        ref={dropdownRef}
        className="max-w-[1440px] mx-auto"
        style={{ padding: "24px 24px 0" }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: 14, width: 16, height: 16, color: "var(--muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="trips-search-input"
              type="text"
              placeholder="Search trips..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bmw-input w-full"
              style={{
                backgroundColor: "var(--canvas)",
                color: "var(--ink)",
                fontSize: 16,
                fontWeight: 300,
                lineHeight: 1.55,
                padding: "12px 16px 12px 40px",
                border: "1px solid var(--hairline)",
                height: 48,
                outline: "none",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 relative">
            {/* Group By */}
            <div className="relative">
              <button
                id="trips-group-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === "group" ? null : "group")
                }
                style={{
                  ...buttonBaseStyle,
                  borderColor:
                    openDropdown === "group"
                      ? "var(--ink)"
                      : "var(--hairline-strong)",
                }}
              >
                <svg
                  style={{ width: 14, height: 14 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <span className="hidden sm:inline">Group by</span>
              </button>
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                id="trips-filter-btn"
                style={buttonBaseStyle}
              >
                <svg
                  style={{ width: 14, height: 14 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
                </svg>
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Sort By */}
            <div className="relative">
              <button
                id="trips-sort-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === "sort" ? null : "sort")
                }
                style={{
                  ...buttonBaseStyle,
                  borderColor:
                    openDropdown === "sort"
                      ? "var(--ink)"
                      : "var(--hairline-strong)",
                }}
              >
                <svg
                  style={{ width: 14, height: 14 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="18" x2="12" y2="18" />
                </svg>
                <span className="hidden sm:inline">Sort by...</span>
              </button>
              {openDropdown === "sort" && (
                <div
                  className="absolute top-full right-0 mt-1 bg-white border border-[var(--hairline)] z-20 animate-fadeIn"
                  style={{ minWidth: 160 }}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortField(opt.value);
                        setOpenDropdown(null);
                      }}
                      className="block w-full text-left hover:bg-[var(--surface-soft)] transition-colors"
                      style={{
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: sortField === opt.value ? 700 : 300,
                        color:
                          sortField === opt.value
                            ? "var(--primary)"
                            : "var(--body)",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trip Sections ── */}
      <main
        id="trips-content"
        className="max-w-[1440px] mx-auto"
        style={{ padding: "32px 24px 80px" }}
      >
        {renderSection("ongoing", "Ongoing", categorized.ongoing)}
        {renderSection("upcoming", "Upcoming", categorized.upcoming)}
        {renderSection("completed", "Completed", categorized.completed)}
      </main>

      {/* ── Footer ── */}
      <footer
        id="trips-footer"
        style={{
          backgroundColor: "var(--surface-soft)",
          padding: "48px 24px",
        }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center bg-[var(--primary)] text-white"
              style={{
                width: 28,
                height: 28,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              GT
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              GlobeTrotter
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: "var(--muted)",
              margin: 0,
            }}
          >
            © 2026 GlobeTrotter. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Trip Detail Modal ── */}
      <TripDetailModal
        trip={selectedTrip}
        computedStatus={selectedCategory}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}
