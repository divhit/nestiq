"use client";

import { type ReactNode } from "react";
import {
  Renderer,
  type ComponentRenderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";

import { registry, Fallback } from "./registry";
import { NestiqChatProvider } from "./context";
import type { AgentProfile, NeighbourhoodData, LeadCaptureData } from "../types";

interface ChatRendererProps {
  spec: Spec | null;
  loading?: boolean;
  agent?: AgentProfile;
  neighbourhoods?: NeighbourhoodData[];
  googleMapsApiKey?: string;
  onLeadCapture?: (data: LeadCaptureData) => void;
}

const fallback: ComponentRenderer = ({ element }) => (
  <Fallback type={element.type} />
);

export function ChatRenderer({
  spec,
  loading,
  agent,
  neighbourhoods,
  googleMapsApiKey,
  onLeadCapture,
}: ChatRendererProps): ReactNode {
  if (!spec) return null;

  const tree = (
    <StateProvider initialState={spec.state ?? {}}>
      <VisibilityProvider>
        <ActionProvider>
          <Renderer
            spec={spec}
            registry={registry}
            fallback={fallback}
            loading={loading}
          />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );

  if (agent) {
    return (
      <NestiqChatProvider
        agent={agent}
        neighbourhoods={neighbourhoods ?? []}
        googleMapsApiKey={googleMapsApiKey}
        onLeadCapture={onLeadCapture}
      >
        {tree}
      </NestiqChatProvider>
    );
  }

  return tree;
}
