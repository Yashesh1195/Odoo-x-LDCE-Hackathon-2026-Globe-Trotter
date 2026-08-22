"use server";

import { prisma } from "@/app/lib/db";

export async function getCommunityPosts(query?: string, filterBy?: string, sortBy?: string) {
  try {
    let posts = await prisma.communityPost.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      }
    });

    if (query) {
       posts = posts.filter(p => 
         p.content.toLowerCase().includes(query.toLowerCase()) ||
         (p.activity && p.activity.toLowerCase().includes(query.toLowerCase())) ||
         (p.location && p.location.toLowerCase().includes(query.toLowerCase()))
       );
    }
    
    // Simplistic filter logic for the hackathon
    if (filterBy === "activity" && query) {
      posts = posts.filter(p => p.activity?.toLowerCase().includes(query.toLowerCase()));
    } else if (filterBy === "location" && query) {
      posts = posts.filter(p => p.location?.toLowerCase().includes(query.toLowerCase()));
    }

    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return { error: "Failed to fetch community posts" };
  }
}

export async function createMockCommunityData() {
  try {
    // Check if we have users, if not we need one
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phoneNumber: "1234567890",
          city: "New York",
          country: "USA",
          password: "password123",
        }
      });
    }

    // Check if posts exist
    const count = await prisma.communityPost.count();
    if (count > 0) {
      return { success: true, message: "Mock data already exists." };
    }

    // Create some posts
    await prisma.communityPost.createMany({
      data: [
        {
          content: "Just got back from an amazing Paragliding trip in Interlaken! The views of the Swiss Alps were absolutely breathtaking. Highly recommend going in the summer.",
          activity: "Paragliding",
          location: "Interlaken",
          userId: user.id,
        },
        {
          content: "Scuba diving in the Great Barrier Reef was a dream come true. We saw sea turtles and vibrant coral reefs. Best experience ever!",
          activity: "Scuba Diving",
          location: "Australia",
          userId: user.id,
        },
        {
          content: "Hiking the Inca Trail to Machu Picchu was grueling but totally worth it. Make sure to pack light and prepare for altitude sickness.",
          activity: "Trekking",
          location: "Machu Picchu",
          userId: user.id,
        },
        {
          content: "Spent 3 days in Paris just exploring the museums and eating croissants. The Louvre is massive, plan for at least a full day there.",
          activity: "Sightseeing",
          location: "Paris",
          userId: user.id,
        }
      ]
    });

    return { success: true, message: "Mock data created successfully!" };
  } catch (error) {
    console.error("Error creating mock data:", error);
    return { error: "Failed to create mock data" };
  }
}

export async function createCommunityPost(data: { content: string, activity?: string, location?: string }, userId: string) {
  try {
    const post = await prisma.communityPost.create({
      data: {
        content: data.content,
        activity: data.activity || null,
        location: data.location || null,
        userId: userId,
      }
    });
    return { success: true, post };
  } catch (error) {
    console.error("Error creating community post:", error);
    return { error: "Failed to create post" };
  }
}

