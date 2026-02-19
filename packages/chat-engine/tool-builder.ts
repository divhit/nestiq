import { tool } from "ai";
import { z } from "zod";
import type { ToolBuilderInput } from "./types";

/**
 * Builds the Vercel AI SDK tool set for a given tenant configuration.
 *
 * Only includes tools that are enabled in the agent's config. Each tool is
 * parameterized with the agent's profile and neighbourhood data so that
 * descriptions, coordinate lookups, and fallback values are tenant-specific.
 */
export function buildToolSet(input: ToolBuilderInput) {
  const { agent, config, neighbourhoods } = input;
  const enabled = config.toolsEnabled;

  // Build neighbourhood coordinates lookup map
  const neighbourhoodCoords: Record<string, { lat: number; lng: number }> = {};
  for (const n of neighbourhoods) {
    neighbourhoodCoords[n.name] = { lat: n.centerLat, lng: n.centerLng };
  }

  // Default fallback coordinates (first neighbourhood or 0,0)
  const fallbackCoords = neighbourhoods[0]
    ? { lat: neighbourhoods[0].centerLat, lng: neighbourhoods[0].centerLng }
    : { lat: 0, lng: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: Record<string, any> = {};

  // ── Places Search ──────────────────────────────────────────────────
  if (enabled.placesSearch) {
    tools.searchNearbyPlaces = tool({
      description:
        "Search for real nearby places using Google Maps data. Use when user asks about specific types of businesses, restaurants, cafes, schools, parks, or other places in a neighbourhood.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Search query, e.g. 'Italian restaurants', 'coffee shops', 'elementary schools'"
          ),
        neighbourhood: z.string().describe("Neighbourhood name"),
      }),
      execute: async ({ query, neighbourhood }) => {
        const coords =
          neighbourhoodCoords[neighbourhood] || fallbackCoords;

        try {
          const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
          if (!apiKey) throw new Error("No API key configured");

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `Find the top 5 ${query} specifically in or very near the ${neighbourhood} neighbourhood of ${agent.city}, ${agent.provinceState}. For each place provide: name, a one-sentence description, and rating (number 1-5 or null). Format as a JSON array: [{"name":"...","description":"...","rating":4.5,"type":"${query}"}]`,
                      },
                    ],
                  },
                ],
                tools: [{ googleMaps: {} }],
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: coords.lat,
                      longitude: coords.lng,
                    },
                  },
                },
              }),
            }
          );

          const data = await res.json();
          const candidate = data?.candidates?.[0];
          const textContent =
            candidate?.content?.parts
              ?.map((p: { text?: string }) => p.text)
              .join("") || "";
          const groundingChunks =
            candidate?.groundingMetadata?.groundingChunks || [];

          // Extract places from Google Maps grounding data
          const mapsPlaces = groundingChunks
            .filter((chunk: { maps?: unknown }) => chunk.maps)
            .slice(0, 6)
            .map(
              (chunk: {
                maps: { title: string; uri: string; placeId?: string };
              }) => ({
                name: chunk.maps.title,
                mapsUrl: chunk.maps.uri,
                placeId: chunk.maps.placeId || null,
              })
            );

          // Enrich places with descriptions and ratings from text content
          let enrichedPlaces = mapsPlaces;
          try {
            const jsonMatch = textContent.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              enrichedPlaces = mapsPlaces.map(
                (
                  place: {
                    name: string;
                    mapsUrl: string;
                    placeId: string | null;
                  },
                  idx: number
                ) => {
                  const match =
                    parsed.find(
                      (p: { name: string }) =>
                        p.name
                          .toLowerCase()
                          .includes(
                            place.name.toLowerCase().split(" ")[0]
                          ) ||
                        place.name
                          .toLowerCase()
                          .includes(p.name.toLowerCase().split(" ")[0])
                    ) || parsed[idx];
                  return {
                    ...place,
                    description: match?.description || null,
                    rating: match?.rating || null,
                    type: match?.type || query,
                  };
                }
              );
            }
          } catch {
            // Keep places without enrichment
          }

          return {
            shown: true,
            query,
            neighbourhood,
            lat: coords.lat,
            lng: coords.lng,
            places:
              enrichedPlaces.length > 0
                ? enrichedPlaces
                : [buildFallbackPlace(query, neighbourhood, agent)],
          };
        } catch {
          return {
            shown: true,
            query,
            neighbourhood,
            lat: coords.lat,
            lng: coords.lng,
            places: [buildFallbackPlace(query, neighbourhood, agent)],
          };
        }
      },
    });
  }

  return tools;
}

/**
 * Builds a fallback Google Maps search link when the API call fails
 * or returns no results.
 */
function buildFallbackPlace(
  query: string,
  neighbourhood: string,
  agent: { city: string }
) {
  return {
    name: `Search "${query}" in ${neighbourhood}`,
    mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(
      query + " " + neighbourhood + " " + agent.city
    )}`,
    description: `View ${query} near ${neighbourhood} on Google Maps`,
    type: query,
  };
}
