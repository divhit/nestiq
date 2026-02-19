"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  visitorId: string;
  startedAt: string;
  messagesCount: number;
  leadScore: number;
  messages: Message[];
}

// Empty for now -- will be populated from DB
const conversations: Conversation[] = [];

export default function ConversationsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpanded(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
      <p className="mt-1 text-sm text-gray-500">
        View all chatbot conversations with your website visitors.
      </p>

      <div className="mt-8">
        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpanded(conv.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <div className="grid flex-1 grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Visitor
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {conv.visitorId}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Started
                      </span>
                      <p className="text-sm text-gray-700">{conv.startedAt}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Messages
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {conv.messagesCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Lead Score
                      </span>
                      <p className="text-sm font-medium text-gray-900">
                        {conv.leadScore}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      expandedId === conv.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Expanded messages */}
                {expandedId === conv.id && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    {conv.messages.length > 0 ? (
                      <div className="space-y-3">
                        {conv.messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${
                              msg.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-md rounded-lg px-4 py-2 text-sm ${
                                msg.role === "user"
                                  ? "bg-teal-700 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p
                                className={`mt-1 text-xs ${
                                  msg.role === "user"
                                    ? "text-teal-200"
                                    : "text-gray-400"
                                }`}
                              >
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No messages to display.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-500">No conversations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
