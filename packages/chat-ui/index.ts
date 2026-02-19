export { ChatPanel } from "./components/ChatPanel";
export { realestateCatalog } from "./render/catalog";
export { registry, Fallback } from "./render/registry";
export { ChatRenderer } from "./render/renderer";
export { NestiqChatProvider, useNestiqChat } from "./render/context";
export * from "./types";

// Map components (used by registry, also available for custom usage)
export { default as NeighbourhoodMap } from "./components/tools/NeighbourhoodMap";
export { default as PlacesSearch } from "./components/tools/PlacesSearch";
