"use client";

import { useState, type FormEvent } from "react";

export default function MarketDataPage() {
  const [marketData, setMarketData] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    console.log("Market data saved:", marketData);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Market Data</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add local market statistics to your chatbot&apos;s knowledge base.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Market Data
          </label>
          <textarea
            value={marketData}
            onChange={(e) => setMarketData(e.target.value)}
            rows={16}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
            placeholder={`Paste your market data here. For example:

Metro Vancouver Composite Benchmark: $1,101,900 (-5.7% YoY)
Detached Homes: $1,828,200 (-3.2% YoY)
Townhomes: $1,050,300 (-4.1% YoY)
Condos: $745,100 (-7.8% YoY)

Average Days on Market: 32
Sales-to-Active Listings Ratio: 14.2%
New Listings (Month): 4,783

Market Conditions: Buyer-friendly territory
Interest Rate (5yr fixed): 4.49%`}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Paste your market data here. Include average prices, trends, days
              on market, and any other statistics. This will be included verbatim
              in your chatbot&apos;s knowledge base.
            </p>
            <span className="shrink-0 text-xs text-gray-400">
              {marketData.length.toLocaleString()} characters
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Market Data"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
