"use client";

import React, { useState, useEffect, useCallback } from "react";
import TopNav from "@/app/components/TopNav";
import ProfileHero from "@/app/components/ProfileHero";
import ProfileTripGrid from "@/app/components/ProfileTripGrid";
import TripDetailModal from "@/app/components/TripDetailModal";
import type { DbTrip } from "@/app/components/TripOverviewCard";
import type { Trip } from "@/app/lib/types";
import { getUserProfile, updateUserProfile, type UserProfileData } from "@/app/actions/profile";
import { mockTrips } from "@/app/lib/mockData";
import { getLocationImage } from "@/app/lib/destinationImages";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [preplannedTrips, setPreplannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected trip for slide-in details modal
  const [selectedTrip, setSelectedTrip] = useState<DbTrip | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"upcoming" | "ongoing" | "completed">("upcoming");

  // Load user data and trips
  const loadProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch User
      const userRes = await getUserProfile();
      if (userRes.success && userRes.user) {
        setUser(userRes.user);
      }

      // 2. Fetch Trips from DB with fallback to mock data
      try {
        const res = await fetch("/api/my-trips");
        const json = await res.json();
        
        let allTrips: Trip[] = [];
        
        if (json.trips && json.trips.length > 0) {
          // Map DB trips to Trip shape with real-time location photos
          const mappedDbTrips: Trip[] = json.trips.map((t: any) => ({
            id: t.id,
            name: t.place,
            destination: t.place,
            country: "",
            image: getLocationImage(t.place),
            startDate: t.startDate,
            endDate: t.endDate,
            status: new Date(t.startDate) > new Date() ? "upcoming" : "completed",
            budget: { total: t.totalBudget || 3000, spent: Math.round((t.totalBudget || 3000) * 0.4), currency: "INR" },
            travelers: 2,
            activities: t.suggestions?.map((s: any) => s.title) || ["Sightseeing", "Local Tour"],
          }));

          allTrips = [...mappedDbTrips];
        }

        // Merge with mockTrips to ensure rich presentation
        const existingIds = new Set(allTrips.map(t => t.id));
        for (const mock of mockTrips) {
          if (!existingIds.has(mock.id)) {
            allTrips.push(mock);
          }
        }

        // Categorize into Preplanned (Upcoming) vs Previous (Completed / In Progress)
        const preplanned = allTrips.filter(
          (t) => t.status === "upcoming" || new Date(t.startDate) > new Date()
        );
        const previous = allTrips.filter(
          (t) => t.status === "completed" || t.status === "in-progress" || new Date(t.endDate) <= new Date()
        );

        setPreplannedTrips(preplanned);
        setPreviousTrips(previous.length > 0 ? previous : allTrips.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch trips for profile:", err);
        // Fallback directly to mockTrips
        setPreplannedTrips(mockTrips.filter((t) => t.status === "upcoming"));
        setPreviousTrips(mockTrips.filter((t) => t.status === "completed"));
      }
    } catch (err) {
      console.error("Error loading profile page:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Handle saving profile changes
  const handleSaveProfile = async (data: Partial<UserProfileData>): Promise<boolean> => {
    if (!user) return false;
    const res = await updateUserProfile(user.id, {
      firstName: data.firstName || user.firstName,
      lastName: data.lastName || user.lastName,
      phoneNumber: data.phoneNumber || user.phoneNumber,
      city: data.city || user.city,
      country: data.country || user.country,
      additionalInfo: data.additionalInfo || "",
      photoUrl: data.photoUrl || user.photoUrl,
    });

    if (res.success && res.user) {
      setUser((prev) => (prev ? { ...prev, ...res.user } : prev));
      return true;
    }
    return false;
  };

  // Convert UI Trip to DbTrip shape for TripDetailModal
  const handleViewTrip = (trip: Trip) => {
    const dbTrip: DbTrip = {
      id: trip.id,
      place: trip.destination || trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      suggestions: trip.activities?.map((a) => ({
        title: a,
        description: `Explore and experience ${a} in ${trip.destination}.`,
      })) || [],
      totalBudget: trip.budget?.total || 3000,
      sectionCount: 3,
      createdAt: trip.startDate,
    };

    setSelectedTrip(dbTrip);
    setSelectedStatus(trip.status === "upcoming" ? "upcoming" : "completed");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <div className="flex flex-col items-center gap-4">
            <div
              className="animate-pulse"
              style={{
                width: 48,
                height: 48,
                backgroundColor: "var(--surface-strong)",
              }}
            />
            <p
              style={{
                fontSize: 14,
                fontWeight: 300,
                color: "var(--muted)",
              }}
            >
              Loading user profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white">
      <div>
        {/* ── Top Navigation ── */}
        <TopNav />

        {/* ── M Tricolor Stripe ── */}
        <div className="m-stripe">
          <div className="m-stripe-segment-1" />
          <div className="m-stripe-segment-2" />
          <div className="m-stripe-segment-3" />
        </div>

        {/* ── Profile Hero Section (Avatar + User Details with Inline Edit) ── */}
        {user && <ProfileHero user={user} onSave={handleSaveProfile} />}

        {/* ── Wireframe Section 1: Preplanned Trips ── */}
        <ProfileTripGrid
          id="preplanned-trips"
          title="Preplanned Trips"
          subtitle="Your scheduled upcoming itineraries and adventures"
          trips={preplannedTrips}
          badgeColor="var(--primary)"
          onViewTrip={handleViewTrip}
        />

        {/* ── Wireframe Section 2: Previous Trips ── */}
        <ProfileTripGrid
          id="previous-trips"
          title="Previous Trips"
          subtitle="Past journeys and travel memories you've explored"
          trips={previousTrips}
          badgeColor="var(--success)"
          onViewTrip={handleViewTrip}
        />
      </div>

      {/* ── Footer ── */}
      <footer
        id="profile-footer"
        style={{
          backgroundColor: "var(--surface-soft)",
          padding: "48px 24px",
          marginTop: 48,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center bg-[var(--primary)] text-white"
              style={{
                width: 28,
                height: 28,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              GT
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
              }}
            >
              GlobeTrotter
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 300,
              color: "var(--muted)",
              margin: 0,
            }}
          >
            © 2026 GlobeTrotter. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Slide-in Trip Detail Drawer ── */}
      <TripDetailModal
        trip={selectedTrip}
        computedStatus={selectedStatus}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}
