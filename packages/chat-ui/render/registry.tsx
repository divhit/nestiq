"use client";

import { useState, type ReactNode } from "react";
import { defineRegistry } from "@json-render/react";
import { realestateCatalog } from "./catalog";
import { useNestiqChat } from "./context";
import NeighbourhoodMapComponent from "../components/tools/NeighbourhoodMap";
import PlacesSearchComponent from "../components/tools/PlacesSearch";

// =============================================================================
// Registry -- React implementations for the real estate catalog
// Themed via CSS custom properties:
//   --nestiq-primary       (default: #115e59)
//   --nestiq-primary-light (default: rgba(15,118,110,0.12))
//   --nestiq-bg            (default: #f5f0eb)
//   --nestiq-bg-dark       (default: #e8e0d8)
// =============================================================================

export const { registry } = defineRegistry(realestateCatalog, {
  components: {
    Stack: ({ props, children }) => {
      const gapClass =
        { sm: "gap-1.5", md: "gap-3", lg: "gap-4" }[props.gap ?? "md"] ??
        "gap-3";
      return (
        <div
          className={`flex ${props.direction === "horizontal" ? "flex-row flex-wrap items-start" : "flex-col"} ${gapClass}`}
        >
          {children}
        </div>
      );
    },

    Card: ({ props, children }) => (
      <div className="bg-white rounded-xl border border-warm-200 shadow-sm overflow-hidden w-full">
        {props.title && (
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            <h4 className="text-white text-sm font-semibold">{props.title}</h4>
            {props.subtitle && (
              <span className="text-white/70 text-xs">{props.subtitle}</span>
            )}
          </div>
        )}
        <div className="p-3 flex flex-col gap-3">{children}</div>
      </div>
    ),

    Grid: ({ props, children }) => {
      const colsClass =
        {
          "2": "grid-cols-2",
          "3": "grid-cols-3",
        }[props.columns ?? "2"] ?? "grid-cols-2";
      const gapClass =
        { sm: "gap-1.5", md: "gap-2", lg: "gap-3" }[props.gap ?? "md"] ??
        "gap-2";
      return <div className={`grid ${colsClass} ${gapClass}`}>{children}</div>;
    },

    Heading: ({ props }) => {
      const Tag = (props.level ?? "h3") as "h2" | "h3" | "h4";
      const baseClass = {
        h2: "text-base font-bold",
        h3: "text-sm font-bold",
        h4: "text-sm font-semibold text-warm-800",
      }[props.level ?? "h3"];

      const usesPrimary = (props.level ?? "h3") !== "h4";

      return (
        <Tag
          className={baseClass}
          style={usesPrimary ? { color: "var(--nestiq-primary, #115e59)" } : undefined}
        >
          {props.text}
        </Tag>
      );
    },

    Text: ({ props }) => (
      <p
        className={`text-xs leading-relaxed ${props.muted ? "text-warm-400" : "text-warm-700"}`}
      >
        {props.content}
      </p>
    ),

    Metric: ({ props }) => {
      const trendIcon =
        props.trend === "up" ? "\u2191" : props.trend === "down" ? "\u2193" : null;
      const trendColor =
        props.trend === "up"
          ? "text-emerald-600"
          : props.trend === "down"
            ? "text-red-600"
            : "text-warm-500";
      return (
        <div className="bg-warm-50 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center gap-1">
            <span
              className="text-lg font-bold leading-none"
              style={{ color: "var(--nestiq-primary, #115e59)" }}
            >
              {props.value}
            </span>
            {trendIcon && (
              <span className={`text-xs font-bold ${trendColor}`}>
                {trendIcon}
              </span>
            )}
          </div>
          <div className="text-[10px] text-warm-500 uppercase tracking-wider mt-0.5">
            {props.label}
          </div>
          {props.detail && (
            <div className={`text-[10px] mt-0.5 ${trendColor}`}>
              {props.detail}
            </div>
          )}
        </div>
      );
    },

    Badge: ({ props }) => {
      const colors = {
        default: "bg-warm-100 text-warm-700",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
      }[props.variant ?? "default"];
      return (
        <span
          className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors}`}
        >
          {props.text}
        </span>
      );
    },

    Table: ({ props }) => {
      const items: Array<Record<string, unknown>> = Array.isArray(props.data)
        ? props.data
        : [];

      if (items.length === 0) return null;

      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-warm-200">
                {props.columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-1.5 px-2 text-[10px] uppercase tracking-wider text-warm-500 font-semibold"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-warm-100 last:border-0"
                >
                  {props.columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-1.5 px-2 text-warm-700"
                    >
                      {String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },

    Callout: ({ props }) => {
      const config = {
        info: {
          border: "border-l-teal-500",
          bg: "bg-teal-50",
          icon: "\u2139",
        },
        tip: {
          border: "border-l-emerald-500",
          bg: "bg-emerald-50",
          icon: "\uD83D\uDCA1",
        },
        warning: {
          border: "border-l-amber-500",
          bg: "bg-amber-50",
          icon: "\u26A0",
        },
        important: {
          border: "border-l-red-500",
          bg: "bg-red-50",
          icon: "\u2757",
        },
      }[props.type ?? "info"] ?? {
        border: "border-l-teal-500",
        bg: "bg-teal-50",
        icon: "\u2139",
      };
      return (
        <div
          className={`border-l-4 ${config.border} ${config.bg} rounded-r-lg p-3`}
        >
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">{config.icon}</span>
            <div className="flex-1 min-w-0">
              {props.title && (
                <p className="font-semibold text-xs text-warm-800 mb-0.5">
                  {props.title}
                </p>
              )}
              <p className="text-xs text-warm-600 leading-relaxed">
                {props.content}
              </p>
            </div>
          </div>
        </div>
      );
    },

    Accordion: ({ props }) => {
      const [openIndex, setOpenIndex] = useState<number | null>(null);
      return (
        <div className="divide-y divide-warm-100 border border-warm-200 rounded-lg overflow-hidden">
          {(props.items ?? []).map((item, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-warm-800 hover:bg-warm-50 transition-colors text-left"
              >
                <span>{item.title}</span>
                <svg
                  className={`w-3.5 h-3.5 text-warm-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-3 pb-2 text-xs text-warm-600 leading-relaxed">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    },

    Timeline: ({ props }) => (
      <div className="relative pl-6">
        <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-warm-200" />
        <div className="flex flex-col gap-3">
          {(props.items ?? []).map((item, i) => {
            const dotColor =
              item.status === "completed"
                ? "bg-emerald-500"
                : item.status === "current"
                  ? "bg-teal-500 ring-2 ring-teal-200"
                  : "bg-warm-300";
            return (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-6 top-0.5 h-2.5 w-2.5 rounded-full ${dotColor}`}
                />
                <div>
                  <p className="text-xs font-semibold text-warm-800">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-warm-500 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),

    Progress: ({ props }) => {
      const max = props.max ?? 100;
      const pct = Math.min(100, Math.max(0, (props.value / max) * 100));
      const color =
        pct >= 80
          ? "bg-emerald-500"
          : pct >= 60
            ? "bg-teal-500"
            : pct >= 40
              ? "bg-amber-500"
              : "bg-red-500";
      return (
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] text-warm-500 uppercase tracking-wider">
              {props.label}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "var(--nestiq-primary, #115e59)" }}
            >
              {props.value}/{max}
            </span>
          </div>
          <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    },

    Separator: () => <div className="border-t border-warm-100 my-1" />,

    Link: ({ props }) => (
      <a
        href={props.href}
        className="text-xs font-semibold underline underline-offset-2"
        style={{ color: "var(--nestiq-primary, #0f766e)" }}
      >
        {props.text}
      </a>
    ),

    // =========================================================================
    // Interactive components — agent data resolved from NestiqChatProvider
    // =========================================================================

    MortgageCalculator: ({ props }) => {
      const CURRENCY_SYMBOLS: Record<string, string> = {
        CAD: "$",
        USD: "$",
        EUR: "\u20AC",
        GBP: "\u00A3",
        AUD: "A$",
        INR: "\u20B9",
      };

      const currency = props.currency ?? "CAD";
      const sym = CURRENCY_SYMBOLS[currency] ?? "$";

      const [price, setPrice] = useState(props.suggestedPrice ?? 800000);
      const [downPct, setDownPct] = useState(20);
      const [rate, setRate] = useState(props.suggestedRate ?? 4.99);
      const amortization = 25;

      const downPayment = price * (downPct / 100);
      const principal = price - downPayment;
      const monthlyRate = rate / 100 / 12;
      const numPayments = amortization * 12;
      const monthly =
        monthlyRate > 0
          ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
            (Math.pow(1 + monthlyRate, numPayments) - 1)
          : principal / numPayments;

      return (
        <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Mortgage Calculator
            </h4>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-warm-600">Home Price</span>
                <span className="font-semibold text-warm-900">
                  {sym}
                  {price.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={200000}
                max={3000000}
                step={25000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-1.5"
                style={{ accentColor: "var(--nestiq-primary, #0d9488)" }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-warm-600">Down Payment</span>
                <span className="font-semibold text-warm-900">
                  {downPct}% ({sym}
                  {downPayment.toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={downPct}
                onChange={(e) => setDownPct(Number(e.target.value))}
                className="w-full h-1.5"
                style={{ accentColor: "var(--nestiq-primary, #0d9488)" }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-warm-600">Interest Rate</span>
                <span className="font-semibold text-warm-900">{rate}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-1.5"
                style={{ accentColor: "var(--nestiq-primary, #0d9488)" }}
              />
            </div>
            <div
              className="rounded-lg p-3 text-center"
              style={{
                backgroundColor:
                  "var(--nestiq-primary-light, rgba(15,118,110,0.08))",
              }}
            >
              <div
                className="text-xs mb-0.5"
                style={{ color: "var(--nestiq-primary, #0f766e)" }}
              >
                Estimated Monthly Payment
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--nestiq-primary, #115e59)" }}
              >
                {sym}
                {Math.round(monthly).toLocaleString()}
              </div>
              <div
                className="text-[10px] mt-0.5"
                style={{
                  color: "var(--nestiq-primary, #0f766e)",
                  opacity: 0.8,
                }}
              >
                {amortization}-year amortization
              </div>
            </div>
          </div>
        </div>
      );
    },

    PropertyTaxEstimate: ({ props }) => {
      const purchasePrice = props.purchasePrice;
      const isFirstTimeBuyer = props.isFirstTimeBuyer ?? false;
      const isNewlyBuilt = props.isNewlyBuilt ?? false;

      function calculatePTT(price: number) {
        let tax = 0;
        if (price <= 200000) {
          tax = price * 0.01;
        } else if (price <= 2000000) {
          tax = 200000 * 0.01 + (price - 200000) * 0.02;
        } else {
          tax = 200000 * 0.01 + 1800000 * 0.02 + (price - 2000000) * 0.03;
        }
        return Math.round(tax);
      }

      function calculateExemption(price: number, newlyBuilt: boolean) {
        const threshold = newlyBuilt ? 1100000 : 835000;
        const fadeout = newlyBuilt ? 1150000 : 860000;
        if (price <= threshold) return calculatePTT(price);
        if (price < fadeout) {
          const full = calculatePTT(price);
          const ratio = (fadeout - price) / (fadeout - threshold);
          return Math.round(full * ratio);
        }
        return 0;
      }

      const totalTax = calculatePTT(purchasePrice);
      const exemption = isFirstTimeBuyer
        ? calculateExemption(purchasePrice, isNewlyBuilt)
        : 0;
      const netTax = totalTax - exemption;

      const tiers = [
        {
          range: "First $200,000",
          rate: "1%",
          amount: Math.min(purchasePrice, 200000) * 0.01,
        },
        {
          range: "$200,001 \u2013 $2,000,000",
          rate: "2%",
          amount:
            purchasePrice > 200000
              ? Math.min(purchasePrice - 200000, 1800000) * 0.02
              : 0,
        },
      ];

      if (purchasePrice > 2000000) {
        tiers.push({
          range: "Above $2,000,000",
          rate: "3%",
          amount: (purchasePrice - 2000000) * 0.03,
        });
      }

      return (
        <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            <h4 className="text-white text-sm font-semibold">
              BC Property Transfer Tax
            </h4>
            <p className="text-white/70 text-[10px]">
              On ${purchasePrice.toLocaleString()} purchase
            </p>
          </div>
          <div className="p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-warm-500">
                  <th className="text-left py-1 font-medium">Tier</th>
                  <th className="text-center py-1 font-medium">Rate</th>
                  <th className="text-right py-1 font-medium">Tax</th>
                </tr>
              </thead>
              <tbody>
                {tiers
                  .filter((t) => t.amount > 0)
                  .map((tier) => (
                    <tr key={tier.range} className="border-t border-warm-100">
                      <td className="py-1.5 text-warm-700">{tier.range}</td>
                      <td className="py-1.5 text-center text-warm-600">
                        {tier.rate}
                      </td>
                      <td className="py-1.5 text-right font-medium text-warm-900">
                        ${Math.round(tier.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-warm-200">
                  <td colSpan={2} className="py-1.5 font-semibold text-warm-900">
                    Total PTT
                  </td>
                  <td className="py-1.5 text-right font-bold text-warm-900">
                    ${totalTax.toLocaleString()}
                  </td>
                </tr>
                {isFirstTimeBuyer && exemption > 0 && (
                  <tr className="text-emerald-700">
                    <td colSpan={2} className="py-1 font-medium">
                      First-time buyer exemption
                    </td>
                    <td className="py-1 text-right font-bold">
                      -${exemption.toLocaleString()}
                    </td>
                  </tr>
                )}
                {isFirstTimeBuyer && (
                  <tr
                    className="border-t border-warm-200"
                    style={{
                      backgroundColor:
                        "var(--nestiq-primary-light, rgba(15,118,110,0.08))",
                    }}
                  >
                    <td
                      colSpan={2}
                      className="py-2 font-bold"
                      style={{ color: "var(--nestiq-primary, #115e59)" }}
                    >
                      You Pay
                    </td>
                    <td
                      className="py-2 text-right font-bold text-sm"
                      style={{ color: "var(--nestiq-primary, #115e59)" }}
                    >
                      ${netTax.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
            {isFirstTimeBuyer && exemption > 0 && (
              <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 rounded-md px-2 py-1.5 text-center">
                You save ${exemption.toLocaleString()} with the first-time buyer
                exemption!
              </div>
            )}
          </div>
        </div>
      );
    },

    ContactActions: () => {
      const { agent } = useNestiqChat();
      const fullName = `${agent.firstName} ${agent.lastName}`;
      const initials =
        (agent.firstName?.[0] ?? "") + (agent.lastName?.[0] ?? "");

      return (
        <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            {agent.photoUrl ? (
              <img
                src={agent.photoUrl}
                alt={fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {initials}
              </div>
            )}
            <div>
              <h4 className="text-white font-semibold text-sm">{fullName}</h4>
              {agent.brokerage && (
                <p className="text-white/70 text-[10px]">
                  Realtor | {agent.brokerage}
                </p>
              )}
            </div>
          </div>
          <div className="p-3 space-y-2">
            {agent.phone && (
              <a
                href={`tel:${agent.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-warm-50 hover:bg-warm-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: "var(--nestiq-primary, #0d9488)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <div className="text-xs font-semibold text-warm-900">
                    Call or Text
                  </div>
                  <div className="text-xs text-warm-600">{agent.phone}</div>
                </div>
              </a>
            )}
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-warm-50 hover:bg-warm-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                style={{ color: "var(--nestiq-primary, #0d9488)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="text-xs font-semibold text-warm-900">Email</div>
                <div className="text-xs text-warm-600">{agent.email}</div>
              </div>
            </a>
            <a
              href={`mailto:${agent.email}?subject=Inquiry from website`}
              className="block text-center text-xs font-semibold text-white rounded-lg py-2.5 transition-colors"
              style={{ backgroundColor: "var(--nestiq-primary, #0f766e)" }}
            >
              Send a Message &rarr;
            </a>
          </div>
        </div>
      );
    },

    ScheduleForm: ({ props }) => {
      const { agent, onLeadCapture } = useNestiqChat();
      const neighbourhood = props.neighbourhood ?? undefined;
      const context = props.context ?? "";

      const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: context,
      });
      const [submitted, setSubmitted] = useState(false);
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return;
        setLoading(true);

        try {
          await Promise.resolve(
            onLeadCapture?.({
              name: formData.name,
              email: formData.email,
              message: `${neighbourhood ? `Neighbourhood: ${neighbourhood}\n` : ""}${formData.message}`,
              source: "Chat - Schedule Viewing",
              neighbourhood,
            })
          );
        } catch {
          // Handled by parent
        }

        setLoading(false);
        setSubmitted(true);
      };

      if (submitted) {
        return (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 my-2 text-center">
            <svg
              className="w-8 h-8 mx-auto mb-1.5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-xs font-semibold text-emerald-800">
              Request sent! {agent.firstName} will be in touch within 24 hours.
            </p>
          </div>
        );
      }

      return (
        <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            <h4 className="text-white text-sm font-semibold">
              Book a {neighbourhood ? `${neighbourhood} ` : ""}Viewing
            </h4>
          </div>
          <form onSubmit={handleSubmit} className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color":
                    "var(--nestiq-primary-light, rgba(15,118,110,0.2))",
                } as React.CSSProperties
              }
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={
                {
                  "--tw-ring-color":
                    "var(--nestiq-primary-light, rgba(15,118,110,0.2))",
                } as React.CSSProperties
              }
            />
            <textarea
              placeholder="What are you looking for?"
              rows={2}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
              style={
                {
                  "--tw-ring-color":
                    "var(--nestiq-primary-light, rgba(15,118,110,0.2))",
                } as React.CSSProperties
              }
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-xs font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--nestiq-primary, #0f766e)" }}
            >
              {loading ? "Sending..." : "Request Viewing"}
            </button>
          </form>
        </div>
      );
    },

    NeighbourhoodMap: ({ props }) => {
      const { neighbourhoods, googleMapsApiKey } = useNestiqChat();
      const nData = neighbourhoods.find(
        (n) =>
          n.slug === props.slug ||
          n.name.toLowerCase() === (props.neighbourhood ?? "").toLowerCase()
      );
      const center = nData?.center;

      if (!center) {
        return (
          <div className="bg-warm-50 rounded-xl p-3 my-2 text-xs text-warm-500 italic">
            Map data not available for {props.neighbourhood}
          </div>
        );
      }

      return (
        <div className="bg-white rounded-xl border border-warm-200 shadow-sm my-2 w-full overflow-hidden">
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: "var(--nestiq-primary, #115e59)" }}
          >
            <h4 className="text-white text-sm font-semibold">
              {props.neighbourhood} Map
            </h4>
          </div>
          <div className="p-2">
            <NeighbourhoodMapComponent
              centre={center}
              zoom={nData.zoom}
              pois={nData.fallbackPois ?? []}
              boundaryName={props.neighbourhood}
              height="220px"
              showLegend={false}
              googleMapsApiKey={googleMapsApiKey}
            />
          </div>
        </div>
      );
    },

    PlacesEmbed: ({ props }) => {
      const { neighbourhoods, googleMapsApiKey, agent } = useNestiqChat();
      const nData = neighbourhoods.find(
        (n) =>
          n.name.toLowerCase() === props.neighbourhood.toLowerCase() ||
          n.slug === props.neighbourhood.toLowerCase().replace(/\s+/g, "-")
      );
      const lat = nData?.center?.lat;
      const lng = nData?.center?.lng;

      if (!googleMapsApiKey || !lat || !lng) {
        const contactLabel = agent
          ? `Contact ${agent.firstName}`
          : "Contact your agent";
        return (
          <div className="bg-warm-50 rounded-xl p-3 my-2 text-xs text-warm-500 italic">
            Places search unavailable. {contactLabel} directly for local
            recommendations!
          </div>
        );
      }

      return (
        <PlacesSearchComponent
          query={props.query}
          neighbourhood={props.neighbourhood}
          lat={lat}
          lng={lng}
          agentName={agent.firstName}
          googleMapsApiKey={googleMapsApiKey}
        />
      );
    },
  },

  actions: {},
});

export function Fallback({ type }: { type: string }) {
  return (
    <div className="p-2 border border-dashed border-warm-200 rounded-lg text-warm-400 text-xs">
      Unknown: {type}
    </div>
  );
}
