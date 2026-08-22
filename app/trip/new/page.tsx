"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import { generateSuggestions, generateChatTripPlan, saveChatTrip, createTrip } from "@/app/actions/trip";
import { getLocationImage } from "@/app/lib/destinationImages";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface ItinerarySection {
  title: string;
  description: string;
  dateRange: string;
  budget: string;
}

interface GeneratedPlan {
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
  summary: string;
  sections: ItinerarySection[];
}

interface SuggestionCard {
  title: string;
  description: string;
  image?: string;
}

const QUICK_PROMPTS = [
  { label: "Manali & Solang 5-Day Winter Trip", prompt: "Plan a 5-day winter trip to Manali with Solang Valley snow adventure and Atal Tunnel under ₹25,000." },
  { label: "Paris 4-Day Romantic Getaway", prompt: "Plan a 4-day romantic itinerary for Paris covering Eiffel Tower, Louvre, and Seine cruise." },
  { label: "Tokyo 7-Day Tech & Culture", prompt: "Create a 7-day Tokyo trip with Akihabara, Shibuya, Senso-ji temple, and Fuji day trip." },
  { label: "Dubai 5-Day Desert & Luxury", prompt: "Curate a 5-day luxury Dubai itinerary with dune bashing, Burj Khalifa, and marina dining." },
];

const INTEREST_OPTIONS = [
  "Culture & Sightseeing",
  "Foodie & Culinary",
  "Nature & Wildlife",
  "Adventure & Treks",
  "Shopping & Markets",
  "Relaxation & Spa",
  "Nightlife & Entertainment",
];

const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "AED", symbol: "DH", label: "AED (DH)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
];

export default function PlanTripPage() {
  const router = useRouter();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Form State ──
  const [place, setPlace] = useState("Paris");
  const [startDate, setStartDate] = useState("2026-09-10");
  const [endDate, setEndDate] = useState("2026-09-15");
  const [travelers, setTravelers] = useState("Couple");
  
  // Requirement 1: Currency & Expense Range
  const [currency, setCurrency] = useState("INR (₹)");
  const [minBudget, setMinBudget] = useState("15000");
  const [maxBudget, setMaxBudget] = useState("50000");

  // Requirement 3: Travel Pace with Number of Activities per day
  const [pace, setPace] = useState("Balanced (3-4 activities / day)");

  // Requirement 2: Primary Interests Multi-Select Checkboxes
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Culture & Sightseeing",
    "Foodie & Culinary",
  ]);
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>([
    {
      title: "Eiffel Tower & Champ de Mars",
      description: "Ascend Paris's legendary iron tower for panoramic city views and relax on the surrounding gardens.",
      image: "/images/dest-paris.jpg",
    },
    {
      title: "Louvre Museum & Glass Pyramid",
      description: "Explore world-renowned art masterpieces including the Mona Lisa and Venus de Milo in historic galleries.",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80",
    },
    {
      title: "Montmartre & Sacré-Cœur Basilica",
      description: "Wander artistic cobblestone alleys, bohemian cafes, and admire the sweeping vista from the hilltop basilica.",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80",
    },
    {
      title: "Seine River Sunset Cruise",
      description: "Sail past illuminated landmarks, historic bridges, and Notre-Dame Cathedral with evening dining.",
      image: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=1200&auto=format&fit=crop&q=80",
    },
    {
      title: "Palace of Versailles Excursion",
      description: "Discover opulent royal hall of mirrors, grand landscaped fountains, and manicured gardens.",
      image: "https://images.unsplash.com/photo-1584285418504-0101cad12375?w=1200&auto=format&fit=crop&q=80",
    },
    {
      title: "Le Marais Culinary & Boutique Walk",
      description: "Sample gourmet French pastries, vintage fashion boutiques, and vibrant historic courtyard cafes.",
      image: "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=1200&auto=format&fit=crop&q=80",
    },
  ]);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  // Close multi-select dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsInterestsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── AI Chat Assistant State ──
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Hello! I am your GlobeTrotter AI Assistant. Fill out the trip details above or type directly below to generate custom step-by-step itineraries!",
      timestamp: "12:00 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  // Handle AI Chat Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim()) return;
    if (!customPrompt && chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText("");
    setChatLoading(true);
    setErrorMsg("");

    try {
      const res = await generateChatTripPlan(textToSend.trim(), place, 5);

      if (!res.success || !res.plan) {
        setErrorMsg(res.error || "Failed to generate itinerary response.");
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: "ai",
            text: "I encountered an error generating your plan. Please try rephrasing your destination or dates.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setChatLoading(false);
        return;
      }

      const plan = res.plan;
      setCurrentPlan(plan);
      const aiMsgText = `I have generated your custom itinerary for **${plan.destination}** (${plan.startDate} to ${plan.endDate}) with an estimated budget of **${plan.totalBudget}**!\n\n${plan.summary}\n\nYou can review the day-by-day schedule on the right side panel and save it directly to your trips.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: aiMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate itinerary response.");
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Form Submit
  const handleGetSuggestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!place.trim()) return;

    setFormLoading(true);
    setErrorMsg("");

    try {
      // 1. Save trip record in database
      const createRes = await createTrip({
        place: place.trim(),
        startDate,
        endDate,
        suggestions: "[]",
      });

      if (createRes.success && createRes.trip) {
        setCreatedTripId(createRes.trip.id);
      }

      // 2. Fetch curated suggestion cards
      const sugRes = await generateSuggestions(place.trim(), startDate, endDate);
      if (sugRes.success && sugRes.suggestions) {
        setSuggestions(sugRes.suggestions);
      }

      // 3. Construct rich prompt incorporating currency, budget range, pace (with activities/day), and multi-selected interests
      const interestsText = selectedInterests.length > 0 ? selectedInterests.join(", ") : "Sightseeing";
      const budgetRangeText = `${currency} ${minBudget} - ${maxBudget}`;
      const detailedPrompt = `Plan a trip to ${place.trim()} from ${startDate} to ${endDate} for a ${travelers} group. Budget range: ${budgetRangeText}. Pace: ${pace}. Primary interests: ${interestsText}.`;
      
      // Send to AI chat & trigger side panel itinerary generation
      await handleSendMessage(detailedPrompt);

      // 4. Smoothly scroll to AI Chat & Side Panel section
      if (chatSectionRef.current) {
        chatSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate trip plan details. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!currentPlan) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await saveChatTrip(currentPlan);
      if (res.success && res.tripId) {
        router.push(`/trip/${res.tripId}/itinerary`);
      } else {
        setErrorMsg(res.error || "Failed to save itinerary.");
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred while saving.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white">
      <div>
        {/* ── Top Navigation ── */}
        <TopNav />

<<<<<<< HEAD
        {/* Hero Band */}
        <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-10 sm:py-14 border-b border-black">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
=======
        {/* ── Header Band ── */}
        <section
          id="plan-hero"
          style={{
            backgroundColor: "var(--surface-dark)",
            padding: "48px 0 36px",
          }}
        >
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
>>>>>>> aacfafaccabe21c1bcaffea28262db07b7e4df37
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary-light)]">
                  Trip Planner
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
                Plan a New Trip
              </h1>
              <p className="text-base sm:text-lg font-light text-[var(--on-dark-soft)] max-w-2xl mt-1">
                Enter your destination and dates to get instant GlobeTrotter AI recommendations and day-by-day itineraries.
              </p>
            </div>
          </div>
        </section>

        {/* ── Form Section: Detailed Trip Questionnaire ── */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
          <div className="bg-white border border-[var(--hairline-strong)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold uppercase tracking-[1.5px] text-[var(--ink)] mb-6 pb-3 border-b border-[var(--hairline)]">
              Plan a New Trip
            </h2>

            <form onSubmit={handleGetSuggestions} className="space-y-6">
              {/* Row 1: Place, Start Date, End Date, Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Select a Place :
                  </label>
                  <input
                    type="text"
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Paris, Tokyo, Bali, Ahmedabad, New York"
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Start Date :
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    End Date :
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Travelers / Group :
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                  >
                    <option value="Solo Traveler">Solo Traveler</option>
                    <option value="Couple">Couple</option>
                    <option value="Family with Kids">Family with Kids</option>
                    <option value="Friends Group">Friends Group</option>
                    <option value="Business & Leisure">Business & Leisure</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Currency & Expense Range, Travel Pace (Activities/Day), Primary Interests (Multi-select Checkboxes) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[var(--hairline)]">
                {/* Requirement 1: Currency & Range of Expense */}
                <div className="lg:col-span-6 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Budget Level & Expense Range :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-3 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full font-bold"
                      >
                        {CURRENCY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.label}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Min Expense"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-3 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        placeholder="Max Expense"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-3 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirement 3: Travel Pace with Number of Activities per day */}
                <div className="lg:col-span-3 flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Travel Pace :
                  </label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-3 border border-[var(--hairline-strong)] text-xs focus:outline-none focus:border-[var(--ink)] w-full font-medium"
                  >
                    <option value="Relaxed (1-2 activities / day)">
                      Relaxed (1-2 activities / day)
                    </option>
                    <option value="Balanced (3-4 activities / day)">
                      Balanced (3-4 activities / day)
                    </option>
                    <option value="Fast-Paced (5+ activities / day)">
                      Fast-Paced (5+ activities / day)
                    </option>
                  </select>
                </div>

                {/* Requirement 2: Primary Interests Checkboxes Dropdown */}
                <div className="lg:col-span-3 flex flex-col gap-2 relative" ref={dropdownRef}>
                  <label className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Primary Interests :
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInterestsOpen((prev) => !prev)}
                    className="bg-[var(--canvas)] text-[var(--ink)] h-12 px-3 border border-[var(--hairline-strong)] text-xs font-medium focus:outline-none focus:border-[var(--ink)] w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="truncate">
                      {selectedInterests.length > 0
                        ? `${selectedInterests.join(", ")} (${selectedInterests.length})`
                        : "Select Interests..."}
                    </span>
                    <span className="ml-1 text-xs">▼</span>
                  </button>

                  {isInterestsOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--hairline-strong)] shadow-xl z-50 max-h-60 overflow-y-auto p-3 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--ink-soft)] mb-2 pb-1 border-b border-[var(--hairline)]">
                        Select Multiple Interests
                      </div>
                      {INTEREST_OPTIONS.map((option) => {
                        const isChecked = selectedInterests.includes(option);
                        return (
                          <label
                            key={option}
                            className="flex items-center gap-2.5 text-xs text-[var(--ink)] cursor-pointer hover:bg-neutral-50 p-1.5 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleInterest(option)}
                              className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Action Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={formLoading || chatLoading}
                  className="bmw-button-primary h-12 px-8 uppercase tracking-[1.5px] font-bold text-[13px] disabled:opacity-60 cursor-pointer text-white border-none"
                >
                  {formLoading || chatLoading ? "Curating Itinerary & Places..." : "Get GlobeTrotter AI Suggestions"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── GlobeTrotter AI Chat & Side Panel Itinerary Preview Section ── */}
        <section ref={chatSectionRef} className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 border-t border-[var(--hairline-strong)]">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-[var(--error)] text-[var(--error)] text-sm font-bold animate-fadeIn">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Pane: Conversational AI Chat ── */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-[var(--hairline-strong)] shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[var(--hairline)] flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--surface-dark)] text-white flex items-center justify-center font-bold text-xs">
                    GT
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      GlobeTrotter AI Chat
                    </h2>
                    <p className="text-xs text-[var(--ink-soft)]">
                      Instant multi-day itinerary generation
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-1 bg-blue-50 text-[var(--primary)] border border-blue-200">
                  Interactive
                </span>
              </div>

              {/* Quick Prompts */}
              <div className="p-3 sm:p-4 bg-neutral-100/60 border-b border-[var(--hairline)] flex flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-[1px] text-[var(--ink-soft)] self-center mr-1">
                  Ideas:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={chatLoading}
                    className="text-xs font-bold px-3 py-1.5 bg-white hover:bg-[var(--primary)] hover:text-white transition-colors border border-[var(--hairline)] text-[var(--ink)] disabled:opacity-50 cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Chat Stream History */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[520px] overflow-y-auto bg-[var(--canvas)]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--ink-soft)]">
                        {msg.sender === "user" ? "You" : "GlobeTrotter AI"}
                      </span>
                      <span suppressHydrationWarning className="text-[10px] text-neutral-400">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-4 max-w-[88%] text-sm leading-relaxed border ${
                        msg.sender === "user"
                          ? "bg-[var(--surface-dark)] text-white border-black font-light"
                          : "bg-white text-[var(--ink)] border-[var(--hairline)]"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-3 p-4 bg-white border border-[var(--hairline)] max-w-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-[1px]">
                      Curating day-by-day itinerary...
                    </span>
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 border-t border-[var(--hairline)] bg-white flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. Plan a 4-day trip to Gujarat with Gir safari and white desert..."
                  disabled={chatLoading}
                  className="flex-1 h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] bg-neutral-50/50 disabled:bg-neutral-100"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputText.trim()}
                  className="px-6 h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-xs uppercase tracking-[1.5px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {chatLoading ? "Generating..." : "Send"}
                </button>
              </form>
            </div>

            {/* ── Right Side Panel: Live Day-by-Day Itinerary Preview ── */}
            <div className="lg:col-span-5 bg-white border border-[var(--hairline-strong)] sticky top-6 shadow-sm">
              {currentPlan ? (
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                    <img
                      src={getLocationImage(currentPlan.destination)}
                      alt={currentPlan.destination}
                      className="w-full h-full object-cover object-center brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary-light)]">
                        Generated Itinerary Preview
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                        {currentPlan.destination}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-light text-neutral-200 mt-1">
                        <span>{currentPlan.startDate} to {currentPlan.endDate}</span>
                        <span>•</span>
                        <span className="font-bold text-white bg-white/20 px-2 py-0.5 border border-white/20">
                          {currentPlan.totalBudget}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-b border-[var(--hairline)] bg-neutral-50/50">
                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                      {currentPlan.summary}
                    </p>
                  </div>

                  <div className="p-5 max-h-[380px] overflow-y-auto space-y-4">
                    <div className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--ink)] mb-2 flex items-center justify-between">
                      <span>Day-by-Day Schedule</span>
                      <span className="text-[11px] font-normal text-[var(--ink-soft)]">
                        {currentPlan.sections.length} Sections
                      </span>
                    </div>

                    {currentPlan.sections.map((sec, i) => (
                      <div
                        key={i}
                        className="p-4 border border-[var(--hairline)] hover:border-[var(--ink)] transition-colors bg-white"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-[var(--ink)]">
                            {sec.title}
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 bg-neutral-100 border border-[var(--hairline)] text-[var(--ink)] whitespace-nowrap">
                            {sec.budget}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                          {sec.description}
                        </p>
                        <div className="mt-2 text-[11px] font-mono text-neutral-400">
                          Date: {sec.dateRange}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 border-t border-[var(--hairline)] bg-neutral-50 space-y-2">
                    <button
                      type="button"
                      onClick={handleSaveAndOpen}
                      disabled={saving}
                      className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-xs uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? (
                        "Saving to My Trips..."
                      ) : (
                        <>
                          <span>Save & Open Full Itinerary</span>
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-[var(--ink-soft)]">
                      Saves to your database and opens the full customizable budget planner.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center py-24 space-y-4">
                  <div className="w-12 h-12 mx-auto bg-neutral-100 border border-[var(--hairline)] flex items-center justify-center text-[var(--ink-soft)] font-bold text-sm">
                    AI
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      No Itinerary Generated Yet
                    </h3>
                    <p className="text-xs text-[var(--ink-soft)] max-w-xs mx-auto mt-1 leading-relaxed">
                      Type your destination in the chat or submit the form above to generate your personalized day-by-day itinerary.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Suggestions Section (Places to Visit / Activities to perform) ── */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12 border-t border-[var(--hairline-strong)]">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--hairline-strong)] pb-3">
            <h2 className="text-xl font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
              Suggestion for Places to Visit / Activities to perform
            </h2>
            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              {suggestions.length} Recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAllSuggestions ? suggestions : suggestions.slice(0, 3)).map((act, idx) => {
              const targetTripId = createdTripId || "demo-trip";
              const linkHref = `/trip/${targetTripId}/itinerary?activity=${encodeURIComponent(act.title)}`;
              const photoUrl = act.image || getLocationImage(place, act.title);

              return (
                <div
                  key={idx}
                  className="bg-white border border-[var(--hairline-strong)] group hover:border-[var(--ink)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="w-full h-48 bg-[var(--surface-soft)] overflow-hidden relative border-b border-[var(--hairline)]">
                    <img
                      src={photoUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-wider">
                      Suggestion #{idx + 1}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                        {act.title}
                      </h3>
                      <p className="text-xs font-light text-[var(--body)] leading-relaxed line-clamp-3 mb-4">
                        {act.description}
                      </p>
                    </div>

                    <Link
                      href={linkHref}
                      className="bmw-button-primary inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-bold uppercase tracking-[1.5px] text-white no-underline w-full text-center"
                    >
                      Build Itinerary ›
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {suggestions.length > 3 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAllSuggestions((prev) => !prev)}
                className="bmw-button-secondary border border-[var(--hairline-strong)] bg-white hover:bg-[var(--surface-soft)] text-[var(--ink)] h-12 px-8 font-bold text-xs uppercase tracking-[1.5px] cursor-pointer transition-colors"
              >
                {showAllSuggestions ? "Show Fewer Suggestions" : "Show More Suggestions"}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--hairline)] bg-[var(--surface-dark)] text-[var(--on-dark-soft)] py-8 px-6 sm:px-12 mt-16">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 GlobeTrotter AI Concierge. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
