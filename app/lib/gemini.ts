import { GoogleGenAI } from "@google/genai";
import type { TripPlanRequest } from "./types";

// ── Gemini Client Singleton ────────────────────────────────────────

let _client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Please configure GEMINI_API_KEY in your .env file."
      );
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

// ── Strictly 2-Model Fallback Chain ─────────────────────────────────
// Primary: gemini-3.5-flash-lite (or gemini-2.5-flash-lite)
// Fallback: gemini-3.1-flash-lite (or gemini-2.0-flash-lite)
export const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
];

// ── Prompt Builders ─────────────────────────────────────────────────

function computeTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 1);
}

export function buildTripPlanPrompt(request: TripPlanRequest): string {
  const days = computeTripDays(request.startDate, request.endDate);

  return `You are GlobeTrotter AI — a world-class travel planner. Create an authentic, step-by-step, day-by-day itinerary for:
- Destination: ${request.destination}
- Dates: ${request.startDate} to ${request.endDate} (${days} days)
- Travelers: ${request.travelers}
- Budget: ${request.budgetLevel}
- Pace: ${request.pace}
- Interests: ${request.interests.join(", ")}

Generate a complete, structured itinerary with:
1. Trip Overview & Highlights
2. Quick Facts Table (Currency, Best Time, Transport)
3. Step-by-Step Day-by-Day breakdown for all ${days} days with Morning, Afternoon, Evening activities and realistic estimated budgets.
4. Total Budget Breakdown Table.

Format cleanly in Markdown with bold headers and bullet points. No emojis.`;
}

// ── Streaming Generation with 2-Model Fallback ───────────────────────

export async function* streamTripPlan(
  request: TripPlanRequest
): AsyncGenerator<string> {
  const client = getClient();
  const prompt = buildTripPlanPrompt(request);

  let lastError: unknown = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const stream = await client.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
      return;
    } catch (err) {
      console.warn(`Model ${modelName} failed, trying fallback...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Both Gemini flash-lite models failed.");
}

// ── Interactive Chat Stream with 2-Model Fallback ───────────────────

export async function* streamChatMessages(
  messages: { role: "user" | "model" | "system"; content: string }[]
): AsyncGenerator<string> {
  const client = getClient();

  const systemInstruction = `You are GlobeTrotter AI Concierge — an expert conversational trip planner.
When the user asks to plan a trip (e.g. to Shimla, Gujarat, Paris, Kashmir, etc.), converse naturally and provide:
1. An inspiring summary of the destination.
2. A clear, step-by-step Day-by-Day itinerary with Morning, Afternoon, Evening activities.
3. Realistic estimated budget per section.
4. Local food and landmark recommendations.

Keep your tone sophisticated, editorial, and helpful. Use clean Markdown styling. Do NOT use emojis.`;

  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  let lastError: unknown = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const stream = await client.models.generateContentStream({
        model: modelName,
        contents: [
          { role: "user", parts: [{ text: `[System Instruction: ${systemInstruction}]` }] },
          ...contents,
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
      return;
    } catch (err) {
      console.warn(`Chat model ${modelName} failed, trying fallback...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Both Gemini chat models failed.");
}
