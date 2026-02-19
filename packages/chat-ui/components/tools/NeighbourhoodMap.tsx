"use client";

import { useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { PointOfInterest } from "../../types";

type Props = {
  centre: { lat: number; lng: number };
  zoom?: number;
  pois?: PointOfInterest[];
  boundaryName?: string;
  height?: string;
  showLegend?: boolean;
  className?: string;
  googleMapsApiKey?: string;
};

const POI_COLORS: Record<PointOfInterest["type"], string> = {
  transit: "#2563eb",
  school: "#7c3aed",
  park: "#16a34a",
  shopping: "#ea580c",
  landmark: "#dc2626",
  restaurant: "#d97706",
};

const POI_LABELS: Record<PointOfInterest["type"], string> = {
  transit: "Transit",
  school: "Schools",
  park: "Parks",
  shopping: "Shopping",
  landmark: "Landmarks",
  restaurant: "Dining",
};

const POI_ICONS: Record<PointOfInterest["type"], string> = {
  transit: "T",
  school: "S",
  park: "P",
  shopping: "$",
  landmark: "L",
  restaurant: "R",
};

function MapMarkers({ pois }: { pois: PointOfInterest[] }) {
  const [selected, setSelected] = useState<PointOfInterest | null>(null);

  return (
    <>
      {pois.map((poi, i) => (
        <AdvancedMarker
          key={`${poi.name}-${i}`}
          position={{ lat: poi.lat, lng: poi.lng }}
          onClick={() => setSelected(poi)}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: POI_COLORS[poi.type] }}
            title={poi.name}
          >
            {POI_ICONS[poi.type]}
          </div>
        </AdvancedMarker>
      ))}
      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-1 max-w-[200px]">
            <p className="font-semibold text-sm text-gray-900">
              {selected.name}
            </p>
            {selected.description && (
              <p className="text-xs text-gray-600 mt-1">
                {selected.description}
              </p>
            )}
            <span
              className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: POI_COLORS[selected.type] }}
            >
              {POI_LABELS[selected.type]}
            </span>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function NeighbourhoodMap({
  centre,
  zoom = 14,
  pois = [],
  height = "400px",
  showLegend = true,
  className = "",
  googleMapsApiKey,
}: Props) {
  const apiKey = googleMapsApiKey || (typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).__NESTIQ_GMAPS_KEY__ as string | undefined : undefined) || "";

  if (!apiKey) {
    return (
      <div
        className={`bg-warm-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg
            className="w-12 h-12 text-warm-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm text-warm-500">
            Interactive map coming soon
          </p>
        </div>
      </div>
    );
  }

  const uniqueTypes = [...new Set(pois.map((p) => p.type))];

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <div className="rounded-xl overflow-hidden border border-warm-200 shadow-sm" style={{ height }}>
          <Map
            defaultCenter={centre}
            defaultZoom={zoom}
            mapId="neighbourhood-map"
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl
          >
            <MapMarkers pois={pois} />
          </Map>
        </div>
      </APIProvider>
      {showLegend && uniqueTypes.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {uniqueTypes.map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: POI_COLORS[type] }}
              />
              <span className="text-xs text-warm-600">{POI_LABELS[type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
