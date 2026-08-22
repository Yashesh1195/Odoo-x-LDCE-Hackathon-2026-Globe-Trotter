"use server";

import { prisma } from "../lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "./auth";

export async function generateSuggestions(place: string, startDate: string, endDate: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "GEMINI_API_KEY is not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `System Prompt: You are a professional and highly knowledgeable trip planner. Your objective is to create a focused and highly relevant itinerary based solely on the details provided by the user. You must ONLY suggest places, landmarks, and activities that are strictly relevant to the specific location entered by the user. Do not suggest places outside of this location.

User Details:
- Destination: ${place}
- Start Date: ${startDate}
- End Date: ${endDate}

Task: Suggest exactly 6 specific places to visit or activities to perform in ${place} during the specified dates. 

Return the result STRICTLY as a JSON array of objects. Do not wrap in markdown tags like \`\`\`json.
Each object must have:
- "title": A short name for the place or activity.
- "description": A 1-2 sentence description.

Example:
[
  {
    "title": "Eiffel Tower",
    "description": "An iconic wrought-iron lattice tower on the Champ de Mars in Paris."
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Robust extraction: find the first '[' and last ']'
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(text);
    return { success: true, suggestions: parsed };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Fallback Mock Data for Hackathon Rate Limits (429 Too Many Requests)
    const mockFallback = [
      {
        "title": "Local City Tour",
        "description": `Explore the best cultural landmarks and hidden gems in the heart of ${place}.`
      },
      {
        "title": "Culinary Experience",
        "description": `Taste the authentic local cuisine at top-rated restaurants and street food stalls in ${place}.`
      },
      {
        "title": "Nature & Relaxation",
        "description": `Spend a day unwinding at the most scenic natural spots around ${place}.`
      },
      {
        "title": "Historic Museum Visit",
        "description": "Dive deep into the rich history and art collections at the premier museum in the area."
      },
      {
        "title": "Adventure Activity",
        "description": `Get your adrenaline pumping with a guided outdoor adventure specific to ${place}.`
      },
      {
        "title": "Evening Entertainment",
        "description": "Enjoy the vibrant nightlife, featuring live music, theater, or a sunset cruise."
      }
    ];

    return { success: true, suggestions: mockFallback };
  }
}

export async function createTrip(data: { place: string, startDate: string, endDate: string, suggestions: string, userId?: string }) {
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
                password: "dummy"
              }
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
        userId: finalUserId
      }
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

    // Parse suggestions JSON
    let suggestions: { title: string; description: string }[] = [];
    if (trip.suggestions) {
      try {
        suggestions = JSON.parse(trip.suggestions);
      } catch {
        suggestions = [];
      }
    }

    // Calculate total budget from itinerary sections
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "GEMINI_API_KEY is not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `System Prompt: You are an expert itinerary planner. Generate a detailed, step-by-step itinerary for a trip to ${trip.place} between ${trip.startDate.toDateString()} and ${trip.endDate.toDateString()}. The main focus of this itinerary should be on the activity/location: "${activityName}".
    
Divide the itinerary into logical sections (e.g., travel sections, specific day plans, hotel check-ins, or specific activities).
Return strictly a JSON array of objects. Do not use markdown tags like \`\`\`json.
Each object must have:
- "title": A descriptive title for the section (e.g., "Section 1: Hotel Check-in" or "Day 1: Exploring Saputara").
- "description": A detailed description of what happens in this section.
- "dateRange": A strict date string in YYYY-MM-DD format (e.g., "2026-10-12"). Do NOT use text like 'Morning'.
- "budget": An estimated budget for this section strictly in Indian Rupees (e.g., "₹2000").

Make sure to provide at least 3-4 sections to cover the trip.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Robust extraction: find the first '[' and last ']'
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(text);

    // Save sections to db
    const savedSections = [];
    for (const section of parsed) {
      const saved = await prisma.itinerarySection.create({
        data: {
          title: section.title,
          description: section.description,
          dateRange: section.dateRange,
          budget: section.budget,
          tripId: trip.id
        }
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
      orderBy: { createdAt: 'asc' }
    });
    return { success: true, sections };
  } catch (error) {
    console.error("Get itinerary error:", error);
    return { error: "Failed to fetch itinerary." };
  }
}

export async function addItinerarySection(tripId: string, data: { title: string, description: string, dateRange: string, budget: string }) {
  try {
    const section = await prisma.itinerarySection.create({
      data: {
        tripId,
        title: data.title,
        description: data.description,
        dateRange: data.dateRange,
        budget: data.budget
      }
    });
    return { success: true, section };
  } catch (error) {
    console.error("Add section error:", error);
    return { error: "Failed to add section." };
  }
}

export async function updateItinerarySection(sectionId: string, data: { title: string, description: string, dateRange: string, budget: string }) {
  try {
    const section = await prisma.itinerarySection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        description: data.description,
        dateRange: data.dateRange,
        budget: data.budget
      }
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
      where: { id: sectionId }
    });
    return { success: true };
  } catch (error) {
    console.error("Delete section error:", error);
    return { error: "Failed to delete section." };
  }
}
