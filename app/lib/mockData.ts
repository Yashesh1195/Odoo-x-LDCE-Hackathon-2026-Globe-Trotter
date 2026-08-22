import type { Destination, Trip, User, BudgetSummary } from "./types";

// ── Mock User ──────────────────────────────────────────────────────

export const mockUser: User = {
  id: "user-001",
  name: "Yashesh Mehta",
  firstName: "Yashesh",
  email: "yashesh@globetrotter.com",
  memberSince: "2024-03-15",
  tripsCompleted: 7,
};

// ── Mock Destinations ──────────────────────────────────────────────

export const mockDestinations: Destination[] = [
  {
    id: "dest-001",
    name: "Paris",
    country: "France",
    region: "Europe",
    image: "/images/dest-paris.jpg",
    rating: 4.8,
    reviewCount: 12480,
    budgetRange: { min: 1200, max: 3500, currency: "USD" },
    tags: ["Romantic", "Culture", "Food", "Art"],
    description:
      "The City of Light captivates with iconic landmarks, world-class museums, and unmatched culinary experiences along the Seine.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre", "Seine Cruise"],
  },
  {
    id: "dest-002",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    image: "/images/dest-tokyo.jpg",
    rating: 4.9,
    reviewCount: 9870,
    budgetRange: { min: 1500, max: 4000, currency: "USD" },
    tags: ["Technology", "Culture", "Food", "Adventure"],
    description:
      "A dazzling fusion of ultra-modern technology and centuries-old tradition — from neon-lit Shibuya to serene Meiji Shrine.",
    highlights: ["Shibuya Crossing", "Senso-ji Temple", "Akihabara", "Tsukiji Market"],
  },
  {
    id: "dest-003",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    image: "/images/dest-bali.jpg",
    rating: 4.7,
    reviewCount: 15320,
    budgetRange: { min: 800, max: 2500, currency: "USD" },
    tags: ["Beach", "Wellness", "Nature", "Adventure"],
    description:
      "Lush rice terraces, sacred temples, and pristine beaches make Bali the ultimate island paradise for relaxation and adventure.",
    highlights: ["Tegallalang Rice Terraces", "Uluwatu Temple", "Ubud", "Seminyak Beach"],
  },
  {
    id: "dest-004",
    name: "New York",
    country: "United States",
    region: "North America",
    image: "/images/dest-newyork.jpg",
    rating: 4.6,
    reviewCount: 18940,
    budgetRange: { min: 1800, max: 5000, currency: "USD" },
    tags: ["Urban", "Culture", "Food", "Shopping"],
    description:
      "The city that never sleeps offers Broadway shows, iconic skyline views, world-class dining, and endless urban energy.",
    highlights: ["Central Park", "Times Square", "Brooklyn Bridge", "Statue of Liberty"],
  },
  {
    id: "dest-005",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    image: "/images/dest-santorini.jpg",
    rating: 4.9,
    reviewCount: 8760,
    budgetRange: { min: 1400, max: 3800, currency: "USD" },
    tags: ["Romantic", "Beach", "Photography", "Food"],
    description:
      "Iconic white-and-blue architecture perched on volcanic cliffs above the deep blue Aegean — a picture-perfect Mediterranean gem.",
    highlights: ["Oia Sunset", "Caldera View", "Red Beach", "Wine Tasting"],
  },
  {
    id: "dest-006",
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    image: "/images/dest-dubai.jpg",
    rating: 4.5,
    reviewCount: 11250,
    budgetRange: { min: 2000, max: 6000, currency: "USD" },
    tags: ["Luxury", "Shopping", "Adventure", "Architecture"],
    description:
      "A futuristic metropolis rising from the desert — record-breaking skyscrapers, luxury shopping, and Arabian desert adventures.",
    highlights: ["Burj Khalifa", "Dubai Mall", "Desert Safari", "Palm Jumeirah"],
  },
];

// ── Mock Trips ─────────────────────────────────────────────────────

export const mockTrips: Trip[] = [
  {
    id: "trip-001",
    name: "Parisian Autumn",
    destination: "Paris",
    country: "France",
    image: "/images/trip-paris.jpg",
    startDate: "2026-09-15",
    endDate: "2026-09-22",
    status: "upcoming",
    budget: { total: 2800, spent: 450, currency: "USD" },
    travelers: 2,
    activities: ["Museum Tours", "River Cruise", "Wine Tasting", "Photography Walk"],
  },
  {
    id: "trip-002",
    name: "Bali Retreat",
    destination: "Bali",
    country: "Indonesia",
    image: "/images/trip-bali.jpg",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    status: "completed",
    budget: { total: 2200, spent: 1980, currency: "USD" },
    travelers: 2,
    activities: ["Temple Visit", "Rice Terrace Trek", "Surf Lessons", "Spa Day"],
  },
  {
    id: "trip-003",
    name: "Swiss Alps Adventure",
    destination: "Switzerland",
    country: "Switzerland",
    image: "/images/trip-switzerland.jpg",
    startDate: "2026-06-10",
    endDate: "2026-06-18",
    status: "completed",
    budget: { total: 3500, spent: 3280, currency: "USD" },
    travelers: 4,
    activities: ["Hiking", "Skiing", "Cheese Tasting", "Train Rides"],
  },
  {
    id: "trip-004",
    name: "Tokyo Discovery",
    destination: "Tokyo",
    country: "Japan",
    image: "/images/trip-japan.jpg",
    startDate: "2026-10-05",
    endDate: "2026-10-14",
    status: "upcoming",
    budget: { total: 3800, spent: 600, currency: "USD" },
    travelers: 1,
    activities: ["Temple Tour", "Street Food", "Anime District", "Cherry Blossom"],
  },
  {
    id: "trip-005",
    name: "Dubai Desert Escape",
    destination: "Dubai",
    country: "United Arab Emirates",
    image: "/images/dest-dubai.jpg",
    startDate: "2026-08-18",
    endDate: "2026-08-28",
    status: "in-progress",
    budget: { total: 4200, spent: 1850, currency: "USD" },
    travelers: 3,
    activities: ["Desert Safari", "Burj Khalifa Visit", "Luxury Shopping", "Dhow Cruise"],
  },
  {
    id: "trip-006",
    name: "Santorini Sunset",
    destination: "Santorini",
    country: "Greece",
    image: "/images/dest-santorini.jpg",
    startDate: "2026-05-20",
    endDate: "2026-05-28",
    status: "completed",
    budget: { total: 3100, spent: 2940, currency: "USD" },
    travelers: 2,
    activities: ["Caldera Hike", "Wine Tasting", "Beach Day", "Sunset Photography"],
  },
];

// ── Budget Summary ─────────────────────────────────────────────────

export const mockBudgetSummary: BudgetSummary = {
  totalBudget: 12300,
  totalSpent: 6310,
  remaining: 5990,
  currency: "USD",
  categoryBreakdown: [
    { category: "Flights", amount: 2450 },
    { category: "Hotels", amount: 1890 },
    { category: "Food & Dining", amount: 980 },
    { category: "Activities", amount: 650 },
    { category: "Transport", amount: 340 },
  ],
};
