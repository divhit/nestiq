"use client";

import { useState, type FormEvent } from "react";

const personalityTemplates = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "expert", label: "Expert" },
  { value: "custom", label: "Custom" },
];

const toolOptions = [
  {
    key: "mortgageCalc",
    label: "Mortgage Calculator",
    description: "Interactive mortgage payment calculator with amortization breakdown.",
  },
  {
    key: "propertyTax",
    label: "Property Tax Estimate",
    description: "Estimate property transfer tax and annual property taxes.",
  },
  {
    key: "contactCard",
    label: "Contact Card",
    description: "Display your contact information with click-to-call and email.",
  },
  {
    key: "scheduleViewing",
    label: "Schedule Viewing",
    description: "Let visitors request a property viewing or consultation.",
  },
  {
    key: "neighbourhoodMap",
    label: "Neighbourhood Map",
    description: "Interactive Google Maps view of neighbourhoods you serve.",
  },
  {
    key: "placesSearch",
    label: "Places Search",
    description: "Search nearby amenities like schools, restaurants, and transit.",
  },
  {
    key: "buyerSellerGuide",
    label: "Buyer/Seller Guide",
    description: "Step-by-step buying or selling process guide.",
  },
  {
    key: "marketSnapshot",
    label: "Market Snapshot",
    description: "Current market statistics and trends for your area.",
  },
  {
    key: "neighbourhoodCard",
    label: "Neighbourhood Card",
    description: "Rich neighbourhood overview with scores, prices, and highlights.",
  },
];

interface BotConfig {
  template: string;
  customInstructions: string;
  firstMessage: string;
  quickQuestions: string[];
  tools: Record<string, boolean>;
}

const initialConfig: BotConfig = {
  template: "professional",
  customInstructions: "",
  firstMessage: "Hi! How can I help with your real estate questions?",
  quickQuestions: [
    "I'm looking to buy",
    "Tell me about neighbourhoods",
    "What can I afford?",
    "I want to sell my home",
  ],
  tools: Object.fromEntries(toolOptions.map((t) => [t.key, true])),
};

export default function BotSettingsPage() {
  const [config, setConfig] = useState<BotConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof BotConfig>(key: K, value: BotConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateQuestion(index: number, value: string) {
    setConfig((prev) => {
      const updated = [...prev.quickQuestions];
      updated[index] = value;
      return { ...prev, quickQuestions: updated };
    });
  }

  function removeQuestion(index: number) {
    setConfig((prev) => ({
      ...prev,
      quickQuestions: prev.quickQuestions.filter((_, i) => i !== index),
    }));
  }

  function addQuestion() {
    setConfig((prev) => ({
      ...prev,
      quickQuestions: [...prev.quickQuestions, ""],
    }));
  }

  function toggleTool(key: string) {
    setConfig((prev) => ({
      ...prev,
      tools: { ...prev.tools, [key]: !prev.tools[key] },
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    console.log("Bot config saved:", config);
    setTimeout(() => setSaving(false), 800);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Bot Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure your chatbot&apos;s personality, quick questions, and enabled
        tools.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-10">
        {/* Personality */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Personality
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template
              </label>
              <select
                value={config.template}
                onChange={(e) => updateField("template", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                {personalityTemplates.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {config.template === "custom"
                  ? "Custom Instructions"
                  : "Additional Instructions"}
              </label>
              <textarea
                value={config.customInstructions}
                onChange={(e) =>
                  updateField("customInstructions", e.target.value)
                }
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder={
                  config.template === "custom"
                    ? "Describe how your chatbot should behave, its tone, and any specific guidelines..."
                    : "Add any extra instructions to supplement the selected template..."
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Message
              </label>
              <input
                type="text"
                value={config.firstMessage}
                onChange={(e) => updateField("firstMessage", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Hi! How can I help with your real estate questions?"
              />
              <p className="mt-1 text-xs text-gray-500">
                The greeting visitors see when the chat opens.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Questions */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Quick Questions
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Suggested prompts shown as buttons below the greeting.
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              + Add
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {config.quickQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="Enter a quick question..."
                />
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Remove"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {config.quickQuestions.length === 0 && (
              <p className="text-sm text-gray-400">
                No quick questions. Click &quot;+ Add&quot; to create one.
              </p>
            )}
          </div>
        </section>

        {/* Tools */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">Tools</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Select the interactive tools your chatbot can use.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolOptions.map((tool) => {
              const enabled = config.tools[tool.key];
              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => toggleTool(tool.key)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    enabled
                      ? "border-teal-200 bg-teal-50 ring-1 ring-teal-200"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        enabled ? "text-teal-800" : "text-gray-700"
                      }`}
                    >
                      {tool.label}
                    </span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded ${
                        enabled
                          ? "bg-teal-700 text-white"
                          : "border border-gray-300 bg-white"
                      }`}
                    >
                      {enabled && (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
