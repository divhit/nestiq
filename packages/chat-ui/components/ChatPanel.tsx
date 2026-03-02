"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { SPEC_DATA_PART_TYPE } from "@json-render/core";
import { useJsonRenderMessage } from "@json-render/react";
import { ChatRenderer } from "../render/renderer";
import type {
  AgentProfile,
  NeighbourhoodData,
  LeadCaptureData,
} from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChatPanelProps = {
  agent: AgentProfile;
  apiEndpoint: string;
  firstMessage?: string;
  quickQuestions?: string[];
  neighbourhoods?: NeighbourhoodData[];
  onLeadCapture?: (data: LeadCaptureData) => void;
  variant?: "light" | "dark";
  className?: string;
  googleMapsApiKey?: string;
  hideHeader?: boolean;
  /** Short label for the dark-variant header bar (e.g. "Ask me anything about Vancouver real estate") */
  headerLabel?: string;
  /** Placeholder text for the input field */
  inputPlaceholder?: string;
};

// ---------------------------------------------------------------------------
// localStorage persistence helpers
// ---------------------------------------------------------------------------

function storageKey(agentSlug: string) {
  return `nestiq-chat-${agentSlug}`;
}

function loadMessages(key: string): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(key: string, messages: UIMessage[]) {
  try {
    const slim = messages.map((m) => ({
      ...m,
      parts: m.parts.filter(
        (p) => p.type === "text" || (p.type.startsWith("tool-") && "input" in p)
      ),
    }));
    localStorage.setItem(key, JSON.stringify(slim));
  } catch {
    // Storage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// AssistantMessage (with json-render support)
// ---------------------------------------------------------------------------

function AssistantMessage({
  message,
  renderPart,
  variant,
  agent,
  neighbourhoods,
  googleMapsApiKey,
  onLeadCapture,
}: {
  message: UIMessage;
  renderPart: (part: UIMessage["parts"][number], i: number) => React.ReactNode;
  variant: "light" | "dark";
  agent: AgentProfile;
  neighbourhoods: NeighbourhoodData[];
  googleMapsApiKey?: string;
  onLeadCapture?: (data: LeadCaptureData) => void;
}) {
  const { spec, hasSpec } = useJsonRenderMessage(message.parts);

  const bubbleClass =
    variant === "dark"
      ? "px-4 py-2.5 rounded-2xl rounded-bl-md bg-white/15 text-white text-sm leading-relaxed"
      : "px-4 py-2.5 rounded-2xl rounded-bl-md bg-warm-100 text-warm-900 text-sm leading-relaxed";

  const rendererProps = {
    agent,
    neighbourhoods,
    googleMapsApiKey,
    onLeadCapture,
  };

  // Separate parts: specs/tools render first (visuals), text renders last
  const toolParts: { part: UIMessage["parts"][number]; index: number }[] = [];
  const textParts: { part: UIMessage["parts"][number]; index: number }[] = [];
  let specIndex = -1;

  message.parts.forEach((part, i) => {
    if (part.type === "text" && part.text) {
      textParts.push({ part, index: i });
    } else if (part.type === SPEC_DATA_PART_TYPE) {
      if (specIndex === -1) specIndex = i;
    } else {
      toolParts.push({ part, index: i });
    }
  });

  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] space-y-1">
        {/* 1. Spec/widget visuals first */}
        {hasSpec && (
          <div key={specIndex >= 0 ? specIndex : "spec"} className="w-full my-1">
            <ChatRenderer spec={spec} {...rendererProps} />
          </div>
        )}
        {/* 2. Tool results */}
        {toolParts.map(({ part, index }) => renderPart(part, index))}
        {/* 3. Text last — so the follow-up question is always at the bottom */}
        {textParts.map(({ part, index }) => (
          <div key={index} className={bubbleClass}>
            {(part as { text: string }).text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChatPanel
// ---------------------------------------------------------------------------

export function ChatPanel({
  agent,
  apiEndpoint,
  firstMessage,
  quickQuestions = [
    "I'm looking to buy",
    "Tell me about neighbourhoods",
    "Compare neighbourhoods for me",
    "What can I afford?",
  ],
  neighbourhoods = [],
  onLeadCapture,
  variant = "light",
  className = "",
  googleMapsApiKey,
  hideHeader = false,
  headerLabel,
  inputPlaceholder,
}: ChatPanelProps) {
  const key = storageKey(agent.slug);
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, stop } = useChat({
    id: key,
    transport: new DefaultChatTransport({ api: apiEndpoint }),
    messages: loadMessages(key),
  });

  const hasMessages = messages.length > 0;
  const isLoading = status === "submitted" || status === "streaming";

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(key, messages);
    }
  }, [messages, key]);

  // Auto-scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ------------------------------------------------------------------
  // renderPart -- minimal: tool parts are handled via json-render specs
  // ------------------------------------------------------------------
  const renderPart = (
    part: (typeof messages)[number]["parts"][number],
    i: number
  ) => {
    if (part.type === "text" && part.text) {
      return (
        <span key={i} className="whitespace-pre-wrap">
          {part.text}
        </span>
      );
    }
    // Tool parts are hidden -- AI renders results via specs
    return null;
  };

  // ------------------------------------------------------------------
  // Variant-specific styling
  // ------------------------------------------------------------------
  const isDark = variant === "dark";

  const wantFullHeight = className.includes("h-full");

  const containerClasses = isDark
    ? `bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col overflow-hidden ${wantFullHeight ? "h-full" : `transition-all duration-500 ease-in-out ${hasMessages ? "h-[550px]" : "h-[340px]"}`}`
    : "bg-white rounded-2xl shadow-2xl border border-warm-200 flex flex-col overflow-hidden h-full";

  const headerBorderClass = isDark
    ? "border-b border-white/10"
    : "";

  const inputBorderClass = isDark
    ? "border-t border-white/10"
    : "border-t border-warm-100";

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className={`${containerClasses} ${wantFullHeight ? className.replace("h-full", "").trim() : className}`}>
      {/* Header */}
      {!hideHeader && (
        <div
          className={`px-5 py-3.5 shrink-0 ${headerBorderClass}`}
          style={
            isDark
              ? undefined
              : { backgroundColor: "var(--nestiq-primary, #115e59)" }
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isDark ? (
                /* Sparkle AI icon for dark variant */
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
              ) : (
                /* Agent avatar for light variant */
                <>
                  {agent.photoUrl ? (
                    <img
                      src={agent.photoUrl}
                      alt={agent.firstName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-serif font-semibold text-white"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      {(agent.firstName?.[0] ?? "") + (agent.lastName?.[0] ?? "")}
                    </div>
                  )}
                </>
              )}

              <div className="flex-1 min-w-0">
                {isDark ? (
                  <p className="text-sm font-medium text-white">
                    {headerLabel || `Ask me anything about real estate`}
                  </p>
                ) : (
                  <>
                    <p className="font-medium text-sm text-white">
                      {agent.firstName}&apos;s Assistant
                    </p>
                    <p className="text-xs text-white/70">
                      {status === "streaming"
                        ? "Typing..."
                        : firstMessage || "Ask me about real estate"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isLoading && (
                <button
                  onClick={stop}
                  className={
                    isDark
                      ? "text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/20 hover:border-white/40"
                      : "text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/30 hover:border-white/50"
                  }
                >
                  Stop
                </button>
              )}
              {messages.length > 0 && !isLoading && (
                <button
                  onClick={() => {
                    localStorage.removeItem(key);
                    window.location.reload();
                  }}
                  className={
                    isDark
                      ? "text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/20 hover:border-white/40"
                      : "text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/30 hover:border-white/50"
                  }
                  title="Start new conversation"
                >
                  New
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? "scrollbar-thin scrollbar-thumb-white/10" : ""}`}
      >
        {messages.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-full py-4`}
          >
            <p
              className={`text-sm mb-5 text-center px-4 ${
                isDark ? "text-white/60" : "text-warm-500"
              }`}
            >
              {firstMessage ||
                `Hi! Ask me anything about real estate \u2014 neighbourhoods, buying, selling, mortgages, and more.`}
            </p>
            <div
              className={`grid ${
                quickQuestions.length <= 2 ? "grid-cols-1" : "grid-cols-2"
              } gap-2 w-full px-2`}
            >
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage({ text: q })}
                  className={
                    isDark
                      ? "text-left text-xs px-3 py-2.5 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors leading-snug"
                      : "text-left text-xs px-3 py-2.5 rounded-xl transition-colors leading-snug"
                  }
                  style={
                    isDark
                      ? undefined
                      : {
                          backgroundColor:
                            "var(--nestiq-primary-light, rgba(15,118,110,0.08))",
                          color: "var(--nestiq-primary, #0f766e)",
                        }
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, msgIdx) => {
          // Hide the last assistant message while still loading — show dots instead
          const isLastMessage = msgIdx === messages.length - 1;
          if (isLastMessage && message.role === "assistant" && isLoading) {
            return null;
          }

          return (
            <div key={message.id}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-white text-sm leading-relaxed`}
                    style={{
                      backgroundColor: isDark
                        ? "var(--nestiq-primary, #0d9488)"
                        : "var(--nestiq-primary, #0f766e)",
                    }}
                  >
                    {message.parts
                      .filter((p) => p.type === "text")
                      .map((p, i) =>
                        p.type === "text" ? (
                          <span key={i}>{p.text}</span>
                        ) : null
                      )}
                  </div>
                </div>
              ) : (
                <AssistantMessage
                  message={message}
                  renderPart={renderPart}
                  variant={variant}
                  agent={agent}
                  neighbourhoods={neighbourhoods}
                  googleMapsApiKey={googleMapsApiKey}
                  onLeadCapture={onLeadCapture}
                />
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                isDark ? "bg-white/15" : "bg-warm-100"
              }`}
            >
              <div className="flex gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? "bg-white/50" : "bg-warm-400"
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.15s] ${
                    isDark ? "bg-white/50" : "bg-warm-400"
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce [animation-delay:0.3s] ${
                    isDark ? "bg-white/50" : "bg-warm-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`${inputBorderClass} p-3 shrink-0`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim() || isLoading) return;
            sendMessage({ text: input });
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder || "Ask about real estate..."}
            className={
              isDark
                ? "flex-1 px-4 py-2.5 text-sm bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                : "flex-1 px-4 py-2.5 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
            }
            style={
              isDark
                ? undefined
                : ({
                    "--tw-ring-color":
                      "var(--nestiq-primary-light, rgba(15,118,110,0.2))",
                  } as React.CSSProperties)
            }
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={
              isDark
                ? "px-4 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                : "px-4 py-2.5 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            }
            style={
              isDark
                ? undefined
                : { backgroundColor: "var(--nestiq-primary, #0f766e)" }
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
