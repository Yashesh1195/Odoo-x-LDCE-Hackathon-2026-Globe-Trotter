import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_hackathon"
);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("q")?.toLowerCase() ?? "";
  const sort = searchParams.get("sort") ?? "date";
  const order = searchParams.get("order") ?? "asc";

  const token = request.cookies.get("auth_token")?.value;
  let tokenUserId: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      tokenUserId = (payload?.userId as string) || null;
    } catch {}
  }
  const reqUserId = tokenUserId || searchParams.get("userId") || request.cookies.get("gt_user_id")?.value;

  try {
    const trips = await prisma.trip.findMany({
      where: reqUserId && !reqUserId.startsWith("demo-") ? { userId: reqUserId } : undefined,
      include: {
        itinerarySections: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy:
        sort === "date"
          ? { startDate: order === "desc" ? "desc" : "asc" }
          : sort === "name"
            ? { place: order === "desc" ? "desc" : "asc" }
            : { startDate: "asc" },
    });

    // Filter by search query if provided
    let filtered = trips;
    if (query) {
      filtered = trips.filter(
        (t) =>
          t.place.toLowerCase().includes(query) ||
          (t.suggestions && t.suggestions.toLowerCase().includes(query))
      );
    }

    // Map DB trips to a frontend-friendly shape
    const mappedTrips = filtered.map((trip) => {
      // Parse suggestions JSON to extract activity titles
      let suggestions: { title: string; description: string }[] = [];
      if (trip.suggestions) {
        try {
          suggestions = JSON.parse(trip.suggestions);
        } catch {
          suggestions = [];
        }
      }

      // Compute total budget from itinerary sections
      let totalBudget = 0;
      for (const section of trip.itinerarySections) {
        const num = parseFloat(section.budget.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) totalBudget += num;
      }

      return {
        id: trip.id,
        place: trip.place,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        suggestions,
        totalBudget,
        sectionCount: trip.itinerarySections.length,
        createdAt: trip.createdAt.toISOString(),
      };
    });

    return Response.json({ trips: mappedTrips });
  } catch (error) {
    console.error("Failed to fetch trips from DB:", error);
    return Response.json({ trips: [] });
  }
}
