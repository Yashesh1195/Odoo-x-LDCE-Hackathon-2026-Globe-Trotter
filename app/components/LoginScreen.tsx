"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { loginUser } from "../actions/auth";

interface LoginScreenProps {
  onSuccess?: (username: string) => void;
  onNavigateToRegister?: () => void;
}

export default function LoginScreen({
  onSuccess,
  onNavigateToRegister,
}: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const router = useRouter();

  // Sample avatar presets
  const defaultAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
  ];

  const handleQuickFill = (user: string, pass: string, avatarIdx?: number) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage("");
    if (avatarIdx !== undefined) {
      setPhotoUrl(defaultAvatars[avatarIdx]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Please enter your email/username.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser({ username, password });

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(result.user?.firstName || username);
      } else {
        setTimeout(() => router.push("/dashboard"), 1000);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
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
              Member Portal
            </span>
          </div>
        </Link>

        {/* Global utility & registration links */}
        <div className="flex items-center gap-5 text-[13px] font-bold tracking-[1.5px] uppercase">
          <span className="hidden md:inline text-[#262626] text-xs">EN / GLOBAL</span>
          {onNavigateToRegister ? (
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-[#1c69d4] hover:text-[#0653b6] cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              CREATE ACCOUNT ›
            </button>
          ) : (
            <Link
              href="/register"
              className="text-[#1c69d4] hover:text-[#0653b6] cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              CREATE ACCOUNT ›
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
        {/* Ambient Background Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
          <span className="text-[34vw] font-bold select-none text-[#1a2129] tracking-tighter">GT</span>
        </div>

        {/* Outer Framed Card (Screen 1 Structure) */}
        <div className="w-full max-w-[480px] bg-white border border-[#e6e6e6] p-6 sm:p-10 shadow-sm relative z-10">
          
          {/* Inner Card & Wireframe Layout */}
          <div className="w-full flex flex-col items-center">
            
            {/* 1. Photo / Avatar (Circular - Wireframe Top Element - No add button) */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#1c69d4] p-1 bg-[#fafafa] flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="User avatar preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#f0f3f8] flex flex-col items-center justify-center text-[#1c69d4]">
                    {/* Executive / User Silhouette SVG */}
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

              {/* Photo Label */}
              <div className="mt-3 text-center">
                <span className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#6b6b6b]">
                  {photoUrl ? "MEMBER PROFILE" : "PHOTO"}
                </span>
              </div>
            </div>

            {/* Title / Headline (BMW 700 Display vs 300 Light Subheading) */}
            <div className="w-full text-center mb-6">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#262626] leading-tight tracking-tight">
                AUTHENTICATION
              </h1>
              <p className="text-[14px] font-light text-[#6b6b6b] mt-1">
                Enter your authorized credentials to access your dashboard.
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
              <div className="w-full mb-5 p-4 bg-[#f0fdf4] border border-[#22c55e] text-[#166534] text-[13px] text-center animate-fadeIn">
                <div className="font-bold mb-1">✓ ACCESS GRANTED</div>
                <div className="font-light">
                  Welcome back, <strong className="font-bold">{username}</strong>. Initializing secure session...
                </div>
              </div>
            )}

            {/* Login Form (Wireframe: Username -> Password -> Login Button) */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              
              {/* 2. Username Input */}
              <div className="flex flex-col gap-1.5 text-left w-full">
                <label
                  htmlFor="username"
                  className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a9a9a]">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full h-12 pl-10 pr-4 bg-white border border-[#e6e6e6] text-[#262626] text-[15px] font-light placeholder:text-[#9a9a9a] placeholder:font-light rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                </div>
              </div>

              {/* 3. Password Input */}
              <div className="flex flex-col gap-1.5 text-left w-full">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-bold uppercase tracking-[1.5px] text-[#262626]"
                  >
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Password recovery link has been sent to your registered email address.");
                    }}
                    className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#1c69d4] hover:underline"
                  >
                    FORGOT?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a9a9a]">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-10 pr-11 bg-white border border-[#e6e6e6] text-[#262626] text-[15px] font-light placeholder:text-[#9a9a9a] rounded-none transition-colors focus:outline-none focus:border-[#262626] focus:ring-0"
                  />
                  {/* Show/Hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6b6b6b] hover:text-[#262626] focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Utility Row: Remember Me */}
              <div className="flex items-center justify-between text-[13px] pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-none border-[#cccccc] text-[#1c69d4] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#1c69d4]"
                  />
                  <span className="font-light text-[#3c3c3c]">Remember device</span>
                </label>
              </div>

              {/* 4. Login Button (Wireframe Bottom Element - 0px rectangular, #1c69d4) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-[#1c69d4] hover:bg-[#0653b6] active:bg-[#044293] text-white text-[14px] font-bold uppercase tracking-[1.5px] rounded-none transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <span>LOG IN</span>
                )}
              </button>
            </form>

            {/* Registration Action Prompt */}
            <div className="w-full mt-6 text-center">
              <span className="text-[13px] font-light text-[#6b6b6b]">
                Don't have an account?{" "}
              </span>
              {onNavigateToRegister ? (
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-[13px] font-bold text-[#1c69d4] hover:underline uppercase tracking-wider ml-1 cursor-pointer"
                >
                  Register Here ›
                </button>
              ) : (
                <Link
                  href="/register"
                  className="text-[13px] font-bold text-[#1c69d4] hover:underline uppercase tracking-wider ml-1 cursor-pointer"
                >
                  Register Here ›
                </Link>
              )}
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
          <a href="#legal" className="hover:text-[#262626] transition-colors">
            Legal Notice
          </a>
          <a href="#cookie" className="hover:text-[#262626] transition-colors">
            Cookie Settings
          </a>
        </div>
      </footer>
    </div>
  );
}
