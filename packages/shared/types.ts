// Agent profile — the core tenant entity
export type AgentProfile = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  brokerage?: string;
  licenseNumber?: string;
  city: string;
  provinceState: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  isActive: boolean;
};

// Agent config — chatbot settings
export type AgentConfig = {
  id: string;
  agentId: string;
  llmModel: string;
  temperature: number;
  personalityTemplate: string;
  customInstructions?: string;
  firstMessage: string;
  quickQuestions: string[];
  toolsEnabled: ToolsEnabled;
  currency: string;
  taxCalculator: string;
  marketDataText?: string;
  widgetPosition: string;
  widgetGreeting?: string;
  leadNotificationEmail?: string;
};

export type ToolsEnabled = {
  mortgageCalc: boolean;
  propertyTax: boolean;
  contactCard: boolean;
  scheduleViewing: boolean;
  neighbourhoodMap: boolean;
  placesSearch: boolean;
  buyerSellerGuide: boolean;
  marketSnapshot: boolean;
  neighbourhoodCard: boolean;
};

// Neighbourhood data per agent
export type AgentNeighbourhood = {
  id: string;
  agentId: string;
  name: string;
  slug: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  tagline?: string;
  avgPrice?: string;
  priceChange?: string;
  walkScore?: number;
  transitScore?: number;
  highlights: string[];
  fallbackPois: PointOfInterest[];
  sortOrder: number;
};

export type PointOfInterest = {
  name: string;
  type: "transit" | "school" | "park" | "shopping" | "landmark" | "restaurant";
  lat: number;
  lng: number;
  description?: string;
};

// Conversation types
export type Conversation = {
  id: string;
  agentId: string;
  visitorId?: string;
  sourceUrl?: string;
  leadScore: number;
  leadData: LeadData;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadData = {
  intent?: string;
  budget?: string;
  timeline?: string;
  areas?: string[];
  firstTimeBuyer?: boolean;
  propertyType?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content?: string;
  toolCalls?: unknown;
  createdAt: Date;
};

export type Lead = {
  id: string;
  agentId: string;
  conversationId?: string;
  name?: string;
  email?: string;
  phone?: string;
  intent?: string;
  budgetRange?: string;
  propertyType?: string;
  timeline?: string;
  areas?: string[];
  isFirstTime?: boolean;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Full tenant context (loaded per request)
export type TenantContext = {
  agent: AgentProfile;
  config: AgentConfig;
  neighbourhoods: AgentNeighbourhood[];
};

// POI icon map
export const POI_ICONS: Record<PointOfInterest["type"], string> = {
  transit: "\u{1F687}",
  school: "\u{1F3EB}",
  park: "\u{1F333}",
  shopping: "\u{1F6CD}\u{FE0F}",
  landmark: "\u{1F4CD}",
  restaurant: "\u{1F37D}\u{FE0F}",
};
