"use client";

import React, { useEffect, useRef } from "react";

interface TripPlanViewerProps {
  content: string;
  isStreaming: boolean;
  onClose: () => void;
  onStartOver: () => void;
}

/**
 * Lightweight markdown-to-HTML renderer that handles the subset of
 * Markdown the Gemini prompt generates: headings, bold, tables, lists,
 * horizontal rules, and code. No external dependency needed.
 */
function renderMarkdown(md: string): string {
  if (!md) return "";

  // 1. Process inline formatting (bold & italic)
  let html = md
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--ink);">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // 2. Parse lines for block elements
  const lines = html.split("\n");
  const resultLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) {
        resultLines.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line)) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push('<hr style="border:none;border-top:1px solid var(--hairline);margin:24px 0;" />');
      continue;
    }

    // Headings
    if (line.startsWith("#### ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h4 style="font-size:16px;font-weight:700;color:var(--ink);margin:24px 0 8px;line-height:1.4;">${line.slice(5)}</h4>`);
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h3 style="font-size:20px;font-weight:700;color:var(--ink);margin:32px 0 12px;line-height:1.3;padding-bottom:8px;border-bottom:1px solid var(--hairline);">${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h2 style="font-size:24px;font-weight:700;color:var(--ink);margin:32px 0 12px;line-height:1.25;">${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h1 style="font-size:32px;font-weight:700;color:var(--ink);margin:0 0 16px;line-height:1.15;">${line.slice(2)}</h1>`);
      continue;
    }

    // Bullet list items (- or *)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        resultLines.push('<ul style="margin:8px 0 16px;padding-left:20px;list-style-type:disc;">');
        inList = true;
      }
      const itemText = line.slice(2);
      resultLines.push(`<li style="font-size:14px;font-weight:300;line-height:1.65;color:var(--body);margin-bottom:4px;padding-left:4px;">${itemText}</li>`);
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      if (!inList) {
        resultLines.push('<ol style="margin:8px 0 16px;padding-left:20px;list-style-type:decimal;">');
        inList = true;
      }
      const itemText = line.replace(/^\d+\.\s/, "");
      resultLines.push(`<li style="font-size:14px;font-weight:300;line-height:1.65;color:var(--body);margin-bottom:4px;padding-left:4px;">${itemText}</li>`);
      continue;
    }

    // Close list if line is not a list item
    if (inList) {
      resultLines.push("</ul>");
      inList = false;
    }

    // Raw HTML, Table rows, or Paragraphs
    if (line.startsWith("|") || line.startsWith("<")) {
      resultLines.push(line);
    } else {
      resultLines.push(`<p style="font-size:14px;font-weight:300;line-height:1.55;color:var(--body);margin:0 0 8px;">${line}</p>`);
    }
  }

  if (inList) {
    resultLines.push("</ul>");
  }

  // 3. Process tables
  return resultLines.join("\n").replace(
    /^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_match, headerRow: string, _separator: string, bodyRows: string) => {
      const headers = headerRow
        .split("|")
        .filter((c: string) => c.trim())
        .map(
          (c: string) =>
            `<th style="padding:8px 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);border-bottom:2px solid var(--hairline-strong);text-align:left;">${c.trim()}</th>`
        )
        .join("");

      const rows = bodyRows
        .trim()
        .split("\n")
        .map((row: string) => {
          const cells = row
            .split("|")
            .filter((c: string) => c.trim())
            .map(
              (c: string) =>
                `<td style="padding:8px 12px;font-size:14px;font-weight:300;color:var(--body);border-bottom:1px solid var(--hairline);">${c.trim()}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      return `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
  );
}

export default function TripPlanViewer({
  content,
  isStreaming,
  onClose,
  onStartOver,
}: TripPlanViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content, isStreaming]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fadeIn"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--hairline)",
          backgroundColor: "var(--canvas)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            AI
          </div>
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Your Trip Plan
            </h2>
            <p
              style={{
                fontSize: 12,
                fontWeight: 300,
                color: "var(--muted)",
                margin: 0,
              }}
            >
              {isStreaming
                ? "AI is generating your plan..."
                : "Plan generated successfully"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-2 mr-4">
              <div
                className="animate-pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "9999px",
                  backgroundColor: "var(--primary)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--primary)",
                  letterSpacing: "0.5px",
                }}
              >
                STREAMING
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="hover:bg-[var(--surface-soft)] transition-colors"
            style={{
              width: 36,
              height: 36,
              border: "1px solid var(--hairline)",
              backgroundColor: "transparent",
              cursor: "pointer",
              fontSize: 18,
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Streaming Progress ── */}
      {isStreaming && (
        <div
          style={{
            height: 3,
            backgroundColor: "var(--surface-strong)",
            overflow: "hidden",
          }}
        >
          <div
            className="streaming-bar"
            style={{
              height: "100%",
              backgroundColor: "var(--primary)",
              width: "30%",
              animation: "streamPulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* ── Content ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          padding: "0",
        }}
      >
        <div
          className="max-w-[800px] mx-auto"
          style={{ padding: "32px 24px 120px" }}
        >
          {content ? (
            <div
              className="trip-plan-content"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content),
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
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
                Preparing your personalized trip plan...
              </p>
            </div>
          )}

          {/* Streaming cursor */}
          {isStreaming && (
            <span
              className="inline-block animate-pulse"
              style={{
                width: 8,
                height: 18,
                backgroundColor: "var(--primary)",
                marginLeft: 2,
                verticalAlign: "text-bottom",
              }}
            />
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Footer Actions ── */}
      {!isStreaming && content && (
        <div
          className="flex items-center justify-between flex-shrink-0 animate-slideUp"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--hairline)",
            backgroundColor: "var(--canvas)",
          }}
        >
          <button
            onClick={onStartOver}
            style={{
              padding: "13px 24px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.5px",
              border: "1px solid var(--hairline-strong)",
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            ← Plan Another Trip
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                alert("Trip plan copied to clipboard!");
              }}
              style={{
                padding: "13px 24px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "1px solid var(--hairline-strong)",
                backgroundColor: "var(--canvas)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              Copy Plan
            </button>
            <button
              onClick={() => {
                const blob = new Blob([content], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "trip-plan.md";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="bmw-button-primary"
              style={{
                padding: "14px 28px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save as File
            </button>
          </div>
        </div>
      )}

      {/* ── Inline Styles for streaming animation ── */}
      <style jsx>{`
        @keyframes streamPulse {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}
