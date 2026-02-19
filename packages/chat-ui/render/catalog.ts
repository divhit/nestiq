import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Real Estate Chat UI Catalog
 *
 * Components for rendering rich, structured content in the chat interface.
 * The AI generates JSON specs using these components to create visual layouts
 * for neighbourhood comparisons, market data, process guides, etc.
 */
export const realestateCatalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Flex layout container",
      example: { direction: "vertical", gap: "md" },
    },
    Card: {
      props: z.object({
        title: z.string().nullable(),
        subtitle: z.string().nullable(),
      }),
      slots: ["default"],
      description: "Card container with optional title header",
      example: { title: "Oakridge", subtitle: "Market Overview" },
    },
    Grid: {
      props: z.object({
        columns: z.enum(["2", "3"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Responsive grid layout",
      example: { columns: "3", gap: "md" },
    },
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h2", "h3", "h4"]).nullable(),
      }),
      description: "Section heading",
      example: { text: "Neighbourhood Comparison", level: "h3" },
    },
    Text: {
      props: z.object({
        content: z.string(),
        muted: z.boolean().nullable(),
      }),
      description: "Text content",
      example: { content: "Here is your market overview." },
    },
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        detail: z.string().nullable(),
        trend: z.enum(["up", "down", "neutral"]).nullable(),
      }),
      description: "Single metric display with label, value, and optional trend.",
      example: { label: "Avg Price", value: "$1.6M", detail: "+8.2% YoY", trend: "up" },
    },
    Badge: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["default", "success", "warning", "danger"]).nullable(),
      }),
      description: "Status badge or label",
      example: { text: "Hot Market", variant: "danger" },
    },
    Table: {
      props: z.object({
        data: z.array(z.record(z.string(), z.unknown())),
        columns: z.array(z.object({ key: z.string(), label: z.string() })),
      }),
      description: "Data table for comparisons and listings",
    },
    Callout: {
      props: z.object({
        type: z.enum(["info", "tip", "warning", "important"]).nullable(),
        title: z.string().nullable(),
        content: z.string(),
      }),
      description: "Highlighted callout box",
    },
    Accordion: {
      props: z.object({
        items: z.array(z.object({ title: z.string(), content: z.string() })),
      }),
      description: "Collapsible sections",
    },
    Timeline: {
      props: z.object({
        items: z.array(z.object({
          title: z.string(),
          description: z.string().nullable(),
          status: z.enum(["completed", "current", "upcoming"]).nullable(),
        })),
      }),
      description: "Vertical timeline for processes",
    },
    Progress: {
      props: z.object({
        label: z.string(),
        value: z.number(),
        max: z.number().nullable(),
      }),
      description: "Progress/score bar",
    },
    Separator: {
      props: z.object({}),
      description: "Visual divider",
    },
    Link: {
      props: z.object({
        text: z.string(),
        href: z.string(),
      }),
      description: "Clickable link",
    },

    // =========================================================================
    // Interactive components — agent data resolved from NestiqChatProvider context
    // =========================================================================

    MortgageCalculator: {
      props: z.object({
        suggestedPrice: z.number().nullable(),
        suggestedRate: z.number().nullable(),
        currency: z.string().nullable(),
      }),
      description:
        "Interactive mortgage calculator with sliders for price, down payment, rate. Agent data from context.",
      example: { suggestedPrice: 900000, suggestedRate: 4.5, currency: "CAD" },
    },
    PropertyTaxEstimate: {
      props: z.object({
        purchasePrice: z.number(),
        isFirstTimeBuyer: z.boolean().nullable(),
        isNewlyBuilt: z.boolean().nullable(),
      }),
      description:
        "Property transfer tax breakdown with tiered rates and exemptions.",
      example: { purchasePrice: 900000, isFirstTimeBuyer: true },
    },
    ContactActions: {
      props: z.object({}),
      description:
        "Agent contact card with phone, email, action buttons. Agent data from context.",
    },
    ScheduleForm: {
      props: z.object({
        neighbourhood: z.string().nullable(),
        context: z.string().nullable(),
      }),
      description:
        "Booking/scheduling form for viewings or consultations. Agent data from context.",
      example: { neighbourhood: "Oakridge", context: "Interested in 2-bed condos" },
    },
    NeighbourhoodMap: {
      props: z.object({
        neighbourhood: z.string(),
        slug: z.string(),
      }),
      description:
        "Interactive Google Map of a neighbourhood with POI markers. Coordinates resolved from context.",
      example: { neighbourhood: "Oakridge", slug: "oakridge" },
    },
    PlacesEmbed: {
      props: z.object({
        query: z.string(),
        neighbourhood: z.string(),
      }),
      description:
        "Google Places search results for nearby businesses/amenities.",
      example: { query: "Italian restaurants", neighbourhood: "Oakridge" },
    },
  },
  actions: {},
});
