"use client";

import React, { useState } from "react";
import TopNav from "../../components/TopNav";
import { useRouter } from "next/navigation";
import { generateChatTripPlan, saveChatTrip, ChatItineraryPlanResult } from "../../actions/trip";
import { getLocationImage } from "@/app/lib/destinationImages";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  plan?: ChatItineraryPlanResult;
}

const QUICK_PROMPTS = [
  { label: "Shimla Snow Trek", prompt: "Plan a 5-day winter snow trip to Shimla with scenic mountain viewpoints, Kufri snow trek, and cozy stays under ₹20,000." },
  { label: "Gujarat Heritage & Safari", prompt: "Plan a 6-day trip to Gujarat exploring the White Rann of Kutch, Statue of Unity, and Gir Asiatic Lion safari." },
  { label: "Royal Rajasthan", prompt: "Plan a 4-day royal heritage trip to Jaipur and Udaipur with palaces, forts, and traditional Rajasthani cuisine." },
  { label: "Kerala Backwaters", prompt: "Plan a 5-day relaxing vacation in Kerala with Alleppey houseboat stay and Munnar tea hills exploration." },
  { label: "Parisian Highlights", prompt: "Plan a 4-day trip to Paris for 2 people with museum tours, Eiffel Tower visit, and Seine river cruise." },
];

export default function PlanTripPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! I am your GlobeTrotter AI Concierge. Where would you like to travel next? Tell me your dream destination, dates, budget, or preferred activities, or click any suggestion below to start planning.",
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ChatItineraryPlanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await generateChatTripPlan(text);
      if (res.success && res.plan) {
        setCurrentPlan(res.plan);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `I have created a comprehensive step-by-step itinerary for your trip to **${res.plan.destination}**! Review the day-by-day schedule on the right pane. You can adjust details by typing below or click 'Save & Open Itinerary' to start customizing.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          plan: res.plan,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorReply: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "I encountered an issue generating the plan. Please try rephrasing your destination or dates.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorReply]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to connect to AI Planner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!currentPlan || saving) return;
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

        {/* Hero Band */}
<<<<<<< HEAD
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
=======
        <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-10 sm:py-14 px-6 sm:px-12 lg:px-20 border-b border-black">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2.5 h-2.5 bg-[var(--primary)]" />
                <span className="text-xs font-bold uppercase tracking-[2px] text-[var(--primary-light)]">
                  Conversational AI Engine
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
                AI Trip Planner & Concierge
              </h1>
              <p className="text-base sm:text-lg font-light text-[var(--on-dark-soft)] max-w-2xl mt-2">
                Chat naturally with GlobeTrotter AI to curate custom step-by-step itineraries with instant day-by-day scheduling.
              </p>
            </div>

            {/* Quick stats / model indicator */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 self-start md:self-auto">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs font-bold uppercase tracking-[1px] text-white">
                  Gemini Flash-Lite Dual Engine
                </div>
                <div className="text-[11px] text-neutral-400">
                  Real-time Fallback Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Dual Pane Workspace */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-[var(--error)] text-[var(--error)] text-sm font-bold animate-fadeIn">
              {errorMsg}
>>>>>>> 0e1d2db8bc2ff38d1f31f055f8afee49461500d9
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Pane: Conversational Chat (7 Cols) ── */}
            <div className="lg:col-span-7 flex flex-col bg-white border border-[var(--hairline)] shadow-sm">
              {/* Chat Header */}
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

              {/* Quick Prompt Pills */}
              <div className="p-3 sm:p-4 bg-neutral-100/60 border-b border-[var(--hairline)] flex flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-[1px] text-[var(--ink-soft)] self-center mr-1">
                  Ideas:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={loading}
                    className="text-xs font-bold px-3 py-1.5 bg-white hover:bg-[var(--primary)] hover:text-white transition-colors border border-[var(--hairline)] text-[var(--ink)] disabled:opacity-50"
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
                      <span className="text-[10px] text-neutral-400">{msg.timestamp}</span>
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

                {loading && (
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
                  disabled={loading}
                  className="flex-1 h-12 px-4 border border-[var(--hairline-strong)] text-sm focus:outline-none focus:border-[var(--ink)] bg-neutral-50/50 disabled:bg-neutral-100"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="px-6 h-12 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-xs uppercase tracking-[1.5px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Generating..." : "Send"}
                </button>
              </form>
            </div>

            {/* ── Right Pane: Live Day-by-Day Itinerary Planner (5 Cols) ── */}
            <div className="lg:col-span-5 bg-white border border-[var(--hairline)] sticky top-6 shadow-sm">
              {currentPlan ? (
                <div>
                  {/* Real-time Location Photo Hero */}
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

                  {/* Summary */}
                  <div className="p-5 border-b border-[var(--hairline)] bg-neutral-50/50">
                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                      {currentPlan.summary}
                    </p>
                  </div>

                  {/* Step-by-Step Day Sections */}
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

                  {/* Action Footer */}
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
                      Type your destination in the chat or pick an idea to generate your personalized day-by-day itinerary.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Footer */}
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
