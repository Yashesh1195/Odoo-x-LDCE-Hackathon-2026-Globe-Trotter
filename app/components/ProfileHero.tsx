"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import type { UserProfileData } from "../actions/profile";
import { logoutUser } from "../actions/auth";

interface ProfileHeroProps {
  user: UserProfileData;
  onSave: (data: Partial<UserProfileData>) => Promise<boolean>;
}

export default function ProfileHero({ user, onSave }: ProfileHeroProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [city, setCity] = useState(user.city);
  const [country, setCountry] = useState(user.country);
  const [additionalInfo, setAdditionalInfo] = useState(user.additionalInfo || "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset avatar choices
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80",
  ];

  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber);
    setCity(user.city);
    setCountry(user.country);
    setAdditionalInfo(user.additionalInfo || "");
    setPhotoUrl(user.photoUrl || "");
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    let finalPhotoUrl = photoUrl;

    // Upload new photo to Cloudinary if a file was selected
    if (photoFile) {
      setIsUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", photoFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.url;
          setPhotoUrl(finalPhotoUrl);
        } else {
          console.error("Photo upload failed");
        }
      } catch (err) {
        console.error("Photo upload error:", err);
      } finally {
        setIsUploading(false);
      }
    }

    const success = await onSave({
      firstName,
      lastName,
      phoneNumber,
      city,
      country,
      additionalInfo,
      photoUrl: finalPhotoUrl,
    });

    setIsSaving(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <section
      id="profile-hero-section"
      className="w-full bg-[var(--canvas)] border-b border-[var(--hairline)]"
      style={{ padding: "48px 24px 56px" }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-[#f0fdf4] border border-[var(--success)] text-[#166534] flex items-center justify-between text-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <span>Profile information updated successfully.</span>
            </div>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-[#166534] font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Section Wireframe Layout: Left Avatar | Right User Details */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* ── Left Column: User Avatar ── */}
          <div className="flex flex-col items-center sm:items-start lg:items-center shrink-0 w-full sm:w-auto">
            <div className="relative group">
              <div
                className="relative overflow-hidden bg-[var(--surface-card)]"
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: "9999px",
                  border: "3px solid var(--primary)",
                  padding: 3,
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${firstName} ${lastName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--primary)]">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div
                className="absolute bottom-1 right-1 bg-[var(--success)] border-2 border-white rounded-full"
                style={{ width: 20, height: 20 }}
                title="Active Member"
              />
            </div>

            {/* Avatar Caption */}
            <div className="mt-3 text-center">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Verified Traveler
              </span>
            </div>

            {/* Avatar preset selection in edit mode */}
            {isEditing && (
              <div className="mt-4 flex flex-col items-center gap-2 animate-fadeIn">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Choose Avatar
                </span>
                <div className="flex gap-2">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 ${
                        photoUrl === preset ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--hairline)]"
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: User Details with Appropriate Option to Edit ── */}
          <div className="flex-1 w-full bg-[var(--surface-card)] border border-[var(--hairline)] p-6 sm:p-8 relative">
            
            {/* View Mode */}
            {!isEditing ? (
              <div className="flex flex-col gap-6">
                {/* Header Row: Name & Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--hairline)]">
                  <div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                      }}
                    >
                      GlobeTrotter Member Profile
                    </span>
                    <h1
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        lineHeight: 1.15,
                        color: "var(--ink)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      {user.firstName} {user.lastName}
                    </h1>
                  </div>

                  {/* Profile Actions: Edit Profile & Sign Out */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                      id="edit-profile-btn"
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="bmw-button-primary cursor-pointer flex items-center justify-center gap-2"
                      style={{
                        height: 44,
                        padding: "0 24px",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        border: "none",
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      <span>Edit Profile</span>
                    </button>

                    <button
                      id="profile-signout-btn"
                      type="button"
                      onClick={async () => {
                        try {
                          await logoutUser();
                        } catch {}
                        try {
                          await fetch("/api/auth/logout", { method: "POST" });
                        } catch {}
                        try {
                          localStorage.removeItem("gt_user");
                          sessionStorage.clear();
                          document.cookie = "gt_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                          document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                        } catch {}
                        window.location.href = "/login";
                      }}
                      className="cursor-pointer flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-700 transition-colors"
                      style={{
                        height: 44,
                        padding: "0 18px",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        border: "1px solid var(--hairline-strong)",
                        backgroundColor: "transparent",
                        color: "var(--error)",
                      }}
                      title="Sign Out of GlobeTrotter"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid: 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Email Address
                    </span>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "var(--ink)",
                        margin: 0,
                      }}
                    >
                      {user.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Contact Number
                    </span>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "var(--ink)",
                        margin: 0,
                      }}
                    >
                      {user.phoneNumber || "+91 98765 43210"}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Home Location
                    </span>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "var(--ink)",
                        margin: 0,
                      }}
                    >
                      {user.city ? `${user.city}, ${user.country}` : "Ahmedabad, India"}
                    </p>
                  </div>

                  {/* Member Stats */}
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--muted)",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Member Since
                    </span>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "var(--ink)",
                        margin: 0,
                      }}
                    >
                      {user.memberSince || "March 2024"}
                    </p>
                  </div>
                </div>

                {/* Bio / Description */}
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    About Traveler
                  </span>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 300,
                      lineHeight: 1.6,
                      color: "var(--body)",
                      margin: 0,
                    }}
                  >
                    {user.additionalInfo || "Passionate globetrotter exploring architectural wonders, mountain landscapes, and cultural heritage around the globe."}
                  </p>
                </div>
              </div>
            ) : (
              /* Inline Edit Mode */
              <form onSubmit={handleSave} className="flex flex-col gap-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--hairline)]">
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                      }}
                    >
                      Edit Mode
                    </span>
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--ink)",
                        margin: "2px 0 0 0",
                      }}
                    >
                      Update Profile Details
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bmw-input bg-white border border-[var(--hairline-strong)] px-4 text-sm h-11 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bmw-input bg-white border border-[var(--hairline-strong)] px-4 text-sm h-11 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bmw-input bg-white border border-[var(--hairline-strong)] px-4 text-sm h-11 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      className="bmw-input bg-white border border-[var(--hairline-strong)] px-4 text-sm h-11 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                      className="bmw-input bg-white border border-[var(--hairline-strong)] px-4 text-sm h-11 text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none"
                    />
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                      Profile Photo
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Current / Preview photo */}
                      <div
                        className="relative overflow-hidden bg-[var(--surface-soft)] shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "9999px",
                          border: "2px solid var(--hairline-strong)",
                        }}
                      >
                        {(photoPreview || photoUrl) ? (
                          <img
                            src={photoPreview || photoUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full flex items-center justify-center text-[var(--muted)]">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Upload button + hidden file input */}
                      <div className="flex flex-col gap-1.5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.type.startsWith("image/")) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Image must be less than 5MB");
                                return;
                              }
                              setPhotoFile(file);
                              setPhotoPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-colors"
                          style={{
                            height: 36,
                            padding: "0 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "1px",
                            textTransform: "uppercase" as const,
                            border: "1px solid var(--hairline-strong)",
                            backgroundColor: "transparent",
                            color: "var(--ink)",
                          }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {photoFile ? "Change Photo" : "Upload Photo"}
                        </button>
                        {photoFile && (
                          <span className="text-[11px] text-[var(--success)] font-bold">
                            ✓ {photoFile.name} selected
                          </span>
                        )}
                        {!photoFile && (
                          <span className="text-[11px] text-[var(--muted)] font-light">
                            JPG, PNG, WebP — max 5MB
                          </span>
                        )}
                      </div>

                      {/* Remove photo */}
                      {(photoPreview || photoUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl("");
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-[11px] font-bold uppercase tracking-wider text-red-600 hover:underline cursor-pointer self-center"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[var(--ink)]">
                    Traveler Bio & Preferences
                  </label>
                  <textarea
                    rows={3}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Share your travel interests, favorite destinations, travel style..."
                    className="bmw-input bg-white border border-[var(--hairline-strong)] p-3 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] rounded-none resize-none font-light"
                  />
                </div>

                {/* Form CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bmw-button-primary cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      height: 44,
                      padding: "0 28px",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      border: "none",
                    }}
                  >
                    {isSaving ? (isUploading ? "UPLOADING PHOTO..." : "SAVING...") : "SAVE CHANGES"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="cursor-pointer"
                    style={{
                      height: 44,
                      padding: "0 20px",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      backgroundColor: "transparent",
                      color: "var(--ink)",
                      border: "1px solid var(--hairline-strong)",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
