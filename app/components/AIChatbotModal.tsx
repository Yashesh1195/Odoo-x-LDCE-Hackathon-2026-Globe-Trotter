"use client";

import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlannerModal: () => void;
}

// Starter prompt suggestions
const QUICK_PROMPTS = [
  "What is the best time of year to visit Santorini?",
  "Top 3 local dishes to try in Tokyo",
  "Plan a detailed 5-day trip to Paris with Where & When logistics",
  "What essentials should I pack for Switzerland in autumn?",
];

function formatMarkdown(text: string): string {
  if (!text) return "";

  // 1. Process inline formatting (bold & italic)
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--ink);">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // 2. Parse lines for block elements (headings, rules, bullet/numbered lists, paragraphs)
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
      resultLines.push('<hr style="border:none;border-top:1px solid var(--hairline);margin:16px 0;" />');
      continue;
    }

    // Headings
    if (line.startsWith("#### ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h4 style="font-size:15px;font-weight:700;color:var(--ink);margin:16px 0 6px;">${line.slice(5)}</h4>`);
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h3 style="font-size:17px;font-weight:700;color:var(--ink);margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--hairline);">${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) { resultLines.push("</ul>"); inList = false; }
      resultLines.push(`<h2 style="font-size:19px;font-weight:700;color:var(--ink);margin:20px 0 8px;">${line.slice(3)}</h2>`);
      continue;
    }

    // Bullet list items (- or *)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        resultLines.push('<ul style="margin:6px 0 12px;padding-left:18px;list-style-type:disc;">');
        inList = true;
      }
      const itemText = line.slice(2);
      resultLines.push(`<li style="font-size:13px;font-weight:300;line-height:1.55;color:var(--body);margin-bottom:3px;">${itemText}</li>`);
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      if (!inList) {
        resultLines.push('<ol style="margin:6px 0 12px;padding-left:18px;list-style-type:decimal;">');
        inList = true;
      }
      const itemText = line.replace(/^\d+\.\s/, "");
      resultLines.push(`<li style="font-size:13px;font-weight:300;line-height:1.55;color:var(--body);margin-bottom:3px;">${itemText}</li>`);
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
      resultLines.push(`<p style="font-size:14px;font-weight:300;line-height:1.55;color:var(--body);margin:0 0 6px;">${line}</p>`);
    }
  }

  if (inList) {
    resultLines.push("</ul>");
  }

  // 3. Process tables
  return resultLines.join("\n").replace(
    /^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_match, headerRow: string, _sep: string, bodyRows: string) => {
      const headers = headerRow
        .split("|")
        .filter((c) => c.trim())
        .map(
          (c) =>
            `<th style="padding:6px 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);border-bottom:2px solid var(--hairline-strong);text-align:left;">${c.trim()}</th>`
        )
        .join("");

      const rows = bodyRows
        .trim()
        .split("\n")
        .map((row) => {
          const cells = row
            .split("|")
            .filter((c) => c.trim())
            .map(
              (c) =>
                `<td style="padding:6px 10px;font-size:13px;font-weight:300;color:var(--body);border-bottom:1px solid var(--hairline);">${c.trim()}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      return `<div style="overflow-x:auto;margin:12px 0;"><table style="width:100%;border-collapse:collapse;background-color:var(--canvas);">${headers ? `<thead><tr>${headers}</tr></thead>` : ""}${rows ? `<tbody>${rows}</tbody>` : ""}</table></div>`;
    }
  );
}

export default function AIChatbotModal({
  isOpen,
  onClose,
  onOpenPlannerModal,
}: AIChatbotModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "model",
      content:
        "Hello! I am your GlobeTrotter AI Assistant.\n\nI can help you build custom trip itineraries with detailed **Where & When timing**, discover hotel and restaurant recommendations, estimate budgets, or answer any destination questions.\n\nHow can I assist your travels today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input.trim();
    if (!userText || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setIsStreaming(true);

    const modelMessageId = `model-${Date.now()}`;
    const initialModelMsg: ChatMessage = {
      id: modelMessageId,
      role: "model",
      content: "",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, initialModelMsg]);

    try {
      const res = await fetch("/api/chat-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to AI assistant.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream.");

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error streaming response.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, content: `⚠️ **Error:** ${errorMsg}` }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end sm:p-6 animate-fadeIn"
      style={{
        backgroundColor: "rgba(26,33,41,0.5)",
        backdropFilter: "blur(3px)",
      }}
    >
      {/* Chatbot Window Container */}
      <div
        className="relative bg-white w-full sm:w-[480px] h-full sm:h-[680px] flex flex-col shadow-2xl animate-slideUp overflow-hidden"
        style={{
          border: "1px solid var(--hairline-strong)",
        }}
      >
        {/* ── Top Header ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "16px 20px",
            backgroundColor: "var(--surface-dark)",
            color: "var(--on-dark)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* SVG AI Icon */}
            <div
              className="flex items-center justify-center relative"
              style={{
                width: 36,
                height: 36,
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              <svg
                style={{ width: 18, height: 18 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--on-dark)",
                    margin: 0,
                  }}
                >
                  GlobeTrotter AI Assistant
                </h3>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "9999px",
                    backgroundColor: "var(--success)",
                    display: "inline-block",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 300,
                  color: "var(--on-dark-soft)",
                  margin: 0,
                }}
              >
                Instant Travel Planning & Where & When Logistics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPlannerModal();
              }}
              title="Full Screen Planner"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--primary)",
                backgroundColor: "rgba(28,105,212,0.15)",
                border: "1px solid rgba(28,105,212,0.3)",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Full Form
            </button>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "transparent",
                color: "var(--on-dark)",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Messages Feed ── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: "20px 16px",
            backgroundColor: "var(--surface-soft)",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col mb-4 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1 mb-1 px-1">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {msg.role === "user" ? "You" : "GlobeTrotter AI"}
                </span>
                <span style={{ fontSize: 10, color: "var(--muted-soft)" }}>
                  • {msg.timestamp}
                </span>
              </div>

              <div
                style={{
                  maxWidth: "88%",
                  padding: "12px 16px",
                  backgroundColor:
                    msg.role === "user"
                      ? "var(--primary)"
                      : "var(--canvas)",
                  color:
                    msg.role === "user"
                      ? "var(--on-primary)"
                      : "var(--ink)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid var(--hairline)",
                  boxShadow:
                    msg.role === "model" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {msg.role === "user" ? (
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 300,
                      lineHeight: 1.5,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </p>
                ) : (
                  <div
                    className="chatbot-markdown-content"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(msg.content),
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {isStreaming && (
            <div className="flex items-center gap-2 py-2 px-1">
              <span
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
                  fontWeight: 400,
                  color: "var(--muted)",
                }}
              >
                GlobeTrotter AI is typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Suggestions Bar ── */}
        <div
          className="flex gap-2 overflow-x-auto p-2"
          style={{
            backgroundColor: "var(--canvas)",
            borderTop: "1px solid var(--hairline)",
            scrollbarWidth: "none",
          }}
        >
          {QUICK_PROMPTS.map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleSendMessage(promptText)}
              disabled={isStreaming}
              className="hover:bg-[var(--surface-soft)] transition-colors flex-shrink-0"
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "var(--primary)",
                border: "1px solid var(--hairline-strong)",
                backgroundColor: "var(--surface-card)",
                padding: "4px 10px",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* ── Input Box ── */}
        <div
          className="p-3"
          style={{
            backgroundColor: "var(--canvas)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI anything about your trip plan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              style={{
                flex: 1,
                backgroundColor: "var(--canvas)",
                color: "var(--ink)",
                fontSize: 14,
                fontWeight: 300,
                padding: "10px 14px",
                border: "1px solid var(--hairline)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="bmw-button-primary"
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: !input.trim() || isStreaming ? "not-allowed" : "pointer",
                opacity: !input.trim() || isStreaming ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
