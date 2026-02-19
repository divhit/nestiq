"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brokerage: string;
  licenseNumber: string;
  city: string;
  provinceState: string;
  primaryColor: string;
  secondaryColor: string;
  bio: string;
}

const initialForm: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  brokerage: "",
  licenseNumber: "",
  city: "",
  provinceState: "",
  primaryColor: "#0f766e",
  secondaryColor: "#f5f0eb",
  bio: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: Save to DB
    console.log("Profile saved:", form);
    setTimeout(() => setSaving(false), 800);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        These details are shown to your website visitors in the chatbot.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-8">
        {/* Personal Info */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Personal Information
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="(604) 555-0123"
              />
            </div>
          </div>
        </section>

        {/* Professional Info */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Professional Details
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brokerage
              </label>
              <input
                type="text"
                value={form.brokerage}
                onChange={(e) => update("brokerage", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="RE/MAX, Keller Williams, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => update("licenseNumber", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. 123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="Vancouver"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Province / State
              </label>
              <input
                type="text"
                value={form.provinceState}
                onChange={(e) => update("provinceState", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                placeholder="BC"
              />
            </div>
          </div>
        </section>

        {/* Branding */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">Branding</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Color
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Photo */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">
            Profile Photo
          </h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </section>

        {/* Bio */}
        <section>
          <h2 className="text-base font-semibold text-gray-900">Bio</h2>
          <div className="mt-4">
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              placeholder="Tell visitors about yourself, your experience, and the areas you serve..."
            />
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
