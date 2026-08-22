import { NextRequest } from "next/server";
import {
  mockUser,
  mockDestinations,
  mockTrips,
  mockBudgetSummary,
} from "@/app/lib/mockData";
import type { DashboardData } from "@/app/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const filter = searchParams.get("filter") ?? "all";
  const sort = searchParams.get("sort") ?? "name";
  const order = searchParams.get("order") ?? "asc";

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
  }

  // ── Sort destinations ──
  destinations.sort((a, b) => {
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

  // ── Filter trips ──
  let trips = [...mockTrips];
  if (filter !== "all") {
    trips = trips.filter((t) => t.status === filter);
  }
  if (query) {
    trips = trips.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query)
    );
  }

  // ── Sort trips ──
  trips.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "date":
        cmp =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
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

  const data: DashboardData = {
    user: mockUser,
    destinations,
    trips,
    budgetSummary: mockBudgetSummary,
  };

  return Response.json(data);
}
