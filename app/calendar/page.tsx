"use client";

import React, { useState, useEffect, useMemo } from "react";
import TopNav from "@/app/components/TopNav";

interface CalendarActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  budget: string;
  category?: string;
}

interface CalendarTrip {
  id: string;
  name: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "in-progress" | "completed";
  budgetTotal: number;
  activities: CalendarActivity[];
}

const DEFAULT_SAMPLE_TRIPS: CalendarTrip[] = [
  {
    id: "trip-dubai-002",
    name: "Dubai Desert Escape",
    destination: "Dubai",
    country: "United Arab Emirates",
    startDate: "2026-08-18",
    endDate: "2026-08-28",
    status: "in-progress",
    budgetTotal: 4200,
    activities: [
      {
        id: "act-201",
        time: "08:00 AM",
        title: "Burj Khalifa 148th Floor Observation",
        description: "Sky views over Dubai skyline and Arabian Gulf coastline.",
        budget: "$140",
        category: "Architecture",
      },
      {
        id: "act-202",
        time: "03:30 PM",
        title: "4x4 Desert Dune Bashing & Camel Safari",
        description: "Dune riding, sunset camel trek, and traditional Bedouin BBQ camp.",
        budget: "$190",
        category: "Adventure",
      },
    ],
  },
  {
    id: "trip-paris-001",
    name: "Parisian Autumn",
    destination: "Paris",
    country: "France",
    startDate: "2026-09-15",
    endDate: "2026-09-22",
    status: "upcoming",
    budgetTotal: 2800,
    activities: [
      {
        id: "act-101",
        time: "09:00 AM",
        title: "Eiffel Tower Summit & Champ de Mars",
        description: "Early morning priority access to top summit followed by garden walk.",
        budget: "$85",
        category: "Sightseeing",
      },
      {
        id: "act-102",
        time: "01:30 PM",
        title: "Louvre Guided Art Tour",
        description: "3-hour curated tour of Mona Lisa, Venus de Milo, and French Masterpieces.",
        budget: "$120",
        category: "Culture",
      },
      {
        id: "act-103",
        time: "06:00 PM",
        title: "Seine Sunset Dinner Cruise",
        description: "3-course Parisian culinary cruise along historical Seine landmarks.",
        budget: "$160",
        category: "Dining",
      },
    ],
  },
  {
    id: "trip-tokyo-004",
    name: "Tokyo Discovery",
    destination: "Tokyo",
    country: "Japan",
    startDate: "2026-10-05",
    endDate: "2026-10-14",
    status: "upcoming",
    budgetTotal: 3800,
    activities: [
      {
        id: "act-401",
        time: "09:00 AM",
        title: "Senso-ji Temple & Nakamise Shopping",
        description: "Explore Asakusa's oldest Buddhist temple and traditional crafts.",
        budget: "$45",
        category: "Culture",
      },
      {
        id: "act-402",
        time: "05:00 PM",
        title: "Shibuya Crossing & Robot Restaurant Experience",
        description: "Neon nightlife and world's busiest pedestrian crossing.",
        budget: "$95",
        category: "Entertainment",
      },
    ],
  },
  {
    id: "trip-bali-005",
    name: "Bali Wellness Retreat",
    destination: "Ubud & Seminyak",
    country: "Indonesia",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    status: "completed",
    budgetTotal: 2200,
    activities: [
      {
        id: "act-501",
        time: "07:00 AM",
        title: "Tegallalang Rice Terrace Sunrise Hike",
        description: "Trekking across emerald green terraced rice paddies.",
        budget: "$30",
        category: "Nature",
      },
      {
        id: "act-502",
        time: "11:00 AM",
        title: "Ubud Herbal Massage & Flower Bath Spa",
        description: "Traditional Balinese wellness massage in jungle sanctuary.",
        budget: "$80",
        category: "Wellness",
      },
    ],
  },
  {
    id: "trip-swiss-003",
    name: "Swiss Alps Adventure",
    destination: "Zermatt & Lucerne",
    country: "Switzerland",
    startDate: "2026-06-10",
    endDate: "2026-06-18",
    status: "completed",
    budgetTotal: 3500,
    activities: [
      {
        id: "act-301",
        time: "09:30 AM",
        title: "Gornergrat Cogwheel Railway to Matterhorn",
        description: "Scenic mountain train ride facing 29 mountain peaks over 4,000m.",
        budget: "$110",
        category: "Nature",
      },
      {
        id: "act-302",
        time: "02:00 PM",
        title: "Traditional Swiss Cheese Fondue & Wine",
        description: "Authentic fondue tasting in Zermatt alpine village.",
        budget: "$75",
        category: "Dining",
      },
    ],
  },
  {
    id: "trip-santorini-006",
    name: "Santorini Sunset Odyssey",
    destination: "Santorini",
    country: "Greece",
    startDate: "2026-05-20",
    endDate: "2026-05-28",
    status: "completed",
    budgetTotal: 3100,
    activities: [
      {
        id: "act-601",
        time: "04:30 PM",
        title: "Oia Cliffside Wine Tasting & Sunset Watch",
        description: "Volcanic wine tasting overlooking Aegean caldera at golden hour.",
        budget: "$105",
        category: "Lifestyle",
      },
    ],
  },
];

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function TripCalendarPage() {
  // Calendar View Date State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed)

  // Filter & Search Controls matching Wireframe Screen 11
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("date");
  const [groupByOption, setGroupByOption] = useState<string>("none");
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");

  // Trips data state
  const [trips, setTrips] = useState<CalendarTrip[]>(DEFAULT_SAMPLE_TRIPS);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<CalendarTrip | null>(null);

  // Quick edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CalendarActivity | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityTime, setNewActivityTime] = useState("10:00 AM");
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [newActivityBudget, setNewActivityBudget] = useState("$50");
  const [newActivityCategory, setNewActivityCategory] = useState("Sightseeing");

  // Fetch real trips from database
  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/my-trips");
        if (res.ok) {
          const data = await res.json();
          if (data?.trips && data.trips.length > 0) {
            const mapped: CalendarTrip[] = data.trips.map((t: any) => ({
              id: t.id,
              name: `${t.place} Trip`,
              destination: t.place,
              country: t.place.includes(",") ? t.place.split(",")[1].trim() : "Global",
              startDate: t.startDate.split("T")[0],
              endDate: t.endDate.split("T")[0],
              status:
                new Date(t.endDate) < new Date()
                  ? "completed"
                  : new Date(t.startDate) <= new Date()
                  ? "in-progress"
                  : "upcoming",
              budgetTotal: t.totalBudget || 2500,
              activities: t.suggestions
                ? t.suggestions.map((s: any, idx: number) => ({
                    id: `act-db-${t.id}-${idx}`,
                    time: `${9 + (idx % 4) * 2}:00 AM`,
                    title: s.title || "Planned Activity",
                    description: s.description || "Explore recommended spot.",
                    budget: `$${50 + idx * 25}`,
                    category: "Explore",
                  }))
                : [
                    {
                      id: `act-db-${t.id}-0`,
                      time: "10:00 AM",
                      title: `Explore ${t.place}`,
                      description: "Guided destination tour and city sightseeing.",
                      budget: "$100",
                      category: "Sightseeing",
                    },
                  ],
            }));
            setTrips(mapped);
          }
        }
      } catch (err) {
        console.warn("Using sample trip calendar data:", err);
      }
    }
    loadTrips();
  }, []);

  // Filtered & Sorted trips
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.activities.some((a) => a.title.toLowerCase().includes(q))
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    result.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "budget") {
        return b.budgetTotal - a.budgetTotal;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return result;
  }, [trips, searchQuery, filterStatus, sortOption]);

  // Trip Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalTrips = filteredTrips.length;
    const totalBudget = filteredTrips.reduce((acc, t) => acc + t.budgetTotal, 0);
    const upcoming = filteredTrips.filter((t) => t.status === "upcoming").length;
    const inProgress = filteredTrips.filter((t) => t.status === "in-progress").length;
    const completed = filteredTrips.filter((t) => t.status === "completed").length;

    return {
      totalTrips,
      totalBudgetFormatted: `$${totalBudget.toLocaleString()}`,
      upcoming,
      inProgress,
      completed,
    };
  }, [filteredTrips]);

  // Calendar Math Helpers
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const monthMatrix = useMemo(() => {
    const matrix: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      matrix.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      matrix.push(day);
    }
    while (matrix.length % 7 !== 0) {
      matrix.push(null);
    }
    return matrix;
  }, [firstDayOfWeek, daysInMonth]);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Helper to format date YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Trips falling on a specific date
  const getTripsForDate = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    return filteredTrips.filter((t) => {
      const s = new Date(t.startDate).getTime();
      const e = new Date(t.endDate).getTime();
      return target >= s && target <= e;
    });
  };

  // Activity Edit Handlers
  const handleOpenAddActivity = (dayStr: string, trip: CalendarTrip) => {
    setSelectedDayDate(dayStr);
    setSelectedTrip(trip);
    setEditingActivity(null);
    setNewActivityTitle("");
    setNewActivityTime("10:00 AM");
    setNewActivityDesc("");
    setNewActivityBudget("$50");
    setNewActivityCategory("Sightseeing");
    setIsEditModalOpen(true);
  };

  const handleOpenEditActivity = (act: CalendarActivity, trip: CalendarTrip) => {
    setSelectedTrip(trip);
    setEditingActivity(act);
    setNewActivityTitle(act.title);
    setNewActivityTime(act.time);
    setNewActivityDesc(act.description);
    setNewActivityBudget(act.budget);
    setNewActivityCategory(act.category || "Sightseeing");
    setIsEditModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !newActivityTitle.trim()) return;

    if (editingActivity) {
      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (t.id !== selectedTrip.id) return t;
          return {
            ...t,
            activities: t.activities.map((a) =>
              a.id === editingActivity.id
                ? {
                    ...a,
                    title: newActivityTitle.trim(),
                    time: newActivityTime,
                    description: newActivityDesc.trim(),
                    budget: newActivityBudget.trim(),
                    category: newActivityCategory,
                  }
                : a
            ),
          };
        })
      );
    } else {
      const newAct: CalendarActivity = {
        id: `act-custom-${Date.now()}`,
        time: newActivityTime,
        title: newActivityTitle.trim(),
        description: newActivityDesc.trim(),
        budget: newActivityBudget.trim(),
        category: newActivityCategory,
      };

      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (t.id !== selectedTrip.id) return t;
          return {
            ...t,
            activities: [...t.activities, newAct],
          };
        })
      );
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteActivity = (actId: string, tripId: string) => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          activities: t.activities.filter((a) => a.id !== actId),
        };
      })
    );
  };

  const handleMoveActivity = (tripId: string, actIndex: number, direction: "up" | "down") => {
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;
        const newActs = [...t.activities];
        const targetIndex = direction === "up" ? actIndex - 1 : actIndex + 1;
        if (targetIndex < 0 || targetIndex >= newActs.length) return t;

        const temp = newActs[actIndex];
        newActs[actIndex] = newActs[targetIndex];
        newActs[targetIndex] = temp;

        return { ...t, activities: newActs };
      })
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top Navigation ── */}
      <TopNav />

      {/* ── Page Header (Dark Band) ── */}
      <section
        id="calendar-hero"
        style={{
          backgroundColor: "var(--surface-dark)",
          padding: "48px 0 36px",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Screen 11 • Calendar View
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "var(--on-dark)",
                margin: "0 0 8px 0",
              }}
            >
              Trip Calendar & Timeline
            </h1>
            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                color: "var(--on-dark-soft)",
                margin: 0,
                maxWidth: 580,
              }}
            >
              Visualize your daily travel plans, reorder activities, and manage full itinerary flow.
            </p>
          </div>

          {/* View Switcher Toggle */}
          <div
            className="flex items-center p-1 bg-black/40 border border-white/20"
            style={{ borderRadius: 0 }}
          >
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-[#1c69d4] text-white"
                  : "bg-transparent text-white/70 hover:text-white"
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-[#1c69d4] text-white"
                  : "bg-transparent text-white/70 hover:text-white"
              }`}
            >
              Timeline Flow
            </button>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Controls Toolbar (Matching Screen 11 Wireframe) ── */}
      <div
        id="calendar-toolbar"
        className="max-w-[1440px] mx-auto px-6 lg:px-10"
        style={{ paddingTop: 24 }}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* 1. Search Bar */}
          <div className="relative flex-1">
            <svg
              className="absolute top-1/2 -translate-y-1/2 left-3.5 w-4 h-4 text-[var(--muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="calendar-search-input"
              type="text"
              placeholder="Search bar ..... (search trip, place, activity)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-[var(--canvas)] text-[var(--ink)] text-sm font-light border border-[var(--hairline-strong)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* 2. Controls Row (Group by, Filter, Sort by...) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Group by */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-soft)] px-3 py-2 border border-[var(--hairline)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Group by:</span>
              <select
                value={groupByOption}
                onChange={(e) => setGroupByOption(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--ink)] border-none focus:outline-none cursor-pointer"
              >
                <option value="none">None</option>
                <option value="status">Status</option>
                <option value="destination">Destination</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-soft)] px-3 py-2 border border-[var(--hairline)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--ink)] border-none focus:outline-none cursor-pointer"
              >
                <option value="all">All Trips</option>
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort by... */}
            <div className="flex items-center gap-1.5 bg-[var(--surface-soft)] px-3 py-2 border border-[var(--hairline)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--ink)] border-none focus:outline-none cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="budget">Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Metric Summary Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 p-4 bg-[var(--surface-soft)] border border-[var(--hairline)] text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-bold text-[var(--muted)] uppercase tracking-wider">Total Scheduled Trips: </span>
              <span className="font-bold text-[var(--ink)] text-sm">{summaryMetrics.totalTrips}</span>
            </div>
            <div>
              <span className="font-bold text-[var(--muted)] uppercase tracking-wider">Total Planned Budget: </span>
              <span className="font-bold text-[var(--ink)] text-sm">{summaryMetrics.totalBudgetFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-[#1c69d4]/10 text-[#1c69d4] font-bold border border-[#1c69d4]/30">
              {summaryMetrics.upcoming} Upcoming
            </span>
            <span className="px-2 py-1 bg-[#d97706]/10 text-[#d97706] font-bold border border-[#d97706]/30">
              {summaryMetrics.inProgress} In Progress
            </span>
            <span className="px-2 py-1 bg-[#16a34a]/10 text-[#16a34a] font-bold border border-[#16a34a]/30">
              {summaryMetrics.completed} Completed
            </span>
          </div>
        </div>
      </div>

      {/* ── Main View Content (Calendar or Timeline) ── */}
      <main className="max-w-[1440px] mx-auto p-6">
        {viewMode === "calendar" ? (
          /* ── Screen 11 Month Calendar Component ── */
          <div className="bg-white border border-[var(--hairline-strong)] shadow-sm">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--hairline)]">
              <button
                onClick={prevMonth}
                className="w-10 h-10 flex items-center justify-center border border-[var(--hairline-strong)] text-[var(--ink)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer text-lg font-bold"
                title="Previous Month"
              >
                ←
              </button>

              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={resetToToday}
                  className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-[var(--hairline-strong)] text-[var(--primary)] hover:bg-[#1c69d4]/10 transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              <button
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center border border-[var(--hairline-strong)] text-[var(--ink)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer text-lg font-bold"
                title="Next Month"
              >
                →
              </button>
            </div>

            {/* 7-Column Day Header (SUN, MON, TUE, WED, THU, FRI, SAT) */}
            <div className="grid grid-cols-7 border-b border-[var(--hairline)] bg-[var(--surface-soft)] text-center text-xs font-bold uppercase tracking-widest text-[var(--muted)] py-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Month Calendar Grid Cells */}
            <div className="grid grid-cols-7 auto-rows-fr border-l border-t border-[var(--hairline)]">
              {monthMatrix.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[120px] bg-[#fafafa] border-r border-b border-[var(--hairline)]"
                    />
                  );
                }

                const dateStr = formatDateString(currentYear, currentMonth, day);
                const dayTrips = getTripsForDate(dateStr);
                const todayStr = new Date().toISOString().split("T")[0];
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => {
                      setSelectedDayDate(dateStr);
                      if (dayTrips.length > 0) setSelectedTrip(dayTrips[0]);
                    }}
                    className={`min-h-[120px] p-2 border-r border-b border-[var(--hairline)] transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isToday ? "bg-[#f0f7ff]" : "hover:bg-[#fafafa]"
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-[#1c69d4] text-white"
                            : "text-[var(--ink)] group-hover:text-[#1c69d4]"
                        }`}
                      >
                        {day}
                      </span>
                      {dayTrips.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          {dayTrips.length} {dayTrips.length === 1 ? "trip" : "trips"}
                        </span>
                      )}
                    </div>

                    {/* Trip Badges for this day */}
                    <div className="flex flex-col gap-1 overflow-hidden flex-1">
                      {dayTrips.map((t) => {
                        const statusColors = {
                          upcoming: "bg-[#1c69d4] text-white",
                          "in-progress": "bg-[#d97706] text-white",
                          completed: "bg-[#16a34a] text-white",
                        };

                        return (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayDate(dateStr);
                              setSelectedTrip(t);
                            }}
                            className={`p-1.5 text-[11px] font-bold uppercase tracking-wider truncate shadow-sm transition-transform hover:scale-102 ${statusColors[t.status]}`}
                            title={`${t.name} (${t.startDate} to ${t.endDate})`}
                          >
                            {t.name}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Activity Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dayTrips.length > 0) {
                          handleOpenAddActivity(dateStr, dayTrips[0]);
                        } else {
                          setSelectedDayDate(dateStr);
                        }
                      }}
                      className="mt-1 opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] border border-[var(--primary)] bg-white p-1 text-center transition-all cursor-pointer"
                    >
                      + Add Plan
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Vertical Timeline Flow View ── */
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-[var(--hairline-strong)] p-6 shadow-sm relative animate-fadeIn"
              >
                {/* Timeline Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--hairline)] pb-4 mb-6 gap-2">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-1 ${
                        trip.status === "upcoming"
                          ? "bg-[#1c69d4]"
                          : trip.status === "in-progress"
                          ? "bg-[#d97706]"
                          : "bg-[#16a34a]"
                      }`}
                    >
                      {trip.status}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--ink)]">{trip.name}</h3>
                    <p className="text-xs font-light text-[var(--muted)]">
                      {trip.destination}, {trip.country} • {trip.startDate} to {trip.endDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--ink)]">
                      Budget: ${trip.budgetTotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleOpenAddActivity(trip.startDate, trip)}
                      className="px-3 py-1.5 bg-[#1c69d4] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#0653b6]"
                    >
                      + Add Activity
                    </button>
                  </div>
                </div>

                {/* Timeline Activities List */}
                <div className="relative pl-6 border-l-2 border-[#1c69d4] space-y-6">
                  {trip.activities.map((act, index) => (
                    <div
                      key={act.id}
                      className="relative bg-[var(--surface-soft)] p-4 border border-[var(--hairline)] hover:border-[var(--primary)] transition-all group"
                    >
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-[#1c69d4] border-2 border-white ring-2 ring-[#1c69d4]/20" />

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--primary)] bg-white px-2 py-0.5 border border-[var(--hairline)]">
                            {act.time}
                          </span>
                          {act.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                              {act.category}
                            </span>
                          )}
                          <h4 className="text-base font-bold text-[var(--ink)]">{act.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-[var(--ink)] bg-white px-2 py-0.5 border border-[var(--hairline)]">
                          {act.budget}
                        </span>
                      </div>

                      <p className="text-xs font-light text-[var(--muted)] mb-3">{act.description}</p>

                      {/* Reorder & Edit Quick Actions */}
                      <div className="flex items-center justify-between border-t border-[var(--hairline)] pt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveActivity(trip.id, index, "up")}
                            disabled={index === 0}
                            className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer border-none bg-transparent"
                            title="Move Up"
                          >
                            Move Up
                          </button>
                          <button
                            onClick={() => handleMoveActivity(trip.id, index, "down")}
                            disabled={index === trip.activities.length - 1}
                            className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 cursor-pointer border-none bg-transparent"
                            title="Move Down"
                          >
                            Move Down
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditActivity(act, trip)}
                            className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] hover:underline cursor-pointer border-none bg-transparent"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id, trip.id)}
                            className="text-[11px] font-bold uppercase tracking-wider text-[#dc2626] hover:underline cursor-pointer border-none bg-transparent"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Expandable Day View / Quick Edit Modal ── */}
      {selectedDayDate && selectedTrip && !isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn p-4"
          style={{ backgroundColor: "rgba(26,33,41,0.65)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white max-w-xl w-full border border-[var(--hairline-strong)] shadow-2xl p-6 relative animate-slideUp">
            <div className="flex justify-between items-start border-b border-[var(--hairline)] pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                  Day Schedule: {selectedDayDate}
                </span>
                <h3 className="text-xl font-bold text-[var(--ink)]">{selectedTrip.name}</h3>
                <p className="text-xs font-light text-[var(--muted)]">
                  {selectedTrip.destination}, {selectedTrip.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--hairline)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Daily Activities List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-6">
              {selectedTrip.activities.length > 0 ? (
                selectedTrip.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 bg-[var(--surface-soft)] border border-[var(--hairline)] flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--primary)]">{act.time}</span>
                        <span className="text-sm font-bold text-[var(--ink)]">{act.title}</span>
                      </div>
                      <p className="text-xs font-light text-[var(--muted)] mt-1">{act.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--ink)]">{act.budget}</span>
                      <button
                        onClick={() => handleOpenEditActivity(act, selectedTrip)}
                        className="text-xs font-bold text-[var(--primary)] cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[var(--muted)]">
                  No activities planned for this day yet.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--hairline)] pt-4">
              <button
                onClick={() => setSelectedDayDate(null)}
                className="px-4 py-2 border border-[var(--hairline-strong)] text-xs font-bold uppercase tracking-wider text-[var(--ink)] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenAddActivity(selectedDayDate, selectedTrip)}
                className="px-4 py-2 bg-[#1c69d4] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#0653b6]"
              >
                + Add New Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Activity Form Modal ── */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn p-4"
          style={{ backgroundColor: "rgba(26,33,41,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white max-w-lg w-full border border-[var(--hairline-strong)] shadow-2xl p-6 relative animate-slideUp">
            <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3 mb-4">
              <h3 className="text-lg font-bold text-[var(--ink)]">
                {editingActivity ? "Edit Activity Item" : "Add Activity to Itinerary"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-lg font-bold text-[var(--muted)] cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eiffel Tower Priority Summit Ticket"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-[var(--hairline-strong)] text-sm font-light focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM"
                    value={newActivityTime}
                    onChange={(e) => setNewActivityTime(e.target.value)}
                    className="w-full h-10 px-3 border border-[var(--hairline-strong)] text-sm font-light focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $85"
                    value={newActivityBudget}
                    onChange={(e) => setNewActivityBudget(e.target.value)}
                    className="w-full h-10 px-3 border border-[var(--hairline-strong)] text-sm font-light focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Category
                </label>
                <select
                  value={newActivityCategory}
                  onChange={(e) => setNewActivityCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-[var(--hairline-strong)] text-sm font-light focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                >
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Culture">Culture & History</option>
                  <option value="Dining">Food & Dining</option>
                  <option value="Nature">Nature & Outdoors</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Wellness">Wellness & Spa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, confirmation numbers, or meeting points..."
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  className="w-full p-3 border border-[var(--hairline-strong)] text-sm font-light focus:outline-none focus:border-[var(--primary)] resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--hairline)] pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[var(--hairline-strong)] text-xs font-bold uppercase tracking-wider text-[var(--ink)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1c69d4] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#0653b6]"
                >
                  {editingActivity ? "Save Changes" : "Add to Itinerary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        id="calendar-footer"
        style={{
          backgroundColor: "var(--surface-soft)",
          padding: "48px 24px",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-[var(--primary)] text-white w-7 h-7 font-bold text-xs">
              GT
            </div>
            <span className="text-sm font-bold text-[var(--ink)]">GlobeTrotter</span>
          </div>
          <p className="text-sm font-light text-[var(--muted)] margin-0">
            © 2026 GlobeTrotter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
