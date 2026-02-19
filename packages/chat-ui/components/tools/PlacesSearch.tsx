"use client";

import { useEffect, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

type Props = {
  query: string;
  neighbourhood: string;
  lat: number;
  lng: number;
  agentName?: string;
  googleMapsApiKey?: string;
};

function PlacesSearchInner({ query, neighbourhood, lat, lng }: Omit<Props, "agentName" | "googleMapsApiKey">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create the Place Search element
    const searchEl = document.createElement("gmp-place-search");
    searchEl.setAttribute("orientation", "vertical");
    searchEl.setAttribute("selectable", "");
    searchEl.setAttribute("truncation-preferred", "");

    // Use Text Search request for freeform queries like "Italian restaurants"
    const requestEl = document.createElement("gmp-place-text-search-request");
    requestEl.setAttribute(
      "text-query",
      `${query} in ${neighbourhood}`
    );
    requestEl.setAttribute("max-result-count", "5");

    // Set location bias programmatically after mount
    const initRequest = () => {
      try {
        const reqElement = requestEl as unknown as {
          locationBias: unknown;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (globalThis as any).google;
        if (g?.maps?.Circle) {
          reqElement.locationBias = new g.maps.Circle({
            center: { lat, lng },
            radius: 2000,
          });
        }
      } catch {
        // Will still work with text query alone
      }
    };

    // Configure what content to show for each place
    const contentConfig = document.createElement("gmp-place-content-config");

    const media = document.createElement("gmp-place-media");
    media.setAttribute("lightbox-preferred", "");
    const rating = document.createElement("gmp-place-rating");
    const type = document.createElement("gmp-place-type");
    const price = document.createElement("gmp-place-price");
    const openNow = document.createElement("gmp-place-open-now-status");
    const address = document.createElement("gmp-place-address");

    contentConfig.appendChild(media);
    contentConfig.appendChild(rating);
    contentConfig.appendChild(type);
    contentConfig.appendChild(price);
    contentConfig.appendChild(openNow);
    contentConfig.appendChild(address);

    searchEl.appendChild(requestEl);
    searchEl.appendChild(contentConfig);
    containerRef.current.appendChild(searchEl);

    // Initialize location bias after elements are mounted
    requestAnimationFrame(initRequest);
  }, [query, neighbourhood, lat, lng]);

  return (
    <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
      >
        <svg
          className="w-4 h-4 text-white/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h4 className="text-white text-sm font-semibold">
          {query} near {neighbourhood}
        </h4>
      </div>
      <div
        ref={containerRef}
        className="max-h-[300px] overflow-y-auto"
        style={{ colorScheme: "light" }}
      />
      <div className="px-4 py-2 bg-warm-50 border-t border-warm-100">
        <p className="text-[10px] text-warm-400 text-center">
          Powered by Google Maps
        </p>
      </div>
    </div>
  );
}

export default function PlacesSearch({ agentName, googleMapsApiKey, ...props }: Props) {
  const apiKey = googleMapsApiKey || (typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).__NESTIQ_GMAPS_KEY__ as string | undefined : undefined) || "";

  if (!apiKey) {
    const contactLabel = agentName ? `Contact ${agentName}` : "Contact your agent";
    return (
      <div className="bg-warm-50 rounded-xl p-3 my-2 text-xs text-warm-500 italic">
        Places search unavailable. {contactLabel} directly for local
        recommendations!
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]} version="beta">
      <PlacesSearchInner {...props} />
    </APIProvider>
  );
}
