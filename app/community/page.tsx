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
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)] selection:bg-[var(--primary)] selection:text-white">
      <TopNav />
      
      <div className="m-stripe">
        <div className="m-stripe-segment-1" />
        <div className="m-stripe-segment-2" />
        <div className="m-stripe-segment-3" />
      </div>

      {/* Hero Band */}
      <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-16 sm:py-20 px-6 lg:px-10 border-b-4 border-[var(--primary)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none flex items-center justify-end overflow-hidden">
            <span className="text-[250px] font-bold leading-none select-none tracking-tighter">GT</span>
        </div>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 bg-[var(--primary)]"></span>
            <span className="text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary)]">Global Network</span>
          </div>
          
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] mb-6 tracking-tight text-white">
            Traveler Community
          </h1>
          <p className="text-[16px] md:text-[18px] font-light text-[var(--on-dark-soft)] max-w-2xl leading-relaxed">
            Read authentic experiences from GlobeTrotter users worldwide. Share your own journeys, tips, and hidden gems with the community.
          </p>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 lg:px-10 py-[60px]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Feed */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Create Post Section */}
            {currentUser && (
              <div className="border border-[var(--hairline-strong)] bg-white p-8 md:p-10 hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-[18px] font-bold tracking-tight mb-6 text-[var(--ink)]">Share Your Journey</h3>
                <form onSubmit={handleCreatePost} className="flex flex-col gap-5">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What did you experience? Any tips for other travelers?"
                    required
                    className="w-full bg-[var(--surface-soft)] border border-transparent p-5 text-[16px] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition-all min-h-[120px] resize-none font-light"
                  />
                  <div className="flex flex-col sm:flex-row gap-5">
                    <input
                      type="text"
                      value={newPostActivity}
                      onChange={(e) => setNewPostActivity(e.target.value)}
                      placeholder="Activity (e.g. Scuba Diving)"
                      className="flex-1 bg-[var(--surface-soft)] border border-transparent h-[52px] px-5 text-[16px] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition-all font-light"
                    />
                    <input
                      type="text"
                      value={newPostLocation}
                      onChange={(e) => setNewPostLocation(e.target.value)}
                      placeholder="Location (e.g. Great Barrier Reef)"
                      className="flex-1 bg-[var(--surface-soft)] border border-transparent h-[52px] px-5 text-[16px] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition-all font-light"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="bmw-button-primary mt-2 self-start w-full sm:w-auto h-[52px] px-10 text-[13px] font-bold uppercase tracking-[1.5px] disabled:opacity-50 disabled:bg-[var(--hairline-strong)] shadow-none hover:shadow-lg transition-all"
                  >
                    {isPosting ? "Publishing..." : "Publish Post"}
                  </button>
                </form>
              </div>
            )}

            {/* Posts Feed */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 border border-[var(--hairline-strong)] bg-white">
                <div className="w-10 h-10 border-[3px] border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-xs font-bold tracking-[2px] uppercase text-[var(--ink)]">Syncing Feed...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 border border-[var(--hairline-strong)] bg-white">
                <p className="text-[20px] mb-2 text-[var(--ink)] font-bold">No entries found.</p>
                <p className="text-[var(--body)] text-[16px] font-light">Adjust your filters to see more traveler stories.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="border border-[var(--hairline-strong)] bg-white p-8 flex gap-6 hover:border-[var(--primary)] transition-all group duration-300 hover:shadow-md">
                    {/* Avatar */}
                    <div className="w-[50px] h-[50px] rounded-full border border-[var(--hairline-strong)] shrink-0 flex items-center justify-center bg-[var(--surface-soft)] overflow-hidden">
                      {post.user.photoUrl ? (
                        <img src={post.user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[18px] font-bold text-[var(--ink)]">
                          {post.user.firstName[0]}{post.user.lastName[0]}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                        <h4 className="font-bold text-[20px] tracking-tight text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                          {post.user.firstName} {post.user.lastName}
                        </h4>
                        <span suppressHydrationWarning className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted)]">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-[var(--hairline)]">
                        {post.activity && (
                          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
                            {post.activity}
                          </span>
                        )}
                        {post.location && (
                          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[var(--ink)] flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {post.location}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[16px] font-light leading-[1.7] text-[var(--body)]">
                        {post.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Search & Filters Widget */}
          <div className="lg:col-span-4 lg:sticky lg:top-[100px] flex flex-col gap-6">
            <div className="border border-[var(--hairline-strong)] bg-white p-8">
              <h3 className="text-[18px] font-bold tracking-tight mb-6 text-[var(--ink)]">Search & Filter</h3>
              
              <form onSubmit={handleSearch} className="flex flex-col gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted)] mb-2 block">Search Query</label>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--surface-soft)] border border-transparent h-12 px-4 text-[14px] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:bg-white focus:border-[var(--primary)] transition-all"
                  />
                </div>
                
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted)] mb-2 block">Group By</label>
                  <div className="relative">
                    <button type="button" onClick={() => setActiveDropdown(activeDropdown === "group" ? null : "group")} className="w-full flex items-center justify-between h-12 px-4 border border-[var(--hairline-strong)] text-[12px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] transition-colors text-[var(--ink)] bg-white">
                      <span>Group By</span>
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === "group" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {/* Dropdown implementation can be expanded here if needed */}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted)] mb-2 block">Filter Selection</label>
                  <div className="relative">
                    <button type="button" onClick={() => setActiveDropdown(activeDropdown === "filter" ? null : "filter")} className="w-full flex items-center justify-between h-12 px-4 border border-[var(--hairline-strong)] text-[12px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] transition-colors text-[var(--ink)] bg-white">
                      <span>{filterBy === "all" ? "All Posts" : filterBy === "activity" ? "By Activity" : "By Location"}</span>
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === "filter" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {activeDropdown === "filter" && (
                      <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[var(--hairline-strong)] shadow-xl z-20 flex flex-col">
                        <button type="button" onClick={() => { setFilterBy("all"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)] text-[var(--ink)] transition-colors">All Posts</button>
                        <button type="button" onClick={() => { setFilterBy("activity"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)] text-[var(--ink)] transition-colors">By Activity</button>
                        <button type="button" onClick={() => { setFilterBy("location"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] text-[var(--ink)] transition-colors">By Location</button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted)] mb-2 block">Sort Order</label>
                  <div className="relative">
                    <button type="button" onClick={() => setActiveDropdown(activeDropdown === "sort" ? null : "sort")} className="w-full flex items-center justify-between h-12 px-4 border border-[var(--hairline-strong)] text-[12px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] transition-colors text-[var(--ink)] bg-white">
                      <span>{sortBy === "newest" ? "Newest First" : "Oldest First"}</span>
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === "sort" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {activeDropdown === "sort" && (
                      <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[var(--hairline-strong)] shadow-xl z-20 flex flex-col">
                        <button type="button" onClick={() => { setSortBy("newest"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] border-b border-[var(--hairline)] text-[var(--ink)] transition-colors">Newest First</button>
                        <button type="button" onClick={() => { setSortBy("oldest"); setActiveDropdown(null); }} className="px-4 py-3 text-left text-[13px] font-bold uppercase tracking-[1px] hover:bg-[var(--surface-soft)] text-[var(--ink)] transition-colors">Oldest First</button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="border border-[var(--hairline-strong)] bg-[var(--surface-soft)] p-8">
               <h3 className="text-[14px] font-bold tracking-tight mb-2 text-[var(--ink)]">Community Guidelines</h3>
               <p className="text-[14px] font-light text-[var(--muted)] leading-relaxed mb-4">
                 Keep it professional, respectful, and helpful. Authentic tips help everyone travel better.
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
