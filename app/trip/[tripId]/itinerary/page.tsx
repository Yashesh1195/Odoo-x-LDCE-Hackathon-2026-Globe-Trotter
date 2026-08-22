"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { getItinerary, generateItinerary, addItinerarySection, updateItinerarySection, deleteItinerarySection } from "../../../actions/trip";

interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  budget: string;
}

export default function BuildItineraryPage({ params, searchParams }: { params: Promise<{ tripId: string }>, searchParams: Promise<{ activity?: string }> }) {
  const resolvedParams = React.use(params);
  const resolvedSearchParams = React.use(searchParams);

  const [sections, setSections] = useState<ItinerarySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for CRUD
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", dateRange: "", budget: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const tripId = resolvedParams.tripId;
  const activity = resolvedSearchParams.activity || "your trip";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getItinerary(tripId);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        if (res.sections && res.sections.length > 0) {
          setSections(res.sections);
        } else {
          const genRes = await generateItinerary(tripId, activity);
          if (genRes.error) {
            setError(genRes.error);
          } else if (genRes.sections) {
            setSections(genRes.sections);
          }
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tripId, activity]);

  const handleEditClick = (section: ItinerarySection) => {
    setEditingId(section.id);
    setFormData({ title: section.title, description: section.description, dateRange: section.dateRange, budget: section.budget });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ title: "", description: "", dateRange: "", budget: "" });
  };

  const handleSave = async (sectionId?: string) => {
    if (!formData.title || !formData.description) return;
    setActionLoading(true);
    
    if (sectionId) {
      // Update
      const res = await updateItinerarySection(sectionId, formData);
      if (res.success && res.section) {
        setSections(sections.map(s => s.id === sectionId ? res.section as ItinerarySection : s));
      } else {
        alert(res.error || "Failed to update");
      }
    } else {
      // Add
      const res = await addItinerarySection(tripId, formData);
      if (res.success && res.section) {
        setSections([...sections, res.section as ItinerarySection]);
      } else {
        alert(res.error || "Failed to add");
      }
    }
    
    setActionLoading(false);
    handleCancel();
  };

  const handleDelete = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    setActionLoading(true);
    const res = await deleteItinerarySection(sectionId);
    if (res.success) {
      setSections(sections.filter(s => s.id !== sectionId));
    } else {
      alert(res.error || "Failed to delete");
    }
    setActionLoading(false);
  };

  const renderForm = (sectionId?: string) => (
    <div className="border border-[var(--hairline-strong)] bg-[var(--surface-card)] p-6">
      <h3 className="text-[20px] font-bold mb-4">{sectionId ? "Edit Section" : "Add New Section"}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-[14px] font-bold mb-1">Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-[16px] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>
        <div>
          <label className="block text-[14px] font-bold mb-1">Description</label>
          <textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-[var(--canvas)] text-[var(--ink)] px-4 py-3 rounded-none border border-[var(--hairline-strong)] text-[16px] min-h-[120px] focus:outline-none focus:border-[var(--ink)]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[14px] font-bold mb-1">Date</label>
            <input 
              type="date" 
              value={formData.dateRange} 
              onChange={e => setFormData({...formData, dateRange: e.target.value})}
              className="w-full bg-[var(--canvas)] text-[var(--ink)] h-12 px-4 rounded-none border border-[var(--hairline-strong)] text-[16px] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>
          <div>
            <label className="block text-[14px] font-bold mb-1">Budget</label>
            <div className="relative">
              <span className="absolute left-4 top-[14px] text-[var(--ink)] font-bold">₹</span>
              <input 
                type="number" 
                value={formData.budget.replace(/[^0-9]/g, '')} 
                onChange={e => setFormData({...formData, budget: `₹${e.target.value}`})}
                placeholder="5000"
                className="w-full bg-[var(--canvas)] text-[var(--ink)] h-12 pl-8 pr-4 rounded-none border border-[var(--hairline-strong)] text-[16px] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>
        </div>
        <div className="pt-4 flex gap-4">
          <button 
            onClick={() => handleSave(sectionId)}
            disabled={actionLoading}
            className="h-12 px-8 uppercase tracking-[1.5px] font-bold text-[13px] bg-[var(--primary)] text-white disabled:bg-[var(--primary-disabled)] disabled:text-[var(--muted)] hover:bg-[var(--primary-active)] transition-colors rounded-none"
          >
            {actionLoading ? "Saving..." : "Save Section"}
          </button>
          <button 
            onClick={handleCancel}
            disabled={actionLoading}
            className="h-12 px-8 uppercase tracking-[1.5px] font-bold text-[13px] border border-[var(--hairline-strong)] bg-transparent hover:bg-[var(--surface-strong)] transition-colors rounded-none text-[var(--ink)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)]">
      <Navbar />

      {/* Hero Band */}
      <div className="bg-[var(--surface-dark)] text-[var(--on-dark)] py-[80px] px-8 md:px-16 lg:px-32">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-[48px] md:text-[64px] font-bold leading-[1.05] mb-4">
            Build Itinerary
          </h1>
          <p className="text-[18px] md:text-[20px] font-bold text-[var(--on-dark-soft)] max-w-2xl">
            Detailed plans for <span className="font-bold text-[var(--primary)]">{activity}</span>
          </p>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-32 py-[80px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[16px] font-bold text-[var(--muted)]">Generating your perfect itinerary...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-[var(--error)] text-[var(--error)] font-bold">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                {editingId === section.id ? (
                  renderForm(section.id)
                ) : (
                  <div className="border border-[var(--hairline-strong)] bg-[var(--canvas)] p-6 relative group">
                    <div className="absolute top-6 right-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(section)} className="text-[12px] font-bold tracking-[1.5px] uppercase hover:text-[var(--primary)] transition-colors text-[var(--muted)]">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(section.id)} className="text-[12px] font-bold tracking-[1.5px] uppercase hover:text-red-600 transition-colors text-[var(--muted)]">
                        Delete
                      </button>
                    </div>

                    <h2 className="text-[20px] font-bold mb-3 pr-32">{section.title}</h2>
                    <p className="text-[16px] text-[var(--body)] mb-6 leading-relaxed max-w-4xl">
                      {section.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="border border-[var(--hairline-strong)] px-4 py-2 text-[14px] font-bold bg-[var(--surface-card)] rounded-none">
                        Date: <span className="font-normal">{section.dateRange}</span>
                      </div>
                      <div className="border border-[var(--hairline-strong)] px-4 py-2 text-[14px] font-bold bg-[var(--surface-card)] rounded-none">
                        Budget: <span className="font-normal">{section.budget.includes('₹') ? section.budget : `₹${section.budget.replace(/[^0-9]/g, '')}`}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAdding && (
              <div className="pt-4">
                {renderForm()}
              </div>
            )}

            {!isAdding && (
              <div className="pt-8 text-center">
                <button 
                  onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: "", description: "", dateRange: "", budget: "" }); }}
                  className="bmw-button-secondary border border-[var(--hairline-strong)] bg-[var(--canvas)] text-[var(--ink)] hover:bg-[var(--surface-strong)] transition-colors h-12 px-[31px] font-bold text-[14px] uppercase tracking-[0.5px] rounded-none"
                >
                  + Add another Section
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Basic Footer */}
      <footer className="bg-[var(--surface-soft)] text-[var(--body)] py-16 px-8 text-center text-[14px] font-light">
        <p>&copy; 2026 GT - Globe Trotter. All rights reserved.</p>
      </footer>
    </div>
  );
}
