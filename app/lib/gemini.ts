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
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash-lite",
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

## YOUR TASK
Generate a **complete, actionable, highly detailed trip plan** in clean, professional Markdown. Be specific with real place names, real restaurants, real hotels, and realistic prices.

## REQUIRED SECTIONS (use these exact headings)

### Trip Overview
A brief, inspiring 2-3 sentence summary of the trip. Mention the best aspects for this specific season/time.

### Quick Facts
Use a table with: Best Currency, Language, Time Zone, Weather Expected, Visa Info, Emergency Number, Best SIM/eSIM provider.

### Detailed Where & When (Logistics & Timing)
Provide an in-depth breakdown:
1. **WHERE (Geographic & Neighborhood Guide)**:
   - Arrival Hubs (airports/train stations, transfer options & duration to city center)
   - Best Neighborhoods (where to stay, where to dine, where to walk)
   - Transit Map & Distance Guide between primary sights
2. **WHEN (Optimal Timing & Seasonality)**:
   - Exact Weather Expectations for ${request.startDate} to ${request.endDate} (temps, rain chance, clothing advice)
   - Sunrise & Sunset Times (best golden hour photography locations)
   - Crowd Avoidance & Optimal Visit Windows (which attractions to visit at 8am vs late afternoon)

### Day-by-Day Itinerary
For EACH of the ${days} days, create a section:

#### Day N: [Catchy Title]

**Morning (8:00–12:00)**
- Activity with specific location name, address, estimated duration
- Estimated cost per person

**Afternoon (12:00–17:00)**
- Activity with specific location name, address, estimated duration  
- Lunch recommendation: specific restaurant name, cuisine type, price range, must-try dish

**Evening (17:00–22:00)**
- Activity with specific location name  
- Dinner recommendation: specific restaurant name, cuisine type, price range, must-try dish

**Tonight's Accommodation:** Hotel name, neighborhood, price/night, why it's great for this trip

---

### Accommodation Summary
Table with: Night, Hotel Name, Area, Price/Night, Rating, Key Feature

### Restaurant Guide
Table with: Meal, Restaurant, Cuisine, Price Range (per person), Must-Try Dish, Reservation Needed?

### Budget Breakdown
Detailed table:
| Category | Estimated Cost (per person) | Total (${request.travelers} travelers) |
Show: Flights (estimate), Accommodation, Food & Dining, Activities & Entrance Fees, Local Transport, Shopping & Souvenirs, Miscellaneous
End with **Total Estimated Trip Cost**.

### Getting Around
Best transport options: airport transfer, daily transport, apps to download, tips for getting around.

### Packing List
Categorized checklist:
- **Essentials** (documents, money, etc.)
- **Clothing** (based on weather + activities)
- **Tech & Gadgets**
- **Toiletries & Health**

### Pro Tips & Cultural Notes
5-8 insider tips: cultural etiquette, money-saving hacks, best photo spots, common tourist mistakes to avoid, useful local phrases.

## FORMATTING RULES
- ZERO EMOJIS: Do NOT output any emojis anywhere in your response. Do not use emojis in headings, list items, tables, or text.
- Use **bold** for important names and numbers
- Use tables where specified
- Be specific — real place names, real prices, real addresses
- Prices in INR (₹)
- Keep the tone professional, clean, and editorial — like a high-end travel magazine
- Do NOT add any disclaimer about prices being estimates at the start or end`;
<<<<<<< HEAD

=======
>>>>>>> d9435441bd01badbbc2a3b3102917bf64cb6af47
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
