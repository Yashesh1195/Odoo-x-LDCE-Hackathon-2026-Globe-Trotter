"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onSuccess?: (userData: any) => void;
}

export default function RegisterScreen({
  onNavigateToLogin,
  onSuccess,
}: RegisterScreenProps) {
  // Form fields matching Screen 2 wireframe
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    country: "",
    additionalInfo: "",
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setErrorMessage("");
    } else {
      setErrorMessage("Please select a valid image file (JPG, PNG, WebP).");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleQuickFill = () => {
    setFormData({
      firstName: "Marcus",
      lastName: "Sterling",
      email: "marcus.sterling@gt.corp",
      phoneNumber: "+1 (555) 392-8471",
      city: "Munich",
      country: "Germany",
      additionalInfo:
        "Senior Logistics Director requesting expedited multi-region access for GT fleet management operations.",
    });
    setPhotoUrl(
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80"
    );
    setErrorMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage("Please enter both First Name and Last Name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please provide a valid Email Address.");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setErrorMessage("Please enter a contact Phone Number.");
      return;
    }

    if (!formData.city.trim() || !formData.country.trim()) {
      setErrorMessage("Please enter both City and Country.");
      return;
    }

    setIsLoading(true);

    // Simulate API registration request
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess({ ...formData, photoUrl });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7] flex flex-col justify-between selection:bg-[#1c69d4] selection:text-white">
      {/* Top Header / Brand Bar */}
      <header className="w-full bg-white border-b border-[#e6e6e6] h-16 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-20">
        <Link href="/login" className="flex items-center gap-3">
          {/* GT Brand Logo */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1a2129] text-white shadow-sm ring-1 ring-black/5 font-bold text-sm tracking-wider">
            <span className="text-white flex items-center justify-center">
              <span className="text-[#1c69d4]">G</span>T
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider text-[#262626] uppercase">
              GT - Globe Trotter
            </span>
            <span className="text-[11px] font-light text-[#6b6b6b] tracking-wider uppercase">
              Member Registration
            </span>
          </div>
        </Link>

        {/* Navigation Switch to Login */}
        <div className="flex items-center gap-4 text-[13px] font-bold tracking-[1.5px] uppercase">
          <span className="hidden sm:inline text-[#6b6b6b] font-light text-[12px] lowercase tracking-normal">
            already have an account?
          </span>
          {onNavigateToLogin ? (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#1c69d4] hover:text-[#0653b6] cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              SIGN IN ›
            </button>
          ) : (
            <Link
              href="/login"
              className="text-[#1c69d4] hover:text-[#0653b6] cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              SIGN IN ›
            </Link>
          )}
        </div>
      </header>

      {/* Decorative M Tricolor Stripe */}
      <div className="w-full h-1 flex">
        <div className="flex-1 bg-[#0066b1]" />
        <div className="flex-1 bg-[#1c69d4]" />
        <div className="flex-1 bg-[#e22718]" />
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 relative">
        {/* Subtle Ambient Background Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
          <span className="text-[34vw] font-bold select-none text-[#1a2129] tracking-tighter">
            GT
          </span>
        </div>

        {/* Outer Framed Card (Screen 2 Structure) */}
        <div className="w-full max-w-[640px] bg-white border border-[#e6e6e6] p-6 sm:p-10 shadow-sm relative z-10">
          
          {/* Inner Card Container */}
          <div className="w-full flex flex-col items-center">
            
            {/* 1. Top Element: Circular Photo with Upload Option */}
            <div className="flex flex-col items-center mb-7">
              <div
                className={`relative group cursor-pointer transition-all duration-200 ${
                  isDragging ? "scale-105" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                title="Click or drag and drop to upload user photo"
              >
                {/* Circular Avatar Frame */}
                <div
                  className={`w-28 h-28 rounded-full border-2 p-1 bg-[#fafafa] flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    isDragging
                      ? "border-[#1c69d4] bg-[#f0f3f8]"
                      : "border-[#1c69d4] group-hover:border-[#0653b6]"
                  }`}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="User avatar preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#f0f3f8] flex flex-col items-center justify-center text-[#1c69d4] group-hover:bg-[#e4ebf5] transition-colors">
                      <svg
                        className="w-12 h-12 text-[#1c69d4]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Add Photo Floating Camera Badge */}
                <div
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1c69d4] group-hover:bg-[#0653b6] text-white flex items-center justify-center shadow-md transition-colors border-2 border-white"
                  title="Upload profile photo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Photo Label & Helper */}
              <div className="mt-2.5 text-center flex flex-col items-center">
                <span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#262626]">
                  {photoUrl ? "PROFILE PHOTO SET" : "ADD USER PHOTO"}
                </span>
                <span className="text-[11px] font-light text-[#6b6b6b] mt-0.5">
                  {photoUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto();
                      }}
                      className="text-[#dc2626] hover:underline uppercase text-[10px] font-bold tracking-wider cursor-pointer"
                    >
                      Remove Photo ✕
                    </button>
                  ) : (
                    "Click or drag to upload (JPG, PNG)"
                  )}
                </span>
              </div>
            </div>

            {/* Screen 2 Headline (BMW 700 Display / 300 Light) */}
            <div className="w-full text-center mb-6">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#262626] leading-tight tracking-tight">
                USER REGISTRATION
              </h1>
              <p className="text-[14px] font-light text-[#6b6b6b] mt-1">
                Complete the profile information below to create your account.
              </p>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="w-full mb-5 p-3.5 bg-[#fef2f2] border-l-4 border-[#dc2626] text-[#dc2626] text-[13px] flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="text-[#dc2626] hover:opacity-75 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success State Notification */}
            {isSuccess && (
              <div className="w-full mb-5 p-5 bg-[#f0fdf4] border border-[#22c55e] text-[#166534] text-[13px] text-center animate-fadeIn">
                <div className="font-bold text-[14px] mb-1">✓ REGISTRATION SUCCESSFUL</div>
                <div className="font-light">
                  User <strong className="font-bold">{formData.firstName} {formData.lastName}</strong> has been registered to GT - Globe Trotter.
                </div>
                {onNavigateToLogin ? (
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="mt-3 inline-block px-4 py-2 bg-[#166534] text-white text-[12px] font-bold uppercase tracking-wider rounded-none hover:bg-[#14532d] transition-colors cursor-pointer"
                  >
                    Proceed to Login ›
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="mt-3 inline-block px-4 py-2 bg-[#166534] text-white text-[12px] font-bold uppercase tracking-wider rounded-none hover:bg-[#14532d] transition-colors"
                  >
                    Proceed to Login ›
                  </Link>
                )}
              </div>
            )}

            {/* Registration Form (Exact Screen 2 Wireframe Layout) */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="firstName"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="lastName"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Doe"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>
              </div>

              {/* Row 2: Email Address & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="email"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="phoneNumber"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>
              </div>

              {/* Row 3: City & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="city"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. New York"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="country"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. United States"
                    className="w-full h-12 px-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>
              </div>

              {/* Row 4: Additional Information (Full Width Textarea) */}
              <div className="flex flex-col gap-1.5 text-left w-full">
                <label
                  htmlFor="additionalInfo"
                  className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                >
                  Additional Information ....
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Enter any additional operational details, special requirements, or role notes..."
                  className="w-full p-4 bg-white border border-[#e6e6e6] text-[#262626] text-[14px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0 resize-y"
                />
              </div>

              {/* Screen 2 CTA: Register Users (0px Rectangular, #1c69d4) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-3 bg-[#1c69d4] hover:bg-[#0653b6] active:bg-[#044293] text-white text-[14px] font-bold uppercase tracking-[1.5px] rounded-none transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>PROCESSING REGISTRATION...</span>
                  </>
                ) : (
                  <span>REGISTER USERS</span>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Option */}
            <div className="w-full mt-6 pt-5 border-t border-[#e6e6e6] flex items-center justify-between">
              <span className="text-[11px] font-light text-[#6b6b6b]">
                Testing shortcut:
              </span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#1c69d4] hover:underline cursor-pointer"
              >
                Auto-fill Sample Data ⚡
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer (DESIGN.md: surface-soft #f7f7f7, body-sm 14px / 300 Light, muted links) */}
      <footer className="w-full bg-[#f7f7f7] border-t border-[#e6e6e6] py-6 px-6 sm:px-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] font-light text-[#6b6b6b]">
        <div>
          © {new Date().getFullYear()} GT - Globe Trotter. All rights reserved.
        </div>
        <div className="flex items-center gap-6 font-normal">
          <a href="#privacy" className="hover:text-[#262626] transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-[#262626] transition-colors">
            Terms of Service
          </a>
          <a href="#help" className="hover:text-[#262626] transition-colors">
            Support Center
          </a>
        </div>
      </footer>
    </div>
  );
}
