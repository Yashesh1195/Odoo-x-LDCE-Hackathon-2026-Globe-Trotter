"use client";

import React, { useState, useEffect, useRef } from "react";
import TopNav from "../../components/TopNav";
import { searchActivity } from "../../actions/activity";

interface ActivityResult {
  title: string;
  description: string;
  price: string;
  bestTime: string;
}

interface UserLocation {
  city: string;
  country: string;
}

function parsePrice(priceStr: string) {
  if (priceStr.toLowerCase().includes("free")) return 0;
  const match = priceStr.match(/\d+(?:,\d+)*(?:\.\d+)?/);
  if (match) return parseFloat(match[0].replace(/,/g, ""));
  return 999999; // Fallback for unparseable prices to push them to the end
}

export default function SearchActivityPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ActivityResult[]>([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  // Location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Sorting, Filtering, and Grouping state
  const [activeDropdown, setActiveDropdown] = useState<"group" | "filter" | "sort" | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "price_asc" | "price_desc">("none");
  const [filterBy, setFilterBy] = useState<"all" | "budget" | "premium">("all");
  const [groupBy, setGroupBy] = useState<"none" | "season">("none");

  // Fetch user location automatically on mount
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.country_name) {
            setUserLocation({ city: data.city, country: data.country_name });
          }
        }
      } catch (err) {
        console.error("Failed to fetch location automatically:", err);
      } finally {
        setLocationLoading(false);
      }
    }
    fetchLocation();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    
    // Reset filters on new search
    setSortBy("none");
    setFilterBy("all");
    setGroupBy("none");
    setActiveDropdown(null);

    const res = await searchActivity(query, userLocation || undefined);
    
    if (res.error) {
      setError(res.error);
      setResults([]);
    } else if (res.success && res.results) {
      setResults(res.results);
    }
    
    setLoading(false);
  };

  // Process Results
  let displayedResults = [...results];

  // 1. Filter
  if (filterBy === "budget") {
    displayedResults = displayedResults.filter(r => parsePrice(r.price) < 5000);
  } else if (filterBy === "premium") {
    displayedResults = displayedResults.filter(r => parsePrice(r.price) >= 5000);
  }

  // 2. Sort
  if (sortBy === "price_asc") {
    displayedResults.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortBy === "price_desc") {
    displayedResults.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }

  // 3. Group
  let groupedResults: { [key: string]: ActivityResult[] } | null = null;
  if (groupBy === "season") {
    groupedResults = {};
    displayedResults.forEach(r => {
      const season = r.bestTime || "General";
      if (!groupedResults![season]) groupedResults![season] = [];
      groupedResults![season].push(r);
    });
  }

  const renderCard = (result: ActivityResult, idx: number) => (
    <div 
      key={idx} 
      className="flex flex-col md:flex-row border border-[var(--hairline-strong)] bg-white hover:border-[var(--primary)] hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >
      {/* Photo Side */}
      <div className="w-full md:w-[35%] h-64 md:h-auto bg-[var(--surface-soft)] relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-[var(--hairline-strong)]">
        <img 
          src={`https://picsum.photos/seed/${encodeURIComponent(result.title)}/800/600`} 
          alt={result.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-4 left-4 bg-white text-[var(--ink)] text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 shadow-sm">
          Top Pick
        </div>
      </div>

      {/* Content Side */}
      <div className="p-8 md:p-10 flex flex-col justify-between flex-1 relative">
        <div className="mb-8">
          <h3 className="text-[24px] md:text-[28px] font-bold mb-4 text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors leading-tight tracking-tight">
            {result.title}
          </h3>
          <p className="text-[16px] font-light text-[var(--body)] leading-relaxed md:line-clamp-3">
            {result.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-6 border-t border-[var(--hairline-strong)]">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--primary)] mb-1">Best Season</span>
            <span className="text-[18px] font-bold text-[var(--ink)]">{result.bestTime}</span>
          </div>
          <div className="hidden sm:block w-[1px] h-12 bg-[var(--hairline-strong)]"></div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--primary)] mb-1">Est. Budget</span>
            <span className="text-[18px] font-bold text-[var(--ink)]">{result.price}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)]">
      <TopNav />

      {/* Hero Band */}
      <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-[60px] px-8 md:px-16 lg:px-32 border-b-4 border-[var(--primary)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none flex items-center justify-end overflow-hidden">
            <span className="text-[250px] font-bold leading-none select-none tracking-tighter">GT</span>
        </div>
        <div className="max-w-[1000px] mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-[var(--primary)]"></span>
            <span className="text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary)]">Global Discoveries</span>
          </div>
          
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] mb-6 tracking-tight">
            Search Activity or City
          </h1>
          <p className="text-[16px] md:text-[18px] font-light text-[var(--on-dark-soft)] mb-10 max-w-2xl leading-relaxed">
            Discover the absolute best places in the world to experience your favorite activities, or explore top landmarks in any city.
            {!locationLoading && userLocation && (
              <span className="block mt-2 text-[#b0d4ff]">
                Auto-detect active: Prioritizing spots near <strong className="font-bold">{userLocation.city}, {userLocation.country}</strong>.
              </span>
            )}
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Paragliding, Paris, Scuba Diving, Ahmedabad..."
                className="w-full bg-white text-[var(--ink)] h-[60px] px-6 rounded-none border-none text-[16px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-light placeholder:text-[var(--muted)]"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="bmw-button-primary h-[60px] px-10 uppercase tracking-[1.5px] font-bold text-[14px] disabled:bg-[#004e9a] disabled:text-[#80a6cd] shadow-none hover:shadow-lg transition-all"
            >
              {loading ? "Curating..." : "Search"}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <main className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-32 py-[60px]">
        
        {hasSearched && !loading && !error && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-[var(--hairline-strong)] pb-4 gap-4">
            <h2 className="text-[28px] font-bold text-[var(--ink)] tracking-tight">Curated Results</h2>
            <div className="flex flex-wrap gap-3">
              
              {/* Group By Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "group" ? null : "group")}
                  className={`h-10 px-6 border border-[var(--ink)] text-[12px] font-bold uppercase tracking-[1.5px] transition-colors cursor-pointer ${activeDropdown === "group" || groupBy !== "none" ? "bg-[var(--ink)] text-white" : "bg-transparent hover:bg-[var(--surface-soft)] text-[var(--ink)]"}`}
                >
                  Group By {groupBy !== "none" && "(1)"}
                </button>
                {activeDropdown === "group" && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[var(--hairline-strong)] shadow-xl z-20 flex flex-col">
                    <button onClick={() => { setGroupBy("none"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)]">None</button>
                    <button onClick={() => { setGroupBy("season"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)]">Best Season</button>
                  </div>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "filter" ? null : "filter")}
                  className={`h-10 px-6 border border-[var(--ink)] text-[12px] font-bold uppercase tracking-[1.5px] transition-colors cursor-pointer ${activeDropdown === "filter" || filterBy !== "all" ? "bg-[var(--ink)] text-white" : "bg-transparent hover:bg-[var(--surface-soft)] text-[var(--ink)]"}`}
                >
                  Filter {filterBy !== "all" && "(1)"}
                </button>
                {activeDropdown === "filter" && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[var(--hairline-strong)] shadow-xl z-20 flex flex-col">
                    <button onClick={() => { setFilterBy("all"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)]">All Prices</button>
                    <button onClick={() => { setFilterBy("budget"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)]">Budget (Under ₹5k)</button>
                    <button onClick={() => { setFilterBy("premium"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)]">Premium (₹5k+)</button>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")}
                  className={`h-10 px-6 border border-[var(--ink)] text-[12px] font-bold uppercase tracking-[1.5px] transition-colors cursor-pointer ${activeDropdown === "sort" || sortBy !== "none" ? "bg-[var(--ink)] text-white" : "bg-transparent hover:bg-[var(--surface-soft)] text-[var(--ink)]"}`}
                >
                  Sort By {sortBy !== "none" && "(1)"}
                </button>
                {activeDropdown === "sort" && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[var(--hairline-strong)] shadow-xl z-20 flex flex-col">
                    <button onClick={() => { setSortBy("none"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)]">Relevance</button>
                    <button onClick={() => { setSortBy("price_asc"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)]">Price: Low to High</button>
                    <button onClick={() => { setSortBy("price_desc"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-medium hover:bg-[var(--surface-soft)]">Price: High to Low</button>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[14px] font-bold text-[var(--ink)] tracking-[2px] uppercase">Curating Premium Destinations...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-l-4 border-red-600 text-red-800 font-medium">
            {error}
          </div>
        ) : hasSearched && displayedResults.length === 0 ? (
          <div className="p-16 text-center text-[var(--ink)] font-light border border-[var(--hairline-strong)] bg-white">
            <p className="text-xl mb-2">No matching recommendations found.</p>
            <p className="text-[var(--muted)]">Try adjusting your filters or searching for something else.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedResults ? (
              Object.keys(groupedResults).map(season => (
                <div key={season} className="mb-12">
                  <h3 className="text-[20px] font-bold uppercase tracking-[1.5px] text-[var(--primary)] mb-6 border-b border-[var(--hairline)] pb-2">{season}</h3>
                  <div className="space-y-8">
                    {groupedResults![season].map((result, idx) => renderCard(result, idx))}
                  </div>
                </div>
              ))
            ) : (
              displayedResults.map((result, idx) => renderCard(result, idx))
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-[var(--surface-soft)] border-t border-[var(--hairline)] py-12 px-8 text-center text-[13px] font-light text-[var(--muted)] mt-auto">
        <p>© {new Date().getFullYear()} GT - Globe Trotter. All rights reserved.</p>
      </footer>
    </div>
  );
}
