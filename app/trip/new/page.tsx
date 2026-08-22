"use client";

import React, { useState } from "react";
import TopNav from "../../components/TopNav";
import Link from "next/link";
import { generateSuggestions, createTrip } from "../../actions/trip";
import { getLocationImage } from "@/app/lib/destinationImages";

interface Activity {
  title: string;
  description: string;
}

export default function PlanTripPage() {
  const [place, setPlace] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tripId, setTripId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSuggestions([]);

    if (!place || !startDate || !endDate) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    const res = await generateSuggestions(place, startDate, endDate);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    if (res.success && res.suggestions) {
      setSuggestions(res.suggestions);
      
      // Automatically save the trip once suggestions are generated
      const saveRes = await createTrip({
        place,
        startDate,
        endDate,
        suggestions: JSON.stringify(res.suggestions)
      });

      if (saveRes.error || !saveRes.trip) {
        setError("Generated suggestions, but failed to save trip: " + saveRes.error);
      } else {
        setTripId(saveRes.trip.id);
        setSuccessMsg("Trip saved successfully! Click a suggestion below to build your itinerary.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white">
      <div>
        {/* ── Top Navigation ── */}
        <TopNav />

        {/* Hero Band */}
        <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-16 sm:py-20 px-6 lg:px-10">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-white">
              Plan a New Trip
            </h1>
            <p className="text-lg sm:text-xl font-light text-[var(--on-dark-soft)] max-w-2xl">
              Enter your destination and dates, and let our AI curate authentic experiences and itineraries for your journey.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 border-b border-[var(--hairline)]">
          <form onSubmit={handleGenerate} className="max-w-xl mx-auto space-y-6">
            {error && (
              <div className="text-[var(--error)] text-sm font-bold p-4 bg-red-50 border border-[var(--error)] animate-fadeIn">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="text-[var(--success)] text-sm font-bold p-4 bg-green-50 border border-[var(--success)] animate-fadeIn">
                {successMsg}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                Destination City / Country:
              </label>
              <input 
                type="text" 
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Paris, Tokyo, Bali, New York, Manali"
                className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-base w-full focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                  Start Date:
                </label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-base w-full focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                  End Date:
                </label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-base w-full focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bmw-button-primary h-12 px-8 uppercase tracking-[1.5px] font-bold text-[13px] disabled:opacity-60 cursor-pointer w-full sm:w-auto"
            >
              {loading ? "Generating Experiences..." : "Get AI Suggestions"}
            </button>
          </form>
        </div>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="px-6 sm:px-12 lg:px-20 py-16 bg-[var(--canvas)] animate-fadeIn">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Curated Places to Visit in {place}
                </h2>
                <div className="flex-1 h-px bg-[var(--hairline)]" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((act, idx) => {
                  const linkHref = tripId ? `/trip/${tripId}/itinerary?activity=${encodeURIComponent(act.title)}` : "#";
                  const photoUrl = getLocationImage(place, act.title);
                  return (
                    <Link
                      key={idx}
                      href={linkHref}
                      className="bg-[var(--canvas)] border border-[var(--hairline)] group hover:border-[var(--ink)] transition-colors duration-300 block no-underline"
                    >
                      <div className="w-full h-48 bg-[var(--surface-card)] overflow-hidden relative">
                        <img 
                          src={photoUrl}
                          alt={act.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-[var(--primary)] text-white text-[11px] font-bold uppercase tracking-wider">
                          Suggested #{idx + 1}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                          {act.title}
                        </h3>
                        <p className="text-sm font-light text-[var(--body)] leading-relaxed line-clamp-3">
                          {act.description}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                          Build Itinerary ›
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[var(--surface-soft)] text-[var(--body)] py-12 px-6 sm:px-12 text-center text-sm font-light border-t border-[var(--hairline)]">
        <p className="m-0">&copy; 2026 GT - Globe Trotter. All rights reserved.</p>
      </footer>
    </div>
  );
}
