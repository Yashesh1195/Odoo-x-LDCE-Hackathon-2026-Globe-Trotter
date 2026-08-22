"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function searchActivity(
  query: string, 
  userLocation?: { city: string; country: string }
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: "GEMINI_API_KEY is not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const locationContext = userLocation 
      ? `The user is currently located in ${userLocation.city}, ${userLocation.country}.` 
      : "The user's location is unknown.";

    const prompt = `System Prompt: You are a professional travel advisor. A user has entered the following search query: "${query}".
    ${locationContext}
    
    Task: First, determine if the user's query is primarily an Activity (e.g., "Paragliding", "Trekking") or a Location/City (e.g., "Ahmedabad", "Paris", "New York").
    
    If it is an Activity:
    - Suggest 5 to 6 of the absolute best places to experience this activity.
    - If the user's location is known, you MUST first suggest 2 to 3 places that are nearby or within the same country as the user. Then, suggest 2 to 3 of the absolute best places globally.
    - If the user's location is unknown, suggest 5 to 6 of the best places globally.
    
    If it is a Location or City:
    - Suggest 5 to 6 of the absolute best places to visit, landmarks, or top activities to do specifically WITHIN that city or location.
    - The title should be the name of the landmark, place, or activity in that city (e.g., "Sabarmati Ashram" or "Eiffel Tower").

    Return the result STRICTLY as a JSON array of objects. Do not wrap in markdown tags like \`\`\`json.
    Each object must have:
    - "title": The name of the location, landmark, or activity (e.g., "Paragliding in Interlaken, Switzerland" or "Eiffel Tower").
    - "description": A 1-2 sentence description of why it's a great spot.
    - "price": An estimated cost strictly in Indian Rupees (e.g., "₹12000").
    - "bestTime": The optimal months or season to visit (e.g., "May to October").

    Provide exactly 5-6 highly curated recommendations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown formatting if present
    if (text.startsWith("\`\`\`json")) {
        text = text.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    }
    if (text.startsWith("\`\`\`")) {
        text = text.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }

    const parsed = JSON.parse(text);
    return { success: true, results: parsed };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { error: "Failed to fetch activity recommendations. Please try again." };
  }
}
