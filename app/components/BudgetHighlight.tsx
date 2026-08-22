"use client";

import React from "react";
import type { BudgetSummary } from "@/app/lib/types";

interface BudgetHighlightProps {
  budget: BudgetSummary;
}

export default function BudgetHighlight({ budget }: BudgetHighlightProps) {
  const spentPercent = Math.round(
    (budget.totalSpent / budget.totalBudget) * 100
  );

  return (
    <section
      id="budget-highlight"
      className="max-w-[1440px] mx-auto animate-fadeIn"
      style={{ padding: "0 24px 48px" }}
    >
      {/* ── Section Header ── */}
      <div className="flex items-center gap-4 mb-6">
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--ink)",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          Budget Overview
        </h2>
        <div
          className="flex-1"
          style={{
            height: 1,
            backgroundColor: "var(--hairline)",
          }}
        />
      </div>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {/* ── Summary Card ── */}
        <div
          style={{
            backgroundColor: "var(--surface-dark)",
            padding: 24,
          }}
        >
          {/* Spec cells */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                value: `$${budget.totalBudget.toLocaleString()}`,
                label: "TOTAL BUDGET",
              },
              {
                value: `$${budget.totalSpent.toLocaleString()}`,
                label: "SPENT",
              },
              {
                value: `$${budget.remaining.toLocaleString()}`,
                label: "REMAINING",
              },
            ].map((cell) => (
              <div key={cell.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: "var(--on-dark)",
                  }}
                >
                  {cell.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase" as const,
                    color: "var(--on-dark-soft)",
                    marginTop: 6,
                  }}
                >
                  {cell.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase" as const,
                  color: "var(--on-dark-soft)",
                }}
              >
                Utilization
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--on-dark)",
                }}
              >
                {spentPercent}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: "var(--surface-dark-elevated)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${spentPercent}%`,
                  backgroundColor: "var(--primary)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Category Breakdown ── */}
        <div
          style={{
            backgroundColor: "var(--surface-soft)",
            padding: 24,
          }}
        >
          <h3
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase" as const,
              color: "var(--muted)",
              margin: "0 0 16px 0",
            }}
          >
            Spending by Category
          </h3>

          <div className="flex flex-col gap-3">
            {budget.categoryBreakdown.map((cat) => {
              const catPercent = Math.round(
                (cat.amount / budget.totalSpent) * 100
              );
              return (
                <div key={cat.category}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 300,
                        color: "var(--body)",
                      }}
                    >
                      {cat.category}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      backgroundColor: "var(--surface-strong)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${catPercent}%`,
                        backgroundColor: "var(--primary)",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
