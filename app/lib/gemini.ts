import { GoogleGenAI } from "@google/genai";
import type { TripPlanRequest } from "./types";

// ── Gemini Client Singleton ────────────────────────────────────────

let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com and add it to your .env file."
      );
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

// ── Prompt Builder ─────────────────────────────────────────────────

function computeTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 1);
}

function budgetDescription(level: string): string {
  const map: Record<string, string> = {
    budget: "Budget-friendly ($30–80/day). Hostels, street food, public transport.",
    moderate: "Moderate ($80–180/day). Mid-range hotels, casual restaurants, mix of public & private transport.",
    comfortable: "Comfortable ($180–350/day). 4-star hotels, good restaurants, private transport.",
    luxury: "Luxury ($350–700/day). 5-star hotels, fine dining, private transfers.",
    "ultra-luxury": "Ultra-Luxury ($700+/day). Palace-level hotels, Michelin dining, helicopter transfers.",
  };
  return map[level] ?? map.moderate;
}

function paceDescription(pace: string): string {
  const map: Record<string, string> = {
    relaxed: "Relaxed pace — 2-3 activities per day max, plenty of downtime and spontaneous exploration.",
    moderate: "Moderate pace — 3-5 activities per day, balanced between sightseeing and rest.",
    packed: "Packed pace — 5-7 activities per day, maximizing every moment with an action-packed schedule.",
  };
  return map[pace] ?? map.moderate;
}

export function buildTripPlanPrompt(request: TripPlanRequest): string {
  const days = computeTripDays(request.startDate, request.endDate);

  return `You are GlobeTrotter AI — an expert AI travel assistant and master trip planner. You create comprehensive, highly detailed trip itineraries. You have deep knowledge of every destination worldwide, including local hidden gems, cultural nuances, seasonal events, and practical logistics.

## TRIP DETAILS
- **Destination:** ${request.destination}
- **Dates:** ${request.startDate} to ${request.endDate} (${days} days)
- **Travelers:** ${request.travelers} ${request.travelers === 1 ? "person" : "people"}
- **Budget:** ${budgetDescription(request.budgetLevel)}
- **Pace:** ${paceDescription(request.pace)}
- **Interests:** ${request.interests.join(", ")}
${request.specialRequests ? `- **Special Requests:** ${request.specialRequests}` : ""}

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
- Prices in USD
- Keep the tone professional, clean, and editorial — like a high-end travel magazine
- Do NOT add any disclaimer about prices being estimates at the start or end`;
}

// ── Streaming Generation ───────────────────────────────────────────

export async function* streamTripPlan(
  request: TripPlanRequest
): AsyncGenerator<string> {
  const client = getClient();
  const prompt = buildTripPlanPrompt(request);

  const candidateModels = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const stream = await client.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.9,
          maxOutputTokens: 8192,
          topP: 0.95,
          topK: 40,
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
      console.warn(`Model ${modelName} failed, trying next candidate...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini model candidates failed.");
}

// ── Chatbot Generator ───────────────────────────────────────────────

export async function* streamChatMessages(
  messages: { role: "user" | "model" | "system"; content: string }[]
): AsyncGenerator<string> {
  const client = getClient();

  const systemInstruction = `You are GlobeTrotter AI Assistant — a smart, refined, and highly knowledgeable travel concierge.

CORE BEHAVIOR RULES:
1. PRECISE & DIRECT BY DEFAULT: Answer precisely and directly to what the user asked. Do not provide unnecessary long intros, unprompted boilerplate, or unwanted full itineraries unless requested.
2. CONDITIONAL DETAIL: Only provide exhaustive, multi-day detailed itineraries with tables and full Where & When breakdowns IF the user explicitly asks for a "detailed plan", "full itinerary", "plan in detail", or similar. For general or specific queries (e.g. "What to eat in Tokyo?", "Weather in Paris in October?"), give concise, direct, high-value answers.
3. ZERO EMOJIS: Do NOT use any emojis anywhere in your response. Keep formatting clean, professional, and elegant using clear Markdown typography, bold text, and bullet points.`;

  const contents = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const candidateModels = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ];

  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const stream = await client.models.generateContentStream({
        model: modelName,
        contents: [
          { role: "user", parts: [{ text: `[System Instruction: ${systemInstruction}]` }] },
          ...contents,
        ],
        config: {
          temperature: 0.8,
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
      console.warn(`Chat model ${modelName} failed, trying next candidate...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini chat candidates failed.");
}
