import { NextRequest } from "next/server";
<<<<<<< Updated upstream
import { prisma } from "@/app/lib/db";
import { mockDestinations, mockTrips, mockBudgetSummary } from "@/app/lib/mockData";
import type { DashboardData, Trip, TripStatus, User, BudgetSummary, Destination } from "@/app/lib/types";

// Helper to determine destination region matching from user country
function getUserPreferredRegion(country: string = "", city: string = ""): string {
  const c = country.toLowerCase();
  const ci = city.toLowerCase();

  if (
    c.includes("germany") ||
    c.includes("france") ||
    c.includes("uk") ||
    c.includes("united kingdom") ||
    c.includes("italy") ||
    c.includes("spain") ||
    c.includes("greece") ||
    c.includes("switzerland") ||
    c.includes("europe") ||
    ci.includes("munich") ||
    ci.includes("paris") ||
    ci.includes("london")
  ) {
    return "Europe";
  }

  if (
    c.includes("japan") ||
    c.includes("india") ||
    c.includes("indonesia") ||
    c.includes("thailand") ||
    c.includes("china") ||
    c.includes("asia") ||
    ci.includes("tokyo") ||
    ci.includes("bali") ||
    ci.includes("mumbai") ||
    ci.includes("delhi")
  ) {
    return "Asia";
  }

  if (
    c.includes("united states") ||
    c.includes("usa") ||
    c.includes("canada") ||
    c.includes("america") ||
    ci.includes("new york")
  ) {
    return "North America";
  }

  if (
    c.includes("uae") ||
    c.includes("emirates") ||
    c.includes("dubai") ||
    c.includes("qatar") ||
    c.includes("saudi")
  ) {
    return "Middle East";
  }

  return "Europe";
}
=======
import {
  mockDestinations,
  mockTrips,
  mockBudgetSummary,
} from "@/app/lib/mockData";
import { getUserProfile } from "@/app/actions/profile";
import type { DashboardData, User } from "@/app/lib/types";
>>>>>>> Stashed changes

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const filter = searchParams.get("filter") ?? "all";
  const sort = searchParams.get("sort") ?? "name";
  const order = searchParams.get("order") ?? "asc";
  const reqUserId = searchParams.get("userId") || request.cookies.get("gt_user_id")?.value;

<<<<<<< Updated upstream
  let activeUser: any = null;

  try {
    if (reqUserId) {
      activeUser = await prisma.user.findUnique({
        where: { id: reqUserId },
      });
    }

    if (!activeUser) {
      // Fallback to latest created user in database
      activeUser = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.warn("DB user lookup error in dashboard route:", err);
=======
  // ── Fetch Synchronized User Profile ──
  const profileRes = await getUserProfile();
  const profileUser = profileRes.user;

  const user: User = {
    id: profileUser?.id || "user-001",
    name: `${profileUser?.firstName || "Priyanshu"} ${profileUser?.lastName || "Sharma"}`,
    firstName: profileUser?.firstName || "Priyanshu",
    email: profileUser?.email || "priyanshu@globetrotter.com",
    avatar: profileUser?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    memberSince: profileUser?.memberSince || "March 2024",
    tripsCompleted: profileUser?.tripsCount || 6,
  };

  // ── Filter destinations by search query ──
  let destinations = [...mockDestinations];
  if (query) {
    destinations = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query) ||
        d.region.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query))
    );
>>>>>>> Stashed changes
  }

  // Define User profile
  const userProfile: User & { firstName?: string; lastName?: string; city?: string; country?: string; stats?: any } = activeUser
    ? {
        id: activeUser.id,
        name: `${activeUser.firstName} ${activeUser.lastName || ""}`.trim(),
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        email: activeUser.email,
        memberSince: activeUser.createdAt
          ? new Date(activeUser.createdAt).toISOString().split("T")[0]
          : "2026-01-01",
        tripsCompleted: 0,
        city: activeUser.city,
        country: activeUser.country,
      }
    : {
        id: "user-default",
        name: "Yashesh Mehta",
        firstName: "Yashesh",
        lastName: "Mehta",
        email: "yashesh@globetrotter.com",
        memberSince: "2024-03-15",
        tripsCompleted: 7,
        city: "Munich",
        country: "Germany",
      };

  // ── Regional Selections (personalized by user's city/country) ──
  const preferredRegion = getUserPreferredRegion(userProfile.country, userProfile.city);

  let destinations: Destination[] = mockDestinations.map((d) => {
    const isPreferred = d.region.toLowerCase() === preferredRegion.toLowerCase();
    return {
      ...d,
      description: isPreferred
        ? `[Top Regional Selection for ${userProfile.country || preferredRegion}] ${d.description}`
        : d.description,
    };
  });

  // Sort destinations: put preferred region first, then selected sort field
  destinations.sort((a, b) => {
    const aMatch = a.region.toLowerCase() === preferredRegion.toLowerCase();
    const bMatch = b.region.toLowerCase() === preferredRegion.toLowerCase();

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;

    let cmp = 0;
    switch (sort) {
      case "rating":
        cmp = a.rating - b.rating;
        break;
      case "budget":
        cmp = a.budgetRange.min - b.budgetRange.min;
        break;
      case "name":
      default:
        cmp = a.name.localeCompare(b.name);
    }
    return order === "desc" ? -cmp : cmp;
  });

  if (query) {
    destinations = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query) ||
        d.region.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // ── User Specific Trips & Budget Data ──
  let userTrips: Trip[] = [];

  if (activeUser?.id) {
    try {
      const dbTrips = await prisma.trip.findMany({
        where: { userId: activeUser.id },
        include: { itinerarySections: true },
        orderBy: { startDate: "asc" },
      });

      if (dbTrips.length > 0) {
        userTrips = dbTrips.map((dt) => {
          let spent = 0;
          for (const sec of dt.itinerarySections) {
            const val = parseFloat(sec.budget.replace(/[^0-9.]/g, ""));
            if (!isNaN(val)) spent += val;
          }
          const totalBudget = spent > 0 ? Math.round(spent * 1.25) : 2500;

          const now = new Date();
          const start = new Date(dt.startDate);
          const end = new Date(dt.endDate);

          let status: TripStatus = "upcoming";
          if (end < now) {
            status = "completed";
            spent = spent || totalBudget * 0.9;
          } else if (start <= now && end >= now) {
            status = "in-progress";
            spent = spent || totalBudget * 0.45;
          }

          let activities: string[] = ["Sightseeing", "Local Cuisine", "Guided Exploration"];
          if (dt.suggestions) {
            try {
              const parsed = JSON.parse(dt.suggestions);
              if (Array.isArray(parsed) && parsed.length > 0) {
                activities = parsed.map((item: any) => item.title || item.name).slice(0, 4);
              }
            } catch {}
          }

          return {
            id: dt.id,
            name: `${dt.place} Journey`,
            destination: dt.place,
            country: dt.place.includes(",") ? dt.place.split(",")[1].trim() : "International",
            image: dt.place.toLowerCase().includes("paris")
              ? "/images/trip-paris.jpg"
              : dt.place.toLowerCase().includes("bali")
              ? "/images/trip-bali.jpg"
              : dt.place.toLowerCase().includes("switzerland")
              ? "/images/trip-switzerland.jpg"
              : dt.place.toLowerCase().includes("tokyo")
              ? "/images/trip-japan.jpg"
              : dt.place.toLowerCase().includes("santorini")
              ? "/images/dest-santorini.jpg"
              : "/images/dest-dubai.jpg",
            startDate: dt.startDate.toISOString().split("T")[0],
            endDate: dt.endDate.toISOString().split("T")[0],
            status,
            budget: {
              total: totalBudget,
              spent: Math.round(spent),
              currency: "USD",
            },
            travelers: 2,
            activities,
          };
        });
      }
    } catch (err) {
      console.warn("Error fetching user trips from DB:", err);
    }
  }

  // If user has no DB trips yet, seed/provide default starter trips for their account
  if (userTrips.length === 0) {
    userTrips = [...mockTrips];
  }

  // Calculate dynamic stats
  const completedTripsCount = userTrips.filter((t) => t.status === "completed").length;
  const uniqueCountries = Array.from(new Set(userTrips.map((t) => t.country))).length;
  const calculatedTotalSpent = userTrips.reduce((acc, t) => acc + (t.budget.spent || 0), 0);
  const calculatedTotalBudget = userTrips.reduce((acc, t) => acc + (t.budget.total || 0), 0);
  const calculatedRemaining = Math.max(0, calculatedTotalBudget - calculatedTotalSpent);

  userProfile.tripsCompleted = completedTripsCount;

  // Format spent text for hero banner (e.g. $6.3K)
  const spentInK = (calculatedTotalSpent / 1000).toFixed(1);
  const totalSpentFormatted = `$${spentInK}K`;

  userProfile.stats = {
    tripsCompleted: completedTripsCount || userTrips.length,
    countriesVisited: uniqueCountries || 4,
    totalSpentFormatted,
  };

  // Filter & sort trips
  let filteredTrips = [...userTrips];
  if (filter !== "all") {
    filteredTrips = filteredTrips.filter((t) => t.status === filter);
  }
  if (query) {
    filteredTrips = filteredTrips.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        t.country.toLowerCase().includes(query)
    );
  }

  filteredTrips.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "date":
        cmp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case "budget":
        cmp = a.budget.total - b.budget.total;
        break;
      case "name":
      default:
        cmp = a.name.localeCompare(b.name);
    }
    return order === "desc" ? -cmp : cmp;
  });

<<<<<<< Updated upstream
  // Calculate dynamic budget summary
  const budgetSummary: BudgetSummary = {
    totalBudget: calculatedTotalBudget || mockBudgetSummary.totalBudget,
    totalSpent: calculatedTotalSpent || mockBudgetSummary.totalSpent,
    remaining: calculatedRemaining || mockBudgetSummary.remaining,
    currency: "USD",
    categoryBreakdown: [
      { category: "Flights & Travel", amount: Math.round(calculatedTotalSpent * 0.38) },
      { category: "Hotels & Lodging", amount: Math.round(calculatedTotalSpent * 0.30) },
      { category: "Food & Dining", amount: Math.round(calculatedTotalSpent * 0.16) },
      { category: "Activities & Tours", amount: Math.round(calculatedTotalSpent * 0.11) },
      { category: "Local Transport", amount: Math.round(calculatedTotalSpent * 0.05) },
    ],
  };

  const data: DashboardData & { preferredRegion?: string } = {
    user: userProfile,
=======
  const data: DashboardData = {
    user,
>>>>>>> Stashed changes
    destinations,
    trips: filteredTrips,
    budgetSummary,
    preferredRegion,
  };

  return Response.json(data);
}
