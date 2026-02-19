"use client";

import { useState, type FormEvent } from "react";

interface Neighbourhood {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  avgPrice: string;
  priceChange: string;
  walkScore: number;
  transitScore: number;
  highlights: string[];
}

const emptyNeighbourhood: Omit<Neighbourhood, "id"> = {
  name: "",
  slug: "",
  tagline: "",
  centerLat: 49.2827,
  centerLng: -123.1207,
  zoom: 14,
  avgPrice: "",
  priceChange: "",
  walkScore: 0,
  transitScore: 0,
  highlights: [],
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NeighbourhoodsPage() {
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyNeighbourhood);
  const [highlightsText, setHighlightsText] = useState("");

  function resetForm() {
    setForm(emptyNeighbourhood);
    setHighlightsText("");
    setShowForm(false);
    setEditingId(null);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === toSlug(prev.name) || prev.slug === "" ? toSlug(name) : prev.slug,
    }));
  }

  function startEdit(n: Neighbourhood) {
    setForm({
      name: n.name,
      slug: n.slug,
      tagline: n.tagline,
      centerLat: n.centerLat,
      centerLng: n.centerLng,
      zoom: n.zoom,
      avgPrice: n.avgPrice,
      priceChange: n.priceChange,
      walkScore: n.walkScore,
      transitScore: n.transitScore,
      highlights: n.highlights,
    });
    setHighlightsText(n.highlights.join("\n"));
    setEditingId(n.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setNeighbourhoods((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) resetForm();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const highlights = highlightsText
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    if (editingId) {
      setNeighbourhoods((prev) =>
        prev.map((n) =>
          n.id === editingId ? { ...form, highlights, id: editingId } : n
        )
      );
    } else {
      const newEntry: Neighbourhood = {
        ...form,
        highlights,
        id: crypto.randomUUID(),
      };
      setNeighbourhoods((prev) => [...prev, newEntry]);
    }

    console.log("Neighbourhood saved:", { ...form, highlights });
    resetForm();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neighbourhoods</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the neighbourhoods your chatbot knows about.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors"
          >
            + Add Neighbourhood
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-900">
            {editingId ? "Edit Neighbourhood" : "New Neighbourhood"}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Oakridge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="oakridge"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tagline: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Modern & High-Growth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Center Latitude
              </label>
              <input
                type="number"
                step="any"
                value={form.centerLat}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    centerLat: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Center Longitude
              </label>
              <input
                type="number"
                step="any"
                value={form.centerLng}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    centerLng: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zoom Level
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.zoom}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    zoom: parseInt(e.target.value) || 14,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Average Price
              </label>
              <input
                type="text"
                value={form.avgPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, avgPrice: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="$1.6M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price Change
              </label>
              <input
                type="text"
                value={form.priceChange}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priceChange: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="+8.2% YoY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Walk Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.walkScore}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    walkScore: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transit Score (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.transitScore}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    transitScore: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Highlights
              </label>
              <textarea
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder={"One highlight per line\ne.g. Oakridge Park redevelopment\nCanada Line access"}
              />
              <p className="mt-1 text-xs text-gray-500">
                One highlight per line.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition-colors"
            >
              {editingId ? "Update" : "Add Neighbourhood"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="mt-8 space-y-4">
        {neighbourhoods.length === 0 && !showForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">
              No neighbourhoods added yet.
            </p>
          </div>
        )}
        {neighbourhoods.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {n.name}
                </h3>
                {n.tagline && (
                  <p className="mt-0.5 text-sm text-gray-500">{n.tagline}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(n)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-gray-500">Avg Price</span>
                <p className="font-medium text-gray-900">
                  {n.avgPrice || "--"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Price Change</span>
                <p className="font-medium text-gray-900">
                  {n.priceChange || "--"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Walk Score</span>
                <p className="font-medium text-gray-900">{n.walkScore}</p>
              </div>
              <div>
                <span className="text-gray-500">Transit Score</span>
                <p className="font-medium text-gray-900">{n.transitScore}</p>
              </div>
            </div>
            {n.highlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {n.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
