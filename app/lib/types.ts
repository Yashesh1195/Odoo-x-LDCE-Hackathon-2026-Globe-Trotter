// ── GlobeTrotter Shared Types ──────────────────────────────────────

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  image: string;
  rating: number;
  reviewCount: number;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  description: string;
  highlights: string[];
}

export type TripStatus = "completed" | "upcoming" | "in-progress";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  country: string;
  image: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget: {
    total: number;
    spent: number;
    currency: string;
  };
  travelers: number;
  activities: string[];
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatar?: string;
  memberSince: string;
  tripsCompleted: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  currency: string;
  categoryBreakdown: {
    category: string;
    amount: number;
  }[];
}

export interface DashboardData {
  user: User;
  destinations: Destination[];
  trips: Trip[];
  budgetSummary: BudgetSummary;
}

export type SortField = "name" | "rating" | "budget" | "date";
export type SortOrder = "asc" | "desc";
export type FilterOption = "all" | "completed" | "upcoming" | "in-progress";
export type GroupOption = "none" | "region" | "status" | "month";

// ── AI Trip Planner Types ──────────────────────────────────────────

export type BudgetLevel = "budget" | "moderate" | "comfortable" | "luxury" | "ultra-luxury";
export type TripPace = "relaxed" | "moderate" | "packed";

export const INTEREST_OPTIONS = [
  "Culture & History",
  "Food & Dining",
  "Adventure & Outdoors",
  "Nature & Wildlife",
  "Shopping",
  "Nightlife",
  "Photography",
  "Wellness & Spa",
  "Art & Museums",
  "Architecture",
  "Local Experiences",
  "Beach & Water Sports",
] as const;

export type Interest = (typeof INTEREST_OPTIONS)[number];

export interface TripPlanRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetLevel: BudgetLevel;
  pace: TripPace;
  interests: Interest[];
  specialRequests: string;
}
