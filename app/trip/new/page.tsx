"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { generateSuggestions, createTrip } from "../../actions/trip";

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
    <div className="min-h-screen bg-[var(--canvas)] font-sans">
      <Navbar />

      {/* Hero Band */}
      <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-[80px] px-8 md:px-16 lg:px-32">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-[48px] md:text-[64px] font-bold leading-[1.05] mb-4">
            Plan a new trip
          </h1>
          <p className="text-[18px] md:text-[20px] font-bold text-[var(--on-dark-soft)] max-w-2xl">
            Enter your destination and dates, and let our AI curate the perfect itinerary for your journey.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="px-8 md:px-16 lg:px-32 py-[40px] border-b border-[var(--surface-strong)]">
        <form onSubmit={handleGenerate} className="max-w-[1440px] mx-auto max-w-xl space-y-6">
          {error && <div className="text-[var(--error)] text-[14px] font-bold p-4 bg-red-50 border border-[var(--error)]">{error}</div>}
          {successMsg && <div className="text-[var(--success)] text-[14px] font-bold p-4 bg-green-50 border border-[var(--success)]">{successMsg}</div>}
          
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[var(--ink)]">Select a Place:</label>
            <input 
              type="text" 
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="e.g. Paris, Tokyo, New York"
              className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-[16px] w-full max-w-md"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[var(--ink)]">Start Date:</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-[16px] w-full max-w-md"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-[var(--ink)]">End Date:</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bmw-input bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-[16px] w-full max-w-md"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bmw-button-primary h-12 px-8 uppercase tracking-[1.5px] font-bold text-[13px] disabled:bg-[var(--primary-disabled)] disabled:text-[var(--muted)]"
          >
            {loading ? "Generating..." : "Get Suggestions"}
          </button>
        </form>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="px-8 md:px-16 lg:px-32 py-[80px] bg-[var(--canvas)]">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="text-[32px] font-bold mb-10 pb-4 border-b border-[var(--ink)] inline-block">
              Suggestion for Places to Visit/Activities to perform
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suggestions.map((act, idx) => {
                const linkHref = tripId ? `/trip/${tripId}/itinerary?activity=${encodeURIComponent(act.title)}` : "#";
                return (
                <Link key={idx} href={linkHref} className="bg-[var(--canvas)] border border-[var(--hairline)] group hover:border-[var(--ink)] transition-colors duration-300 block">
                  <div className="w-full h-48 bg-[var(--surface-card)] overflow-hidden">
                    {/* Using a generic reliable placeholder service to simulate photos */}
                    <img 
                      src={`https://picsum.photos/seed/${encodeURIComponent(act.title + place)}/600/400`}
                      alt={act.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-[18px] font-bold mb-3">{act.title}</h3>
                    <p className="text-[16px] font-light text-[var(--body)] leading-[1.55]">
                      {act.description}
                    </p>
                  </div>
                </Link>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* Basic Footer */}
      <footer className="bg-[var(--surface-soft)] text-[var(--body)] py-16 px-8 text-center text-[14px] font-light">
        <p>&copy; 2026 GT - Globe Trotter. All rights reserved.</p>
      </footer>
    </div>
  );
}
