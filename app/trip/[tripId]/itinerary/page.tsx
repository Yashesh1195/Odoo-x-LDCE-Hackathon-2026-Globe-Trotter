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

  // 1. Search
  if (searchQuery) {
    displayedSections = displayedSections.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 2. Filter
  if (filterBy === "budget") {
    displayedSections = displayedSections.filter(s => {
      const num = parseFloat(s.budget.replace(/[^0-9.]/g, ""));
      return !isNaN(num) && num < 5000;
    });
  }

  // 3. Sort
  if (sortBy === "price_asc") {
    displayedSections.sort((a, b) => parseFloat(a.budget.replace(/[^0-9.]/g, "")) - parseFloat(b.budget.replace(/[^0-9.]/g, "")));
  } else if (sortBy === "price_desc") {
    displayedSections.sort((a, b) => parseFloat(b.budget.replace(/[^0-9.]/g, "")) - parseFloat(a.budget.replace(/[^0-9.]/g, "")));
  }

  // Group by Date/Title (simulating Days)
  const groupedSections: { [key: string]: ItinerarySection[] } = {};
  displayedSections.forEach((sec, idx) => {
    // If it's chronological, try to group by dateRange or synthesize a "Day X"
    let groupKey = sec.dateRange || `Day ${idx + 1}`;
    // If user sorted by price, grouping by day doesn't make sense, but we'll maintain the UI structure
    if (sortBy !== "chronological") groupKey = "Sorted Results";
    
    if (!groupedSections[groupKey]) groupedSections[groupKey] = [];
    groupedSections[groupKey].push(sec);
  });

  const destinationName = trip?.place || "Destination";

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] font-sans text-white selection:bg-[var(--primary)] selection:text-white">
      <TopNav />
      <div className="m-stripe">
        <div className="m-stripe-segment-1" />
        <div className="m-stripe-segment-2" />
        <div className="m-stripe-segment-3" />
      </div>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12">
        
        {/* Top Bar (Screen 9 wireframe) */}
        <div className="mb-16 border-b border-white/20 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Itinerary for {destinationName}
              </h1>
              <p className="text-[var(--on-dark-soft)] max-w-xl font-light text-sm sm:text-base leading-relaxed">
                Total Budget: <strong className="text-[var(--primary)]">₹{liveTotalBudget.toLocaleString()}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search itinerary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-white/30 h-10 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary)] min-w-[200px]"
              />
              
              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "group" ? null : "group")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Group By</button>
                {activeDropdown === "group" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--surface-dark-elevated)] border border-white/20 shadow-xl z-20 flex flex-col">
                    <button className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10">Date / Day</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "filter" ? null : "filter")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Filter</button>
                {activeDropdown === "filter" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--surface-dark-elevated)] border border-white/20 shadow-xl z-20 flex flex-col">
                    <button onClick={() => { setFilterBy("all"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">All Activities</button>
                    <button onClick={() => { setFilterBy("budget"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10">Budget (&lt;₹5000)</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Sort by...</button>
                {activeDropdown === "sort" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--surface-dark-elevated)] border border-white/20 shadow-xl z-20 flex flex-col">
                    <button onClick={() => { setSortBy("chronological"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">Chronological</button>
                    <button onClick={() => { setSortBy("price_asc"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">Price: Low to High</button>
                    <button onClick={() => { setSortBy("price_desc"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10">Price: High to Low</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Layout (Screen 9 wireframe) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-xs font-bold tracking-[2px] uppercase">Loading Itinerary...</span>
          </div>
        ) : error ? (
          <div className="p-6 border border-red-500/50 bg-red-500/10 text-red-200">{error}</div>
        ) : (
          <div className="space-y-16">
            
            {/* Header Columns for alignment */}
            <div className="hidden md:flex gap-8 px-4 text-[10px] font-bold uppercase tracking-[2px] text-[var(--on-dark-soft)]">
              <div className="w-[100px] shrink-0"></div>
              <div className="flex-1 text-center">Physical Activity</div>
              <div className="w-[120px] shrink-0 text-right pr-4">Expense</div>
            </div>

            {Object.keys(groupedSections).map((dayKey, groupIdx) => (
              <div key={groupIdx} className="flex flex-col md:flex-row gap-8 relative">
                
                {/* Left Column: Day Badge */}
                <div className="w-[100px] shrink-0 md:pt-4">
                  <div className="border border-white/30 px-3 py-1.5 inline-block text-[11px] font-bold uppercase tracking-[1px] bg-white/5 whitespace-nowrap">
                    {dayKey}
                  </div>
                </div>

                {/* Right Columns: Activities & Expense */}
                <div className="flex-1 flex flex-col">
                  {groupedSections[dayKey].map((section, actIdx) => (
                    <div key={section.id} className="relative flex flex-col mb-4">
                      
                      {/* Down Arrow for connecting activities within a day (except last one) */}
                      {actIdx < groupedSections[dayKey].length - 1 && (
                        <div className="absolute left-1/2 -bottom-4 w-px h-4 bg-white/20 -translate-x-1/2 z-0 hidden md:block">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 border-b border-r border-white/40 rotate-45"></div>
                        </div>
                      )}

                      {/* Activity Block & Expense Block row */}
                      <div className="flex flex-col md:flex-row gap-4 relative z-10 group">
                        
                        {/* Physical Activity Box */}
                        <div className="flex-1 border border-white/20 bg-white/5 p-5 hover:border-[var(--primary)] transition-colors relative">
                          <h3 className="font-bold text-lg mb-2 text-white">{section.title}</h3>
                          <p className="text-sm font-light text-white/70">{section.description}</p>
                          
                          {/* Edit/Delete Actions */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
                            <button onClick={() => setEditingId(section.id)} className="text-[10px] uppercase font-bold tracking-[1px] text-[var(--primary)] hover:text-white">Edit</button>
                            <button onClick={() => handleDelete(section.id)} className="text-[10px] uppercase font-bold tracking-[1px] text-red-400 hover:text-red-300">Delete</button>
                          </div>
                        </div>

                        {/* Expense Box */}
                        <div className="w-full md:w-[120px] shrink-0 border border-white/20 bg-[var(--surface-dark-elevated)] p-5 flex flex-col justify-center items-center md:items-end hover:border-[var(--primary)] transition-colors">
                          <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--on-dark-soft)] mb-1 block md:hidden">Expense</span>
                          <span className="font-bold text-lg text-white whitespace-nowrap">{section.budget}</span>
                        </div>
                      </div>

                      {/* Inline Edit Form */}
                      {editingId === section.id && (
                        <div className="mt-4 border border-[var(--primary)] p-4 bg-white/5">
                           {/* Simplified edit form for hackathon demo */}
                           <p className="text-xs text-[var(--primary)] mb-2">Edit mode activated. (Form omitted for layout brevity, see add section)</p>
                           <button onClick={() => setEditingId(null)} className="text-xs border border-white/20 px-3 py-1">Cancel</button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
