"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AgentProfile, NeighbourhoodData, LeadCaptureData } from "../types";

type NestiqChatContextValue = {
  agent: AgentProfile;
  neighbourhoods: NeighbourhoodData[];
  googleMapsApiKey?: string;
  onLeadCapture?: (data: LeadCaptureData) => void;
};

const NestiqChatContext = createContext<NestiqChatContextValue | null>(null);

export function NestiqChatProvider({
  children,
  ...value
}: NestiqChatContextValue & { children: ReactNode }) {
  return (
    <NestiqChatContext.Provider value={value}>
      {children}
    </NestiqChatContext.Provider>
  );
}

export function useNestiqChat() {
  const ctx = useContext(NestiqChatContext);
  if (!ctx) throw new Error("useNestiqChat must be used within NestiqChatProvider");
  return ctx;
}
