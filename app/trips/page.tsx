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

  // Filter state: which categories to show
  const [filterCategory, setFilterCategory] = useState<"all" | TripCategory>("all");

  // Group by state
  const [groupBy, setGroupBy] = useState<"status" | "none">("status");

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

  const filterOptions: { value: "all" | TripCategory; label: string }[] = [
    { value: "all", label: "All Trips" },
    { value: "ongoing", label: "Ongoing" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ];

  const groupOptions: { value: "status" | "none"; label: string }[] = [
    { value: "status", label: "Status" },
    { value: "none", label: "No Grouping" },
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

  const dropdownMenuStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 4,
    backgroundColor: "white",
    border: "1px solid var(--hairline)",
    zIndex: 20,
    minWidth: 170,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const dropdownItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: "block",
    width: "100%",
    textAlign: "left" as const,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: isActive ? 700 : 300,
    color: isActive ? "var(--primary)" : "var(--body)",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  });

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

  // Flat list rendering (no grouping)
  const renderFlatList = (allTrips: DbTrip[]) => {
    if (allTrips.length === 0) {
      return (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 14,
            fontWeight: 300,
            backgroundColor: "var(--surface-soft)",
            border: "1px solid var(--hairline)",
          }}
        >
          No trips found
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {allTrips.map((trip, i) => {
          // Determine category for styling
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(trip.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(trip.endDate);
          end.setHours(0, 0, 0, 0);
          let cat: TripCategory = "completed";
          if (start <= today && end >= today) cat = "ongoing";
          else if (start > today) cat = "upcoming";

          return (
            <TripOverviewCard
              key={trip.id}
              trip={trip}
              index={i}
              computedStatus={cat}
              onClick={() => handleTripClick(trip, cat)}
            />
          );
        })}
      </div>
    );
  };

  // Get filtered trips based on filterCategory
  const getFilteredTrips = (): DbTrip[] => {
    if (filterCategory === "all") return trips;
    const cat = categorizeTrips(trips);
    return cat[filterCategory];
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

  // Active filter/sort/group indicator labels
  const activeFilterLabel = filterOptions.find((o) => o.value === filterCategory)?.label || "All";
  const activeGroupLabel = groupOptions.find((o) => o.value === groupBy)?.label || "Status";

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
                    openDropdown === "group" || groupBy !== "status"
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
                <span className="hidden sm:inline">Group: {activeGroupLabel}</span>
              </button>
              {openDropdown === "group" && (
                <div
                  className="animate-fadeIn"
                  style={dropdownMenuStyle}
                >
                  {groupOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setGroupBy(opt.value);
                        setOpenDropdown(null);
                      }}
                      className="hover:bg-[var(--surface-soft)] transition-colors"
                      style={dropdownItemStyle(groupBy === opt.value)}
                    >
                      {groupBy === opt.value && (
                        <span style={{ marginRight: 6, color: "var(--primary)" }}>✓</span>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                id="trips-filter-btn"
                onClick={() =>
                  setOpenDropdown(openDropdown === "filter" ? null : "filter")
                }
                style={{
                  ...buttonBaseStyle,
                  borderColor:
                    openDropdown === "filter" || filterCategory !== "all"
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
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
                </svg>
                <span className="hidden sm:inline">
                  {filterCategory !== "all" ? `Filter: ${activeFilterLabel}` : "Filter"}
                </span>
              </button>
              {openDropdown === "filter" && (
                <div
                  className="animate-fadeIn"
                  style={dropdownMenuStyle}
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterCategory(opt.value);
                        setOpenDropdown(null);
                      }}
                      className="hover:bg-[var(--surface-soft)] transition-colors"
                      style={dropdownItemStyle(filterCategory === opt.value)}
                    >
                      {filterCategory === opt.value && (
                        <span style={{ marginRight: 6, color: "var(--primary)" }}>✓</span>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
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
                <span className="hidden sm:inline">Sort: {sortField === "name" ? "Name" : "Date"}</span>
              </button>
              {openDropdown === "sort" && (
                <div
                  className="animate-fadeIn"
                  style={dropdownMenuStyle}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortField(opt.value);
                        setOpenDropdown(null);
                      }}
                      className="hover:bg-[var(--surface-soft)] transition-colors"
                      style={dropdownItemStyle(sortField === opt.value)}
                    >
                      {sortField === opt.value && (
                        <span style={{ marginRight: 6, color: "var(--primary)" }}>✓</span>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filters summary */}
        {(filterCategory !== "all" || groupBy !== "status") && (
          <div
            className="flex items-center gap-2 flex-wrap mt-3"
            style={{ fontSize: 12, color: "var(--muted)" }}
          >
            {filterCategory !== "all" && (
              <span
                className="flex items-center gap-1"
                style={{
                  backgroundColor: "var(--surface-soft)",
                  padding: "4px 10px",
                  border: "1px solid var(--hairline)",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Filter: {activeFilterLabel}
                <button
                  onClick={() => setFilterCategory("all")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "0 2px",
                    lineHeight: 1,
                  }}
                  title="Clear filter"
                >
                  ×
                </button>
              </span>
            )}
            {groupBy !== "status" && (
              <span
                className="flex items-center gap-1"
                style={{
                  backgroundColor: "var(--surface-soft)",
                  padding: "4px 10px",
                  border: "1px solid var(--hairline)",
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                Group: {activeGroupLabel}
                <button
                  onClick={() => setGroupBy("status")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "0 2px",
                    lineHeight: 1,
                  }}
                  title="Reset grouping"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Trip Sections ── */}
      <main
        id="trips-content"
        className="max-w-[1440px] mx-auto"
        style={{ padding: "32px 24px 80px" }}
      >
        {groupBy === "status" ? (
          <>
            {(filterCategory === "all" || filterCategory === "ongoing") &&
              renderSection("ongoing", "Ongoing", categorized.ongoing)}
            {(filterCategory === "all" || filterCategory === "upcoming") &&
              renderSection("upcoming", "Upcoming", categorized.upcoming)}
            {(filterCategory === "all" || filterCategory === "completed") &&
              renderSection("completed", "Completed", categorized.completed)}
          </>
        ) : (
          renderFlatList(getFilteredTrips())
        )}
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
