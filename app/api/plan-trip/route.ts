import { streamTripPlan } from "@/app/lib/gemini";
import type { TripPlanRequest } from "@/app/lib/types";

export async function POST(request: Request) {
  try {
    const body: TripPlanRequest = await request.json();

    // ── Validate required fields ──
    if (!body.destination || !body.startDate || !body.endDate) {
      return Response.json(
        { error: "Destination, start date, and end date are required." },
        { status: 400 }
      );
    }

    // ── Create a streaming ReadableStream ──
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamTripPlan(body)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unknown error occurred";
          controller.enqueue(
            encoder.encode(`\n\n---\n\n⚠️ **Error:** ${message}`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate trip plan";
    return Response.json({ error: message }, { status: 500 });
  }
}
