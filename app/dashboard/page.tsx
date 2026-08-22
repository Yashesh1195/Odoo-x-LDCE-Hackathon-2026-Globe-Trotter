"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  }, []);

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
        setPlanContent(`## ⚠️ Error\n\n${err.error || "Failed to generate trip plan."}`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setPlanContent("## ⚠️ Error\n\nNo response stream available.");
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
        `## ⚠️ Error\n\n${err instanceof Error ? err.message : "An unexpected error occurred."}`
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
              Loading your dashboard...
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
      <TopNav />

      {/* ── Hero Banner (Dark Band) ── */}
      <HeroBanner userName={data.user.firstName} />

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
            Top Regional Selections
          </h2>
          <div
            className="flex-1"
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
            Previous Trips
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
      <BudgetHighlight budget={data.budgetSummary} />

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

      {/* ── Floating Action Buttons (Plan a Trip & AI Chatbot Icon) ── */}
      {!isViewerOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-fadeIn"
          style={{ animationDelay: "0.5s" }}
        >
          {/* Plan a Trip / Add Route Button */}
          <button
            id="plan-trip-fab"
            className="flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
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

          {/* AI Travel Assistant Chatbot Floating Button */}
          <button
            id="ai-chatbot-fab"
            className="bmw-button-primary flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all relative"
            style={{
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
              border: "none",
            }}
            onClick={() => setIsChatbotOpen(true)}
            title="Chat with GlobeTrotter AI Assistant"
          >
            <svg
              style={{ width: 16, height: 16 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>AI Assistant</span>

            {/* Glowing online status indicator */}
            <span
              className="absolute -top-1 -right-1"
              style={{
                width: 10,
                height: 10,
                borderRadius: "9999px",
                backgroundColor: "var(--success)",
                border: "2px solid #fff",
              }}
            />
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
