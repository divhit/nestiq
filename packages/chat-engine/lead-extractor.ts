/**
 * Lead data extraction from conversation messages.
 *
 * Uses heuristic keyword matching (not AI) for MVP.
 * Scans user messages for signals about intent, budget, property type,
 * timeline, areas of interest, first-time buyer status, and contact info.
 *
 * Returns a scored lead profile (0-100).
 */

export type ExtractedLeadData = {
  intent?: "buying" | "selling" | "exploring";
  budgetRange?: string;
  propertyType?: string;
  timeline?: string;
  areas?: string[];
  isFirstTimeBuyer?: boolean;
  score: number; // 0-100
};

// -- Pattern groups --

const BUYING_PATTERNS = [
  /\b(buy|buying|purchase|purchasing|looking\s+for|looking\s+to\s+buy|want\s+to\s+buy|interested\s+in\s+buying|home\s+search|house\s+hunt|house\s+hunting)\b/i,
  /\b(move\s+to|relocat|moving\s+to|need\s+a\s+home|need\s+a\s+house|find\s+a\s+place|find\s+a\s+home)\b/i,
  /\b(pre-?approv|mortgage|down\s+payment|afford|what\s+can\s+i\s+afford)\b/i,
];

const SELLING_PATTERNS = [
  /\b(sell|selling|list|listing|put\s+on\s+the\s+market|market\s+value|home\s+value|what\s+is\s+my\s+home\s+worth)\b/i,
  /\b(sell\s+my\s+(home|house|condo|property|place))\b/i,
  /\b(listing\s+agent|sell\s+side|seller)\b/i,
];

const BUDGET_PATTERNS = [
  // Captures amounts like $500K, $1.2M, $500,000, $1,200,000
  /\$\s?[\d,]+(?:\.\d+)?\s?(?:k|m|million|thousand)?/gi,
  // Captures ranges like "500k to 800k", "between 500 and 800 thousand"
  /\b(\d[\d,]*(?:\.\d+)?)\s?(?:k|m|million|thousand)?\s*(?:to|-|and)\s*(\d[\d,]*(?:\.\d+)?)\s?(?:k|m|million|thousand)?\b/gi,
  // Captures "budget is" or "can afford" followed by number
  /\b(?:budget|afford|spend|price\s+range)[^.]{0,30}?\$?\s?[\d,]+(?:\.\d+)?\s?(?:k|m|million|thousand)?/gi,
];

const PROPERTY_TYPE_MAP: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /\b(condo|condominium|apartment|apt)\b/i, type: "condo" },
  { pattern: /\b(townhouse|townhome|town\s+house|row\s+house|rowhouse)\b/i, type: "townhouse" },
  { pattern: /\b(detached|single\s+family|single-family|standalone)\b/i, type: "detached house" },
  { pattern: /\b(semi-?detached|semi|duplex)\b/i, type: "semi-detached" },
  { pattern: /\b(house|home)\b/i, type: "house" },
  { pattern: /\b(land|lot|acreage)\b/i, type: "land" },
  { pattern: /\b(multi-?family|investment\s+property|rental\s+property)\b/i, type: "multi-family/investment" },
  { pattern: /\b(penthouse)\b/i, type: "penthouse" },
  { pattern: /\b(loft)\b/i, type: "loft" },
];

const TIMELINE_MAP: Array<{ pattern: RegExp; timeline: string }> = [
  { pattern: /\b(asap|as\s+soon\s+as\s+possible|immediately|urgent|right\s+away|this\s+month)\b/i, timeline: "Immediately" },
  { pattern: /\b(next\s+(?:few\s+)?(?:weeks?|month)|within\s+(?:a\s+)?month|1-?2\s+months?|couple\s+(?:of\s+)?months)\b/i, timeline: "1-2 months" },
  { pattern: /\b(3\s*-?\s*6\s+months?|few\s+months|this\s+(?:spring|summer|fall|winter|year)|next\s+few\s+months)\b/i, timeline: "3-6 months" },
  { pattern: /\b(6\s*-?\s*12\s+months?|within\s+(?:a\s+)?year|next\s+year|this\s+year)\b/i, timeline: "6-12 months" },
  { pattern: /\b(1-?2\s+years?|couple\s+(?:of\s+)?years|in\s+a\s+year\s+or\s+two)\b/i, timeline: "1-2 years" },
  { pattern: /\b(no\s+rush|just\s+(?:looking|browsing|exploring)|eventually|down\s+the\s+(?:road|line)|someday|not\s+in\s+a\s+hurry)\b/i, timeline: "No rush / exploring" },
  { pattern: /\b(soon)\b/i, timeline: "Soon" },
];

const FIRST_TIME_PATTERNS = [
  /\b(first[\s-]?time\s+(?:home\s*)?buyer)/i,
  /\b(first\s+home|first\s+house|first\s+property|first\s+condo|never\s+(?:bought|owned|purchased))/i,
  /\b(first[\s-]?time\s+buying)/i,
];

// Contact info patterns for scoring
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const NAME_PATTERNS = [
  /\b(?:my\s+name\s+is|i'?m|i\s+am|this\s+is|call\s+me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/,
];

export function extractLeadData(
  messages: Array<{ role: string; content?: string }>
): ExtractedLeadData {
  const result: ExtractedLeadData = {
    score: 0,
  };

  // Only examine user messages
  const userMessages = messages
    .filter((m) => m.role === "user" && m.content)
    .map((m) => m.content as string);

  if (userMessages.length === 0) {
    return result;
  }

  const allUserText = userMessages.join(" ");

  // -- Intent detection --
  let hasBuyingSignal = false;
  let hasSellingSignal = false;

  for (const pattern of BUYING_PATTERNS) {
    if (pattern.test(allUserText)) {
      hasBuyingSignal = true;
      break;
    }
  }

  for (const pattern of SELLING_PATTERNS) {
    if (pattern.test(allUserText)) {
      hasSellingSignal = true;
      break;
    }
  }

  if (hasBuyingSignal && !hasSellingSignal) {
    result.intent = "buying";
    result.score += 15;
  } else if (hasSellingSignal && !hasBuyingSignal) {
    result.intent = "selling";
    result.score += 15;
  } else if (hasBuyingSignal && hasSellingSignal) {
    // Both signals; default to buying as primary, still credit
    result.intent = "buying";
    result.score += 15;
  } else {
    // Check for general exploration signals
    const exploringPatterns = [
      /\b(curious|wondering|interested|learn|tell\s+me\s+about|what\s+(?:is|are)|how\s+(?:does|do|is|are))\b/i,
    ];
    for (const pattern of exploringPatterns) {
      if (pattern.test(allUserText)) {
        result.intent = "exploring";
        result.score += 5; // Lower score for exploration
        break;
      }
    }
  }

  // -- Budget detection --
  for (const pattern of BUDGET_PATTERNS) {
    const match = allUserText.match(pattern);
    if (match) {
      result.budgetRange = match[0].trim();
      result.score += 15;
      break;
    }
  }

  // -- Property type detection --
  for (const { pattern, type } of PROPERTY_TYPE_MAP) {
    if (pattern.test(allUserText)) {
      result.propertyType = type;
      result.score += 10;
      break;
    }
  }

  // -- Timeline detection --
  for (const { pattern, timeline } of TIMELINE_MAP) {
    if (pattern.test(allUserText)) {
      result.timeline = timeline;
      result.score += 10;
      break;
    }
  }

  // -- Area / neighbourhood detection --
  // Look for neighbourhood mentions. This is a lightweight check
  // for phrases that commonly indicate area interest.
  const areaPatterns = [
    /\b(?:in|near|around|close\s+to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})\b/g,
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})\s+(?:area|neighbourhood|neighborhood|district|community)\b/g,
  ];

  const foundAreas = new Set<string>();
  for (const pattern of areaPatterns) {
    let match: RegExpExecArray | null;
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    while ((match = pattern.exec(allUserText)) !== null) {
      const area = match[1].trim();
      // Filter out common false positives
      const falsePositives = new Set([
        "I", "The", "This", "That", "My", "Your", "It", "We", "They",
        "What", "Where", "When", "How", "Why", "Who", "Which",
        "Yes", "No", "Not", "Just", "Also", "But", "And", "Or",
        "Can", "Could", "Would", "Should", "Will", "May", "Might",
        "Some", "Any", "All", "Many", "Much", "More", "Most",
        "Very", "Really", "About", "Around", "Here", "There",
        "Google", "Maps", "Thanks", "Thank", "Hi", "Hello", "Hey",
      ]);
      if (!falsePositives.has(area) && area.length > 2) {
        foundAreas.add(area);
      }
    }
  }

  if (foundAreas.size > 0) {
    result.areas = Array.from(foundAreas);
    result.score += 15;
  }

  // -- First-time buyer detection --
  for (const pattern of FIRST_TIME_PATTERNS) {
    if (pattern.test(allUserText)) {
      result.isFirstTimeBuyer = true;
      result.score += 10;
      break;
    }
  }

  // -- Contact info detection (for scoring only) --
  let hasContactInfo = false;

  if (EMAIL_PATTERN.test(allUserText)) {
    hasContactInfo = true;
  }

  if (PHONE_PATTERN.test(allUserText)) {
    hasContactInfo = true;
  }

  for (const pattern of NAME_PATTERNS) {
    if (pattern.test(allUserText)) {
      hasContactInfo = true;
      break;
    }
  }

  if (hasContactInfo) {
    result.score += 25;
  }

  // Cap score at 100
  result.score = Math.min(result.score, 100);

  return result;
}
