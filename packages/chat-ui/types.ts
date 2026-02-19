export type AgentProfile = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  brokerage?: string;
  primaryColor: string;
  secondaryColor: string;
};

export type NeighbourhoodData = {
  name: string;
  slug: string;
  center: { lat: number; lng: number };
  zoom: number;
  tagline?: string;
  avgPrice?: string;
  priceChange?: string;
  walkScore?: number;
  transitScore?: number;
  highlights: string[];
  fallbackPois: PointOfInterest[];
};

export type PointOfInterest = {
  name: string;
  type: "transit" | "school" | "park" | "shopping" | "landmark" | "restaurant";
  lat: number;
  lng: number;
  description?: string;
};

export type ChatConfig = {
  agent: AgentProfile;
  apiEndpoint: string;
  firstMessage?: string;
  quickQuestions?: string[];
  neighbourhoods?: NeighbourhoodData[];
  onLeadCapture?: (data: LeadCaptureData) => void;
};

export type LeadCaptureData = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  source: string;
  neighbourhood?: string;
};
