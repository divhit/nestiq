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
  headerLabel?: string;
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
      <div className="flex items-center justify-center h-screen bg-[#1a3a36]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-teal-800 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-sm text-white/50">Loading chat...</p>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.primaryColor || "#0f766e";
  const firstName = branding?.firstName || "Real Estate";
  const lastName = branding?.lastName || "Agent";

  const agent: AgentProfile = {
    id: "widget-agent",
    slug: agentSlug,
    firstName,
    lastName,
    email: branding?.email || "",
    phone: branding?.phone,
    brokerage: branding?.brokerage,
    primaryColor,
    secondaryColor: branding?.secondaryColor || "#f5f0eb",
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a3a36]">
      {/* Chat fills the screen — ChatPanel's own header shows the "New" button */}
      <div className="flex-1 min-h-0 mx-auto w-full max-w-3xl px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
        <ChatPanel
          agent={agent}
          apiEndpoint={`/api/chat/${agentSlug}`}
          variant="dark"
          firstMessage={branding?.firstMessage}
          headerLabel={
            branding?.headerLabel ||
            `Ask me anything about Vancouver real estate`
          }
          quickQuestions={branding?.quickQuestions}
          neighbourhoods={branding?.neighbourhoods}
          googleMapsApiKey={branding?.googleMapsApiKey}
          inputPlaceholder="Ask about Vancouver real estate..."
          onLeadCapture={handleLeadCapture}
          className="h-full"
        />
      </div>

      {/* Footer */}
      <footer className="shrink-0 px-4 py-2 text-center">
        <a
          href="https://nestiq.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Powered by{" "}
          <span className="font-semibold text-white/40">
            Nest<span style={{ color: primaryColor }}>IQ</span>
          </span>
        </a>
      </footer>
    </div>
  );
}
