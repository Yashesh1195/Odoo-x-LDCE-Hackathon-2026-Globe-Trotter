import { NextRequest } from "next/server";
import { mockDestinations } from "@/app/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const region = searchParams.get("region") ?? "all";
  const sort = searchParams.get("sort") ?? "rating";
  const order = searchParams.get("order") ?? "desc";

  let destinations = [...mockDestinations];

  // ── Filter by region ──
  if (region !== "all") {
    destinations = destinations.filter(
      (d) => d.region.toLowerCase() === region.toLowerCase()
    );
  }

  // ── Search ──
  if (query) {
    destinations = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.country.toLowerCase().includes(query) ||
        d.region.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // ── Sort ──
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

  return Response.json({ destinations });
}
