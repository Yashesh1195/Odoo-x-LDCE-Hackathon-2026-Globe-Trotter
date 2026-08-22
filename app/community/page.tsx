"use client";

import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { getCommunityPosts, createMockCommunityData, createCommunityPost } from "../actions/community";
import Link from "next/link";
import { getUserProfile } from "../actions/profile";

interface User {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

interface CommunityPost {
  id: string;
  content: string;
  activity: string | null;
  location: string | null;
  user: User;
  createdAt: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<"group" | "filter" | "sort" | null>(null);
  
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [filterBy, setFilterBy] = useState<"all" | "activity" | "location">("all");

  // Create Post State
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostActivity, setNewPostActivity] = useState("");
  const [newPostLocation, setNewPostLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const stored = localStorage.getItem("gt_user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          const res = await getUserProfile();
          if (res?.success && res.user) {
            setCurrentUser(res.user);
          }
        }
      } catch (e) {}
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Ensure mock data exists for the hackathon
      await createMockCommunityData();
      
      const res = await getCommunityPosts(
        searchQuery, 
        filterBy === "all" ? undefined : filterBy, 
        sortBy
      );
      
      if (res.success && res.posts) {
        setPosts(res.posts as unknown as CommunityPost[]);
      }
      setLoading(false);
    }
    loadData();
  }, [searchQuery, sortBy, filterBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) {
      if (!currentUser) alert("Please log in to post.");
      return;
    }
    
    setIsPosting(true);
    const res = await createCommunityPost({
      content: newPostContent,
      activity: newPostActivity,
      location: newPostLocation
    }, currentUser.id);

    if (res.success && res.post) {
      setNewPostContent("");
      setNewPostActivity("");
      setNewPostLocation("");
      // Refresh feed
      const freshRes = await getCommunityPosts(searchQuery, filterBy === "all" ? undefined : filterBy, sortBy);
      if (freshRes.success && freshRes.posts) setPosts(freshRes.posts as unknown as CommunityPost[]);
    } else {
      alert(res.error || "Failed to create post.");
    }
    setIsPosting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-dark)] font-sans text-[var(--on-dark)] selection:bg-[var(--primary)] selection:text-white">
      <TopNav />
      
      <div className="m-stripe">
        <div className="m-stripe-segment-1" />
        <div className="m-stripe-segment-2" />
        <div className="m-stripe-segment-3" />
      </div>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12">
        {/* Header Area */}
        <div className="mb-12 border-b border-white/20 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Community Tab
              </h1>
              <p className="text-[var(--on-dark-soft)] max-w-xl font-light text-sm sm:text-base leading-relaxed">
                Community section where all users can share their experiences about a certain trip or activity. Use the search, group by, filter, and sort by options to narrow down what you're looking for.
              </p>
            </div>

            {/* Filter / Search Bar mimicking Screen 10 */}
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-white/30 h-10 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary)] min-w-[200px]"
              />
              
              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "group" ? null : "group")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Group By</button>
              </div>

              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "filter" ? null : "filter")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Filter</button>
                {activeDropdown === "filter" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--surface-dark-elevated)] border border-white/20 shadow-xl z-20 flex flex-col">
                    <button type="button" onClick={() => { setFilterBy("all"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">All Posts</button>
                    <button type="button" onClick={() => { setFilterBy("activity"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">By Activity</button>
                    <button type="button" onClick={() => { setFilterBy("location"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10">By Location</button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button type="button" onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")} className="h-10 px-4 border border-white/30 text-[11px] font-bold uppercase tracking-[1px] hover:bg-white/10 transition-colors">Sort by...</button>
                {activeDropdown === "sort" && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-[var(--surface-dark-elevated)] border border-white/20 shadow-xl z-20 flex flex-col">
                    <button type="button" onClick={() => { setSortBy("newest"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10 border-b border-white/10">Newest First</button>
                    <button type="button" onClick={() => { setSortBy("oldest"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-xs font-medium hover:bg-white/10">Oldest First</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Create Post Section */}
        {currentUser && (
          <div className="mb-12 border border-white/20 bg-white/5 p-6 max-w-4xl animate-fadeIn">
            <h3 className="text-sm font-bold uppercase tracking-[1px] mb-4 text-white">Share Your Experience</h3>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What did you do? How was it?"
                required
                className="w-full bg-transparent border border-white/30 p-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary)] min-h-[100px]"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newPostActivity}
                  onChange={(e) => setNewPostActivity(e.target.value)}
                  placeholder="Activity (e.g. Paragliding)"
                  className="flex-1 bg-transparent border border-white/30 h-10 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary)]"
                />
                <input
                  type="text"
                  value={newPostLocation}
                  onChange={(e) => setNewPostLocation(e.target.value)}
                  placeholder="Location (e.g. Interlaken)"
                  className="flex-1 bg-transparent border border-white/30 h-10 px-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-[var(--primary)] hover:bg-[#0653b6] text-white font-bold text-[11px] uppercase tracking-[1.5px] h-10 px-8 transition-colors disabled:opacity-50"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-xs font-bold tracking-[2px] uppercase">Loading Feed...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-white/10">
            <p className="text-lg mb-2">No community posts found.</p>
            <p className="text-white/50 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            {posts.map((post) => (
              <div key={post.id} className="flex gap-6 items-start group">
                {/* User Avatar Circle */}
                <div className="w-16 h-16 rounded-full border border-white/30 shrink-0 flex items-center justify-center bg-white/5 overflow-hidden">
                  {post.user.photoUrl ? (
                    <img src={post.user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold opacity-50">
                      {post.user.firstName[0]}{post.user.lastName[0]}
                    </span>
                  )}
                </div>

                {/* Content Box */}
                <div className="flex-1 border border-white/20 bg-white/5 p-6 hover:border-[var(--primary)] transition-colors relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-base tracking-wide">
                        {post.user.firstName} {post.user.lastName}
                      </h4>
                      <div className="flex gap-3 mt-1">
                        {post.activity && (
                          <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--primary)]">
                            {post.activity}
                          </span>
                        )}
                        {post.location && (
                          <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--on-dark-soft)]">
                            📍 {post.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm font-light leading-relaxed text-white/90">
                    "{post.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
