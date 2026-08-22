import { NextRequest } from "next/server";
import { mockTrips } from "@/app/lib/mockData";
import type { Trip } from "@/app/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filter = searchParams.get("filter") ?? "all";
  const sort = searchParams.get("sort") ?? "date";
  const order = searchParams.get("order") ?? "desc";
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  let trips = [...mockTrips];

  // ── Filter by status ──
  if (filter !== "all") {
    trips = trips.filter((t) => t.status === filter);
  }

  // ── Search ──
  if (query) {
    trips = trips.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        t.country.toLowerCase().includes(query)
    );
  }

  // ── Sort ──
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

  return Response.json({ trips });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newTrip: Trip = {
    id: `trip-${Date.now()}`,
    name: body.name ?? "New Trip",
    destination: body.destination ?? "",
    country: body.country ?? "",
    image: body.image ?? "/images/hero-banner.jpg",
    startDate: body.startDate ?? new Date().toISOString().split("T")[0],
    endDate: body.endDate ?? new Date().toISOString().split("T")[0],
    status: "upcoming",
    budget: {
      total: body.budget ?? 0,
      spent: 0,
      currency: "USD",
    },
    travelers: body.travelers ?? 1,
    activities: body.activities ?? [],
  };

  return Response.json({ trip: newTrip }, { status: 201 });
}
