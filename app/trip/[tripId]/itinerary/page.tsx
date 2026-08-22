"use client";

import React, { useState, useEffect, useMemo } from "react";
import TopNav from "@/app/components/TopNav";
import {
  getItinerary,
  generateItinerary,
  addItinerarySection,
  updateItinerarySection,
  deleteItinerarySection,
  getTripDetails,
} from "../../../actions/trip";
import { getLocationImage } from "@/app/lib/destinationImages";
import Link from "next/link";

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  budget: string;
}

interface TripMeta {
  id: string;
  place: string;
  startDate: string;
  endDate: string;
  suggestions: { title: string; description: string }[];
  totalBudget: number;
}

export default function BuildItineraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ activity?: string }>;
}) {
  const resolvedParams = React.use(params);
  const resolvedSearchParams = React.use(searchParams);

  const [sections, setSections] = useState<ItinerarySection[]>([]);
  const [trip, setTrip] = useState<TripMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for CRUD
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateRange: "",
    budget: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Top Bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<"group" | "filter" | "sort" | null>(null);
  const [sortBy, setSortBy] = useState<"chronological" | "price_asc" | "price_desc">("chronological");
  const [filterBy, setFilterBy] = useState<"all" | "budget">("all");

  const tripId = resolvedParams.tripId;
  const activity = resolvedSearchParams.activity || "your trip";

  // Calculate live total budget
  const liveTotalBudget = useMemo(() => {
    let total = 0;
    for (const sec of sections) {
      const num = parseFloat(sec.budget.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) total += num;
    }
    return total;
  }, [sections]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tripRes = await getTripDetails(tripId);
        if (tripRes.success && tripRes.trip) setTrip(tripRes.trip);

        const res = await getItinerary(tripId);
        if (res.error) {
          setError(res.error);
        } else if (res.sections && res.sections.length > 0) {
          setSections(res.sections);
        } else {
          const genRes = await generateItinerary(tripId, activity);
          if (genRes.error) setError(genRes.error);
          else if (genRes.sections) setSections(genRes.sections);
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tripId, activity]);

  const handleSave = async (sectionId?: string) => {
    if (!formData.title || !formData.description) return;
    setActionLoading(true);

    if (sectionId) {
      const res = await updateItinerarySection(sectionId, formData);
      if (res.success && res.section) {
        setSections(sections.map((s) => (s.id === sectionId ? (res.section as ItinerarySection) : s)));
      }
    } else {
      const res = await addItinerarySection(tripId, formData);
      if (res.success && res.section) {
        setSections([...sections, res.section as ItinerarySection]);
      }
    }
    setActionLoading(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = async (sectionId: string) => {
    if (!window.confirm("Delete this section?")) return;
    setActionLoading(true);
    const res = await deleteItinerarySection(sectionId);
    if (res.success) setSections(sections.filter((s) => s.id !== sectionId));
    setActionLoading(false);
  };

  // Process sections for Timeline View
  let displayedSections = [...sections];

  if (searchQuery) {
    displayedSections = displayedSections.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterBy === "budget") {
    displayedSections = displayedSections.filter(s => {
      const num = parseFloat(s.budget.replace(/[^0-9.]/g, ""));
      return !isNaN(num) && num < 5000;
    });
  }

  if (sortBy === "price_asc") {
    displayedSections.sort((a, b) => parseFloat(a.budget.replace(/[^0-9.]/g, "")) - parseFloat(b.budget.replace(/[^0-9.]/g, "")));
  } else if (sortBy === "price_desc") {
    displayedSections.sort((a, b) => parseFloat(b.budget.replace(/[^0-9.]/g, "")) - parseFloat(a.budget.replace(/[^0-9.]/g, "")));
  }

  const groupedSections: { [key: string]: ItinerarySection[] } = {};
  displayedSections.forEach((sec, idx) => {
    let groupKey = sec.dateRange || `Day ${idx + 1}`;
    if (sortBy !== "chronological") groupKey = "Sorted Results";
    
    if (!groupedSections[groupKey]) groupedSections[groupKey] = [];
    groupedSections[groupKey].push(sec);
  });

  const destinationName = trip?.place || "Destination";
  const locationPhoto = getLocationImage(destinationName, activity);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white">
      <div>
        {/* ── Top Navigation ── */}
        <TopNav />

        {/* ── Rich Hero Band with Authentic Location Image ── */}
        <div className="relative bg-[var(--surface-dark)] text-[var(--on-dark)] overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={locationPhoto}
              alt={destinationName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-16 sm:py-20 z-10">
            <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-[var(--on-dark-soft)]">
              <Link href="/trips" className="hover:text-white transition-colors no-underline text-[var(--on-dark-soft)]">
                ‹ MY TRIPS
              </Link>
              <span>/</span>
              <span className="text-[var(--primary)]">{destinationName}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider mb-4">
                  <span>FOCUS ACTIVITY: {activity}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white mb-3">
                  {destinationName} Itinerary
                </h1>

                {trip?.startDate && (
                  <p className="text-base sm:text-lg font-light text-[var(--on-dark-soft)] flex items-center gap-2">
                    <span>
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </span>
                  </p>
                )}
              </div>

              <div className="bg-[var(--surface-dark-elevated)] border border-white/10 p-6 flex flex-col gap-1 min-w-[240px]">
                <span className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--on-dark-soft)]">
                  Total Estimated Budget
                </span>
                <span className="text-3xl font-bold text-white">
                  ₹{liveTotalBudget.toLocaleString()}
                </span>
                <span className="text-xs font-light text-[var(--on-dark-soft)]">
                  Calculated from {sections.length} plan section{sections.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <main className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 sm:py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-base font-bold text-[var(--muted)] tracking-wide">
                Generating your curated itinerary for {destinationName}...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-[var(--error)] text-[var(--error)] font-bold">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, idx) => (
                <article key={section.id || idx} className="border border-[var(--hairline-strong)] bg-[var(--canvas)] p-6 sm:p-8 relative group hover:border-[var(--ink)] transition-colors">
                  <div className="absolute top-6 right-6 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => { setEditingId(section.id); }}
                      className="text-[12px] font-bold tracking-[1.5px] uppercase hover:text-[var(--primary)] transition-colors text-[var(--muted)] cursor-pointer border-none bg-transparent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(section.id)}
                      className="text-[12px] font-bold tracking-[1.5px] uppercase hover:text-[var(--error)] transition-colors text-[var(--muted)] cursor-pointer border-none bg-transparent"
                    >
                      Delete
                    </button>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--primary)] block mb-1">
                    Section {idx + 1}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 pr-24 text-[var(--ink)]">
                    {section.title}
                  </h2>
                  <p className="text-base text-[var(--body)] mb-6 leading-relaxed font-light max-w-4xl">
                    {section.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <div className="border border-[var(--hairline)] px-3.5 py-1.5 text-xs font-bold bg-[var(--surface-card)] text-[var(--ink)] flex items-center gap-1.5">
                      <span className="text-[var(--muted)] font-normal">Date:</span>
                      <span>{section.dateRange || "Flexible"}</span>
                    </div>
                    <div className="border border-[var(--hairline)] px-3.5 py-1.5 text-xs font-bold bg-[var(--surface-card)] text-[var(--ink)] flex items-center gap-1.5">
                      <span className="text-[var(--muted)] font-normal">Budget:</span>
                      <span className="text-[var(--primary)]">
                        {section.budget.includes("₹")
                          ? section.budget
                          : `₹${section.budget.replace(/[^0-9]/g, "")}`}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--hairline)]">
                <Link
                  href="/trips"
                  className="bmw-button-primary no-underline flex items-center justify-center gap-2 h-12 px-8 font-bold text-sm uppercase tracking-[0.5px] text-white"
                >
                  View All Trips ›
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-[var(--surface-soft)] text-[var(--body)] py-12 px-6 sm:px-12 text-center text-sm font-light border-t border-[var(--hairline)]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-[var(--ink)]">GT - Globe Trotter</span>
          <p className="m-0">© 2026 GT - Globe Trotter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
