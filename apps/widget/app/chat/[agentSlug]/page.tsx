"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ChatPanel } from "@nestiq/chat-ui";
import type { AgentProfile, NeighbourhoodData, LeadCaptureData } from "@nestiq/chat-ui";

type BrandingData = {
  primaryColor: string;
  secondaryColor: string;
  agentName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  brokerage?: string;
  slug: string;
  position: string;
  firstMessage?: string;
  quickQuestions?: string[];
  neighbourhoods?: NeighbourhoodData[];
  googleMapsApiKey?: string;
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = use(params);
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agents/${agentSlug}/branding`)
      .then((res) => res.json())
      .then((data) => {
        setBranding(data);
        document.documentElement.style.setProperty(
          "--nestiq-primary",
          data.primaryColor
        );
        document.documentElement.style.setProperty(
          "--nestiq-primary-light",
          data.primaryColor + "1a"
        );
        document.documentElement.style.setProperty(
          "--nestiq-bg",
          data.secondaryColor
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentSlug]);

  const handleLeadCapture = (data: LeadCaptureData) => {
    window.parent.postMessage({ type: "nestiq:lead", data }, "*");
    fetch(`/api/chat/${agentSlug}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-teal-100 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.primaryColor || "#0f766e";
  const secondaryColor = branding?.secondaryColor || "#f5f0eb";
  const firstName = branding?.firstName || "Real Estate";
  const lastName = branding?.lastName || "Agent";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const agent: AgentProfile = {
    id: "widget-agent",
    slug: agentSlug,
    firstName,
    lastName,
    email: branding?.email || "",
    phone: branding?.phone,
    brokerage: branding?.brokerage,
    primaryColor,
    secondaryColor,
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: secondaryColor }}>
      {/* Branded Header */}
      <header
        className="shrink-0 px-4 py-3 sm:px-6 sm:py-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {/* Avatar / Initials */}
          <div
            className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-sm sm:text-base font-bold"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#ffffff",
            }}
          >
            {initials}
          </div>

          {/* Agent Info */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base sm:text-lg font-semibold text-white">
              {firstName} {lastName}
            </h1>
            <div className="flex items-center gap-2">
              {branding?.brokerage && (
                <span className="truncate text-xs sm:text-sm text-white/70">
                  {branding.brokerage}
                </span>
              )}
              {branding?.brokerage && (
                <span className="text-white/40 text-xs hidden sm:inline">
                  |
                </span>
              )}
              <span className="text-xs sm:text-sm text-white/70 hidden sm:inline">
                AI Real Estate Assistant
              </span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-white/90">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 mx-auto w-full max-w-3xl">
        <ChatPanel
          agent={agent}
          apiEndpoint={`/api/chat/${agentSlug}`}
          firstMessage={branding?.firstMessage}
          quickQuestions={branding?.quickQuestions}
          neighbourhoods={branding?.neighbourhoods}
          googleMapsApiKey={branding?.googleMapsApiKey}
          onLeadCapture={handleLeadCapture}
          variant="light"
          className="h-full"
          hideHeader
        />
      </div>

      {/* Powered by NestIQ Footer */}
      <footer className="shrink-0 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm px-4 py-2 text-center">
        <a
          href="https://nestiq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Powered by{" "}
          <span className="font-semibold text-gray-500">
            Nest<span style={{ color: primaryColor }}>IQ</span>
          </span>
        </a>
      </footer>
    </div>
  );
}
