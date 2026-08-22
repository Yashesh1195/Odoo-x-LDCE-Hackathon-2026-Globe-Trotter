"use server";

import { prisma } from "../lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_hackathon"
);

export interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  additionalInfo?: string | null;
  photoUrl?: string | null;
  memberSince?: string;
  tripsCount?: number;
}

export async function getUserProfile(userId?: string) {
  try {
    let targetUserId = userId;

    // If userId not explicitly provided, read authenticated userId from JWT cookie
    if (!targetUserId) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          if (payload?.userId) {
            targetUserId = payload.userId as string;
          }
        }
        if (!targetUserId) {
          targetUserId = cookieStore.get("gt_user_id")?.value;
        }
      } catch (cookieErr) {
        console.warn("Could not read auth cookies in getUserProfile:", cookieErr);
      }
    }

    let user = null;

    // Fetch user by authenticated user ID
    if (targetUserId && !targetUserId.startsWith("demo-")) {
      user = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
          trips: true,
        },
      });
    }

    // Only fallback if no authenticated user could be found from cookie
    if (!user && !targetUserId) {
      user = await prisma.user.findFirst({
        where: {
          firstName: { not: "Guest" },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          trips: true,
        },
      });
    }

    if (user) {
      const userProfile: UserProfileData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "+91 98765 43210",
        city: user.city || "Ahmedabad",
        country: user.country || "India",
        additionalInfo:
          user.additionalInfo ||
          "Passionate globetrotter exploring architectural wonders, mountain landscapes, and cultural heritage around the globe.",
        photoUrl:
          user.photoUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
        memberSince: new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        tripsCount: user.trips?.length || 0,
      };
      return { success: true, user: userProfile };
    }

    // Default primary profile fallback
    const defaultProfile: UserProfileData = {
      id: "demo-user-001",
      firstName: "Priyanshu",
      lastName: "Sharma",
      email: "priyanshu@globetrotter.com",
      phoneNumber: "+91 98765 43210",
      city: "Ahmedabad",
      country: "India",
      additionalInfo:
        "Passionate globetrotter exploring architectural wonders, mountain landscapes, and cultural heritage around the globe.",
      photoUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
      memberSince: "March 2024",
      tripsCount: 6,
    };

    return { success: true, user: defaultProfile };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const fallbackProfile: UserProfileData = {
      id: "demo-user-001",
      firstName: "Priyanshu",
      lastName: "Sharma",
      email: "priyanshu@globetrotter.com",
      phoneNumber: "+91 98765 43210",
      city: "Ahmedabad",
      country: "India",
      additionalInfo:
        "Passionate globetrotter exploring architectural wonders, mountain landscapes, and cultural heritage around the globe.",
      photoUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
      memberSince: "March 2024",
      tripsCount: 6,
    };
    return { success: true, user: fallbackProfile };
  }
}

export async function updateUserProfile(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    city: string;
    country: string;
    additionalInfo?: string;
    photoUrl?: string | null;
  }
) {
  try {
    let targetUserId = userId;
    if (!targetUserId || targetUserId === "demo-user-001") {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        if (token) {
          const { payload } = await jwtVerify(token, JWT_SECRET);
          if (payload?.userId) {
            targetUserId = payload.userId as string;
          }
        }
      } catch {}
    }

    if (targetUserId && !targetUserId.startsWith("demo-")) {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          city: data.city,
          country: data.country,
          additionalInfo: data.additionalInfo,
          photoUrl: data.photoUrl,
        },
      });

      return {
        success: true,
        user: {
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phoneNumber: updated.phoneNumber,
          city: updated.city,
          country: updated.country,
          additionalInfo: updated.additionalInfo,
          photoUrl: updated.photoUrl,
        },
      };
    }

    return {
      success: true,
      user: {
        id: targetUserId || "demo-user-001",
        ...data,
      },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}
