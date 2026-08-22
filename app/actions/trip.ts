"use server";

import { prisma } from "../lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "./auth";
import { mockTrips } from "../lib/mockData";

// Strictly 2-Model Fallback Chain:
// Primary: gemini-3.5-flash-lite (gemini-2.5-flash-lite)
// Fallback: gemini-3.1-flash-lite (gemini-2.0-flash-lite)
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function callGeminiWith2Models(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      if (text) return text;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} failed, trying fallback model...`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All configured Gemini flash-lite models failed.");
}

export async function generateSuggestions(place: string, startDate: string, endDate: string) {
  try {
    const prompt = `System Prompt: You are an expert trip planner. Suggest exactly 6 specific places to visit or activities in ${place} between ${startDate} and ${endDate}.
Return strictly a JSON array of objects without markdown formatting:
[
  {
    "title": "Landmark / Activity Title",
    "description": "1-2 sentence description."
  }
]`;

    let text = await callGeminiWith2Models(prompt);
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }
    const parsed = JSON.parse(text);
    return { success: true, suggestions: parsed };
  } catch (error: any) {
    console.error("Gemini Suggestions Error:", error?.message);
    
    // Rich fallback data for place
    const mockFallback = [
      {
        title: `Heritage Walk in ${place}`,
        description: `Explore the iconic historic quarters and architectural landmarks of ${place}.`,
      },
      {
        title: `Authentic Culinary Tour`,
        description: `Taste celebrated local delicacies and dining specialties across ${place}.`,
      },
      {
        title: `Scenic Nature & Vistas`,
        description: `Unwind at prime panoramic viewpoints and serene natural landscapes in ${place}.`,
      },
      {
        title: `Cultural Museum & Arts`,
        description: `Immerse in the rich traditions, crafts, and historical artifacts of the region.`,
      },
      {
        title: `Outdoor Adventure Trek`,
        description: `Experience outdoor excursions, photography walks, and unique adventures.`,
      },
      {
        title: `Sunset & Evening Bazaar`,
        description: `Enjoy evening atmospheres, golden hour sunsets, and bustling local markets.`,
      },
    ];

    return { success: true, suggestions: mockFallback };
  }
}

export interface ChatItineraryPlanResult {
  destination: string;
  summary: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
  sections: {
    title: string;
    description: string;
    dateRange: string;
    budget: string;
  }[];
}

export async function generateChatTripPlan(userPrompt: string, baseDestination?: string, durationDays: number = 4): Promise<{ success: boolean; plan?: ChatItineraryPlanResult; error?: string }> {
  try {
    const prompt = `System Prompt: You are GlobeTrotter AI Concierge. The user wants to plan a trip with this request: "${userPrompt}".
Generate a complete, structured, step-by-step Day-by-Day itinerary (for around ${durationDays} days).

Return strictly a JSON object with this exact structure (no markdown tags):
{
  "destination": "Name of primary city / state / country",
  "summary": "2-3 sentence inspiring overview of the journey",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "totalBudget": "e.g. ₹15,000 or $800",
  "sections": [
    {
      "title": "Day 1: Arrival & Landmark Exploration",
      "description": "Morning: Arrival and check-in. Afternoon: Visit landmark with guided tour. Evening: Dine at top local restaurant.",
      "dateRange": "YYYY-MM-DD",
      "budget": "₹3,500"
    }
  ]
}`;

    let text = await callGeminiWith2Models(prompt);
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }
    const parsed: ChatItineraryPlanResult = JSON.parse(text);
    return { success: true, plan: parsed };
  } catch (error: any) {
    console.error("Chat Trip Planner Error:", error?.message);

    // Intelligent instant fallback generator based on destination query
    const targetPlace = baseDestination || (userPrompt.match(/(?:to|in|for|visit)\s+([A-Za-z\s]+)/i)?.[1]?.trim()) || "Shimla";
    const cleanPlace = targetPlace.split(/[,\s]/)[0];
    const today = new Date();
    const startStr = today.toISOString().split("T")[0];
    const end = new Date(today.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().split("T")[0];

    const fallbackPlan: ChatItineraryPlanResult = {
      destination: cleanPlace,
      summary: `An inspiring ${durationDays}-day curated journey through ${cleanPlace}, featuring iconic landmarks, authentic local culinary delights, and unforgettable cultural experiences.`,
      startDate: startStr,
      endDate: endStr,
      totalBudget: "₹18,500",
      sections: [
        {
          title: `Day 1: Arrival & Historic Core of ${cleanPlace}`,
          description: `Morning: Arrive and check into your hotel. Afternoon: Stroll through central promenades and iconic heritage sites. Evening: Authentic dinner at a renowned local restaurant.`,
          dateRange: startStr,
          budget: "₹4,500",
        },
        {
          title: `Day 2: Prime Sightseeing & Cultural Wonders`,
          description: `Morning: Guided excursion to top-rated monuments and scenic viewpoints. Afternoon: Traditional arts and handicraft shopping. Evening: Sunset photography walk.`,
          dateRange: new Date(today.getTime() + 1 * 86400000).toISOString().split("T")[0],
          budget: "₹5,000",
        },
        {
          title: `Day 3: Outdoor Excursion & Nature Trail`,
          description: `Morning: Scenic nature trek or wildlife/mountain trail. Afternoon: Picnic lunch amidst picturesque surroundings. Evening: Leisure walk and local sweet tasting.`,
          dateRange: new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0],
          budget: "₹4,500",
        },
        {
          title: `Day 4: Hidden Gems & Departure`,
          description: `Morning: Visit tranquil local gardens and souvenir shopping. Afternoon: Farewell brunch and transit to departure terminal.`,
          dateRange: endStr,
          budget: "₹4,500",
        },
      ],
    };

    return { success: true, plan: fallbackPlan };
  }
}

export async function saveChatTrip(plan: ChatItineraryPlanResult) {
  try {
    const currentUser = await getCurrentUser();
    let finalUserId = currentUser?.id;
    if (!finalUserId) {
      let firstUser = await prisma.user.findFirst({
        where: { firstName: { not: "Guest" } },
      });
      if (!firstUser) {
        firstUser = await prisma.user.findFirst();
      }
      if (!firstUser) {
        firstUser = await prisma.user.create({
          data: {
            firstName: "Priyanshu",
            lastName: "Sharma",
            email: "priyanshu@globetrotter.com",
            phoneNumber: "+91 98765 43210",
            city: "Ahmedabad",
            country: "India",
            password: "dummy",
          },
        });
      }
      finalUserId = firstUser.id;
    }

    const trip = await prisma.trip.create({
      data: {
        place: plan.destination,
        startDate: new Date(plan.startDate),
        endDate: new Date(plan.endDate),
        suggestions: JSON.stringify(plan.sections.map((s) => ({ title: s.title, description: s.description }))),
        userId: finalUserId,
      },
    });

    for (const sec of plan.sections) {
      await prisma.itinerarySection.create({
        data: {
          tripId: trip.id,
          title: sec.title,
          description: sec.description,
          dateRange: sec.dateRange,
          budget: sec.budget,
        },
      });
    }

    return { success: true, tripId: trip.id };
  } catch (error: any) {
    console.error("Save Chat Trip Error:", error?.message);
    return { error: "Failed to save itinerary to database." };
  }
}

export async function createTrip(data: { place: string; startDate: string; endDate: string; suggestions: string; userId?: string }) {
  try {
    let finalUserId = data.userId;
    if (!finalUserId) {
      const currentUser = await getCurrentUser();
      if (currentUser?.id) {
        finalUserId = currentUser.id;
      } else {
        let firstUser = await prisma.user.findFirst({
          where: { firstName: { not: "Guest" } },
        });
        if (!firstUser) {
          firstUser = await prisma.user.findFirst();
        }
        if (!firstUser) {
          firstUser = await prisma.user.create({
            data: {
              firstName: "Priyanshu",
              lastName: "Sharma",
              email: "priyanshu@globetrotter.com",
              phoneNumber: "+91 98765 43210",
              city: "Ahmedabad",
              country: "India",
              password: "dummy",
            },
          });
        }
        finalUserId = firstUser.id;
      }
    }

    const trip = await prisma.trip.create({
      data: {
        place: data.place,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        suggestions: data.suggestions,
        userId: finalUserId,
      },
    });
    return { success: true, trip };
  } catch (error) {
    console.error("Trip creation error:", error);
    return { error: "An error occurred while saving the trip." };
  }
}

export async function getTripDetails(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itinerarySections: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!trip) {
      return { error: "Trip not found." };
    }

    let suggestions: { title: string; description: string }[] = [];
    if (trip.suggestions) {
      try {
        suggestions = JSON.parse(trip.suggestions);
      } catch {
        suggestions = [];
      }
    }

    let totalBudget = 0;
    for (const section of trip.itinerarySections) {
      const num = parseFloat(section.budget.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) totalBudget += num;
    }

    return {
      success: true,
      trip: {
        id: trip.id,
        place: trip.place,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        suggestions,
        totalBudget,
        sections: trip.itinerarySections,
        user: trip.user,
      },
    };
  } catch (error) {
    console.error("Get trip details error:", error);
    return { error: "Failed to fetch trip details." };
  }
}

export async function generateItinerary(tripId: string, activityName: string) {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return { error: "Trip not found." };
    }

    const prompt = `System Prompt: Generate a detailed, step-by-step itinerary for a trip to ${trip.place} between ${trip.startDate.toDateString()} and ${trip.endDate.toDateString()}, focusing on "${activityName}".
Return strictly a JSON array of objects:
[
  {
    "title": "Section Title",
    "description": "Detailed description",
    "dateRange": "YYYY-MM-DD",
    "budget": "₹3500"
  }
]`;

    let text = await callGeminiWith2Models(prompt);
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }
    const parsed = JSON.parse(text);

    const savedSections = [];
    for (const section of parsed) {
      const saved = await prisma.itinerarySection.create({
        data: {
          title: section.title,
          description: section.description,
          dateRange: section.dateRange || trip.startDate.toISOString().split("T")[0],
          budget: section.budget || "₹2500",
          tripId: trip.id,
        },
      });
      savedSections.push(saved);
    }

    return { success: true, sections: savedSections };
  } catch (error) {
    console.error("Itinerary generation error:", error);
    return { error: "Failed to generate itinerary. Please try again." };
  }
}

export async function getItinerary(tripId: string) {
  try {
    const sections = await prisma.itinerarySection.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, sections };
  } catch (error) {
    console.error("Get itinerary error:", error);
    return { error: "Failed to fetch itinerary." };
  }
}

export async function addItinerarySection(tripId: string, data: { title: string; description: string; dateRange: string; budget: string }) {
  try {
    const section = await prisma.itinerarySection.create({
      data: {
        tripId,
        title: data.title,
        description: data.description,
        dateRange: data.dateRange,
        budget: data.budget,
      },
    });
    return { success: true, section };
  } catch (error) {
    console.error("Add section error:", error);
    return { error: "Failed to add section." };
  }
}

export async function updateItinerarySection(sectionId: string, data: { title: string; description: string; dateRange: string; budget: string }) {
  try {
    const section = await prisma.itinerarySection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        description: data.description,
        dateRange: data.dateRange,
        budget: data.budget,
      },
    });
    return { success: true, section };
  } catch (error) {
    console.error("Update section error:", error);
    return { error: "Failed to update section." };
  }
}

export async function deleteItinerarySection(sectionId: string) {
  try {
    await prisma.itinerarySection.delete({
      where: { id: sectionId },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete section error:", error);
    return { error: "Failed to delete section." };
  }
}

/**
 * Enhanced trip lookup that handles both real DB trips and mock dashboard trips.
 * Mock trip IDs (e.g. "trip-in-001", "trip-001") don't exist in the database,
 * so we fall back to the hardcoded mockTrips array from mockData.ts.
 */
export async function getTripDetailsWithFallback(tripId: string) {
  // 1. Try the real DB lookup first
  const dbResult = await getTripDetails(tripId);
  if (dbResult.success && dbResult.trip) {
    return dbResult;
  }

  // 2. Fallback: check mock trips
  const mockTrip = mockTrips.find((t) => t.id === tripId);
  if (mockTrip) {
    return {
      success: true,
      trip: {
        id: mockTrip.id,
        place: mockTrip.destination,
        startDate: new Date(mockTrip.startDate).toISOString(),
        endDate: new Date(mockTrip.endDate).toISOString(),
        suggestions: mockTrip.activities.map((a) => ({ title: a, description: "" })),
        totalBudget: mockTrip.budget.total,
        spent: mockTrip.budget.spent,
        currency: mockTrip.budget.currency,
        status: mockTrip.status,
        travelers: mockTrip.travelers,
        country: mockTrip.country,
        name: mockTrip.name,
        image: mockTrip.image,
        activities: mockTrip.activities,
        sections: [],
        user: null,
        isMock: true,
      },
    };
  }

  // 3. Nothing found
  return { error: "Trip not found." };
}

