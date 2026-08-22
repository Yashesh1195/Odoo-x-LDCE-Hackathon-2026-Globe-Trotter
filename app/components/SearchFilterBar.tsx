"use client";

import React, { useState, useRef, useEffect } from "react";
import type { SortField, FilterOption, GroupOption } from "@/app/lib/types";

interface SearchFilterBarProps {
  onSearch: (query: string) => void;
  onSort: (field: SortField) => void;
  onFilter: (filter: FilterOption) => void;
  onGroup: (group: GroupOption) => void;
  currentSort: SortField;
  currentFilter: FilterOption;
  currentGroup: GroupOption;
}

type DropdownType = "sort" | "filter" | "group" | null;

export default function SearchFilterBar({
  onSearch,
  onSort,
  onFilter,
  onGroup,
  currentSort,
  currentFilter,
  currentGroup,
}: SearchFilterBarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "budget", label: "Budget" },
    { value: "date", label: "Date" },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All Trips" },
    { value: "upcoming", label: "Upcoming" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const groupOptions: { value: GroupOption; label: string }[] = [
    { value: "none", label: "No Grouping" },
    { value: "region", label: "Region" },
    { value: "status", label: "Status" },
    { value: "month", label: "Month" },
  ];

  const toggleDropdown = (type: DropdownType) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const buttonBaseStyle: React.CSSProperties = {
    backgroundColor: "var(--canvas)",
    color: "var(--ink)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.5px",
    padding: "10px 18px",
    border: "1px solid var(--hairline-strong)",
    cursor: "pointer",
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap" as const,
  };

  return (
    <div
      id="search-filter-bar"
      ref={dropdownRef}
      className="max-w-[1440px] mx-auto"
      style={{ padding: "24px 24px 0" }}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* ── Search Input ── */}
        <div className="relative flex-1">
          {/* Search Icon */}
          <svg
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: 14, width: 16, height: 16, color: "var(--muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Search destinations, trips..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bmw-input w-full"
            style={{
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.55,
              padding: "12px 16px 12px 40px",
              border: "1px solid var(--hairline)",
              height: 48,
              outline: "none",
            }}
          />
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-2 relative">
          {/* Group By */}
          <div className="relative">
            <button
              id="group-by-btn"
              onClick={() => toggleDropdown("group")}
              style={{
                ...buttonBaseStyle,
                borderColor:
                  openDropdown === "group"
                    ? "var(--ink)"
                    : "var(--hairline-strong)",
              }}
            >
              <svg
                style={{ width: 14, height: 14 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="hidden sm:inline">Group by</span>
            </button>
            {openDropdown === "group" && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border border-[var(--hairline)] z-20 animate-fadeIn"
                style={{ minWidth: 160 }}
              >
                {groupOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onGroup(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left hover:bg-[var(--surface-soft)] transition-colors"
                    style={{
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: currentGroup === opt.value ? 700 : 300,
                      color:
                        currentGroup === opt.value
                          ? "var(--primary)"
                          : "var(--body)",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              id="filter-btn"
              onClick={() => toggleDropdown("filter")}
              style={{
                ...buttonBaseStyle,
                backgroundColor:
                  currentFilter !== "all"
                    ? "var(--ink)"
                    : "var(--canvas)",
                color:
                  currentFilter !== "all"
                    ? "var(--on-dark)"
                    : "var(--ink)",
                borderColor:
                  openDropdown === "filter"
                    ? "var(--ink)"
                    : "var(--hairline-strong)",
              }}
            >
              <svg
                style={{ width: 14, height: 14 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
              <span className="hidden sm:inline">Filter</span>
            </button>
            {openDropdown === "filter" && (
              <div
                className="absolute top-full left-0 mt-1 bg-white border border-[var(--hairline)] z-20 animate-fadeIn"
                style={{ minWidth: 160 }}
              >
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onFilter(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left hover:bg-[var(--surface-soft)] transition-colors"
                    style={{
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: currentFilter === opt.value ? 700 : 300,
                      color:
                        currentFilter === opt.value
                          ? "var(--primary)"
                          : "var(--body)",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <div className="relative">
            <button
              id="sort-by-btn"
              onClick={() => toggleDropdown("sort")}
              style={{
                ...buttonBaseStyle,
                borderColor:
                  openDropdown === "sort"
                    ? "var(--ink)"
                    : "var(--hairline-strong)",
              }}
            >
              <svg
                style={{ width: 14, height: 14 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="18" x2="12" y2="18" />
              </svg>
              <span className="hidden sm:inline">Sort by...</span>
            </button>
            {openDropdown === "sort" && (
              <div
                className="absolute top-full right-0 mt-1 bg-white border border-[var(--hairline)] z-20 animate-fadeIn"
                style={{ minWidth: 160 }}
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSort(opt.value);
                      setOpenDropdown(null);
                    }}
                    className="block w-full text-left hover:bg-[var(--surface-soft)] transition-colors"
                    style={{
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: currentSort === opt.value ? 700 : 300,
                      color:
                        currentSort === opt.value
                          ? "var(--primary)"
                          : "var(--body)",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
