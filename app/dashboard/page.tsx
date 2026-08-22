"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/app/components/TopNav";
import HeroBanner from "@/app/components/HeroBanner";
import SearchFilterBar from "@/app/components/SearchFilterBar";
import DestinationCard from "@/app/components/DestinationCard";
import TripCard from "@/app/components/TripCard";
import BudgetHighlight from "@/app/components/BudgetHighlight";
import TripPlannerModal from "@/app/components/TripPlannerModal";
import TripPlanViewer from "@/app/components/TripPlanViewer";
import AIChatbotModal from "@/app/components/AIChatbotModal";
import AddTeamRouteModal from "@/app/components/AddTeamRouteModal";
import type {
  DashboardData,
  SortField,
  FilterOption,
  GroupOption,
  TripPlanRequest,
  Trip,
} from "@/app/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [groupOption, setGroupOption] = useState<GroupOption>("none");

  // ── AI Trip Planner state ──
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [planContent, setPlanContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // ── Chatbot & Add Team Route Modals ──
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (filterOption !== "all") params.set("filter", filterOption);
      if (sortField !== "name") params.set("sort", sortField);

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterOption, sortField]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSortField(field);
  }, []);

  const handleFilter = useCallback((filter: FilterOption) => {
    setFilterOption(filter);
  }, []);

  const handleGroup = useCallback((group: GroupOption) => {
    setGroupOption(group);
  }, []);

  // ── Handle new trip added from team route / custom plan ──
  const handleTripAdded = useCallback((newTrip: Trip) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        trips: [newTrip, ...prev.trips],
      };
    });
    // Refresh dashboard to recalculate real stats & budget breakdown
    fetchDashboard();
  }, [fetchDashboard]);

  // ── AI Trip Planner handlers ──
  const handleGenerate = useCallback(async (request: TripPlanRequest) => {
    setIsPlannerOpen(false);
    setIsViewerOpen(true);
    setPlanContent("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const err = await res.json();
        setPlanContent(`## Error\n\n${err.error || "Failed to generate trip plan."}`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setPlanContent("## Error\n\nNo response stream available.");
        setIsStreaming(false);
        return;
      }

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setPlanContent(accumulated);
      }
    } catch (err) {
      setPlanContent(
        `## Error\n\n${err instanceof Error ? err.message : "An unexpected error occurred."}`
      );
    } finally {
      setIsStreaming(false);
    }
  }, []);

  // Loading skeleton
  if (loading && !data) {
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
              Loading your personalized dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <TopNav user={data.user} />

      {/* ── Hero Banner (Dark Band) ── */}
      <HeroBanner
        userName={data.user.firstName || data.user.name}
        userCity={(data.user as any).city}
        userCountry={(data.user as any).country}
        stats={(data.user as any).stats}
      />

      {/* ── Search & Filter Bar ── */}
      <SearchFilterBar
        onSearch={handleSearch}
        onSort={handleSort}
        onFilter={handleFilter}
        onGroup={handleGroup}
        currentSort={sortField}
        currentFilter={filterOption}
        currentGroup={groupOption}
      />

      {/* ── Top Regional Selections (Light Band) ── */}
      <section
        id="top-regional-selections"
        className="max-w-[1440px] mx-auto"
        style={{ padding: "32px 24px 48px" }}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.3,
                color: "var(--ink)",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              Top Regional Selections
            </h2>
            {(data as any).preferredRegion && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--primary)",
                  backgroundColor: "rgba(28,105,212,0.1)",
                  padding: "4px 10px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Personalized for {(data.user as any).country || (data as any).preferredRegion}
              </span>
            )}
          </div>
          <div
            className="flex-1 hidden md:block"
            style={{
              height: 1,
              backgroundColor: "var(--hairline)",
            }}
          />
        </div>

        {/* Horizontal Scrolling Grid */}
        <div
          className="flex gap-4 overflow-x-auto pb-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "var(--hairline-strong) var(--surface-soft)",
          }}
        >
          {data.destinations.length > 0 ? (
            data.destinations.map((dest, i) => (
              <DestinationCard key={dest.id} destination={dest} index={i} />
            ))
          ) : (
            <div
              className="flex items-center justify-center w-full"
              style={{
                padding: "48px 0",
                color: "var(--muted)",
                fontSize: 14,
                fontWeight: 300,
              }}
            >
              No destinations found matching your search.
            </div>
          )}
        </div>
      </section>

      {/* ── Previous Trips (Light Band) ── */}
      <section
        id="previous-trips"
        className="max-w-[1440px] mx-auto"
        style={{ padding: "0 24px 48px" }}
      >
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-6">
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--ink)",
              margin: 0,
              whiteSpace: "nowrap",
            }}
          >
            Previous Trips & Itineraries
          </h2>
          <div
            className="flex-1"
            style={{
              height: 1,
              backgroundColor: "var(--hairline)",
            }}
          />
        </div>

        {/* 3-up Grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {data.trips.length > 0 ? (
            data.trips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))
          ) : (
            <div
              className="col-span-full flex items-center justify-center"
              style={{
                padding: "48px 0",
                color: "var(--muted)",
                fontSize: 14,
                fontWeight: 300,
              }}
            >
              No trips found matching your criteria.
            </div>
          )}
        </div>
      </section>

      {/* ── Budget Highlights (Dark Band) ── */}
      <div id="budget-summary">
        <BudgetHighlight budget={data.budgetSummary} />
      </div>

      {/* ── Footer ── */}
      <footer
        id="dashboard-footer"
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

      {/* ── Floating Action Buttons (Plan a Trip & AI Chatbot Logo FAB) ── */}
      {!isViewerOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          {/* Plan a Trip / Add Route Button */}
          <button
            id="plan-trip-fab"
            className="flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl hover:bg-[#fafafa] transition-all"
            style={{
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
              border: "1px solid var(--hairline-strong)",
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
            onClick={() => setIsAddRouteOpen(true)}
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
            <span>Plan a Trip</span>
          </button>

          {/* AI Travel Assistant Chatbot Floating Logo Icon Button */}
          <button
            id="ai-chatbot-fab"
            className="group relative flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 rounded-full"
            style={{
              width: 58,
              height: 58,
              backgroundColor: "#1c69d4",
              color: "#ffffff",
              border: "2px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 8px 24px rgba(28, 105, 212, 0.45)",
            }}
            onClick={() => setIsChatbotOpen(true)}
            title="Chat with GlobeTrotter AI Travel Assistant"
            aria-label="Open AI Travel Assistant Chatbot"
          >
            {/* Glowing pulse aura */}
            <span className="absolute inset-0 rounded-full bg-[#1c69d4] opacity-50 animate-ping pointer-events-none" style={{ animationDuration: "3.5s" }} />

            {/* Robot / Chatbot Logo SVG Icon */}
            <svg
              className="w-7 h-7 relative z-10 text-white transform group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>

            {/* Online Status Green Indicator Dot */}
            <span className="absolute top-0 right-0 z-20 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
            </span>
          </button>
        </div>
      )}

      {/* ── AI Travel Assistant Chatbot Modal ── */}
      <AIChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpenPlannerModal={() => {
          setIsChatbotOpen(false);
          setIsPlannerOpen(true);
        }}
      />

      {/* ── Plan a Trip / Add Team Route Modal ── */}
      <AddTeamRouteModal
        isOpen={isAddRouteOpen}
        onClose={() => setIsAddRouteOpen(false)}
        onTripAdded={handleTripAdded}
      />

      {/* ── AI Trip Planner Form Modal ── */}
      <TripPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        onGenerate={handleGenerate}
      />

      {/* ── AI Trip Plan Viewer ── */}
      {isViewerOpen && (
        <TripPlanViewer
          content={planContent}
          isStreaming={isStreaming}
          onClose={() => setIsViewerOpen(false)}
          onStartOver={() => {
            setIsViewerOpen(false);
            setPlanContent("");
            setIsChatbotOpen(true);
          }}
        />
      )}
    </div>
  );
}
