"use client";

import React, { useState } from "react";
import Link from "next/link";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "register">("login");

  return (
    <div className="relative min-h-screen">
      {/* Route Quick Navigation Toolbar (Dev / Demonstration) */}
      <aside aria-label="Route Navigation" className="fixed bottom-4 right-4 z-50 bg-[#1a2129] text-white p-1.5 rounded-none border border-[#3c3c3c] shadow-2xl flex items-center gap-2 text-xs">
        <span className="text-[10px] text-[#9a9a9a] uppercase tracking-wider pl-1 font-mono">
          Routes:
        </span>
        <Link
          href="/login"
          onClick={() => setCurrentScreen("login")}
          className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            currentScreen === "login"
              ? "bg-[#1c69d4] text-white"
              : "text-[#bbbbbb] hover:text-white bg-[#262e38]"
          }`}
        >
          /login
        </Link>
        <Link
          href="/register"
          onClick={() => setCurrentScreen("register")}
          className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            currentScreen === "register"
              ? "bg-[#1c69d4] text-white"
              : "text-[#bbbbbb] hover:text-white bg-[#262e38]"
          }`}
        >
          /register
        </Link>
      </aside>

      {/* Screen Render */}
      {currentScreen === "login" ? (
        <LoginScreen onNavigateToRegister={() => setCurrentScreen("register")} />
      ) : (
        <RegisterScreen onNavigateToLogin={() => setCurrentScreen("login")} />
      )}
    </div>
  );
}
