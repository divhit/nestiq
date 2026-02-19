"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const AGENT_SLUG = "your-agent-slug";
const CHAT_URL_PROD = `https://chat.nestiq.com/chat/${AGENT_SLUG}`;
const CHAT_URL_DEV = `http://localhost:3001/chat/${AGENT_SLUG}`;
const EMBED_SCRIPT = `<script src="http://localhost:3001/v1/embed.js" data-agent="${AGENT_SLUG}" async></script>`;
const QR_API = (url: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

const tabs = [
  { id: "link", label: "Chat Link" },
  { id: "qr", label: "QR Code" },
  { id: "email", label: "Email Signature" },
  { id: "embed", label: "Website Embed" },
  { id: "social", label: "Social Media" },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return { copied, copy };
}

function CopyButton({
  text,
  label,
  copyKey,
  copied,
  onCopy,
  size = "default",
}: {
  text: string;
  label?: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  size?: "default" | "large";
}) {
  const isCopied = copied === copyKey;
  const base =
    size === "large"
      ? "rounded-lg px-6 py-3 text-sm font-semibold"
      : "rounded-md px-3 py-1.5 text-xs font-medium";

  return (
    <button
      onClick={() => onCopy(text, copyKey)}
      className={`${base} transition-colors ${
        isCopied
          ? "bg-green-100 text-green-700"
          : "bg-teal-700 text-white hover:bg-teal-800"
      }`}
    >
      {isCopied ? "Copied!" : label || "Copy"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Chat Link                                                     */
/* ------------------------------------------------------------------ */

function ChatLinkTab({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (t: string, k: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Your Chat Link</h3>
        <p className="mt-1 text-sm text-gray-500">
          Share this link anywhere -- social media, text messages, business
          cards. No website needed!
        </p>
      </div>

      {/* Production URL */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
          Production URL
        </label>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-teal-700 select-all">
            {CHAT_URL_PROD}
          </div>
          <CopyButton
            text={CHAT_URL_PROD}
            label="Copy Link"
            copyKey="prod-url"
            copied={copied}
            onCopy={onCopy}
            size="large"
          />
        </div>
      </div>

      {/* Dev URL */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
          Development URL
        </label>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-600 select-all">
            {CHAT_URL_DEV}
          </div>
          <CopyButton
            text={CHAT_URL_DEV}
            copyKey="dev-url"
            copied={copied}
            onCopy={onCopy}
          />
        </div>
      </div>

      {/* Mobile Preview Mock */}
      <div>
        <h4 className="text-sm font-medium text-gray-700">
          Preview: What visitors will see
        </h4>
        <div className="mt-3 mx-auto w-[280px]">
          <div className="rounded-[2rem] border-[6px] border-gray-800 bg-white shadow-xl overflow-hidden">
            {/* Phone Notch */}
            <div className="h-6 bg-gray-800 flex items-center justify-center">
              <div className="w-20 h-3 rounded-full bg-gray-700" />
            </div>
            {/* Screen */}
            <div className="h-[420px] bg-gradient-to-b from-teal-50 to-white flex flex-col">
              {/* Header */}
              <div className="bg-teal-700 px-4 py-3 text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">JS</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  Jane Smith
                </p>
                <p className="text-[10px] text-teal-100">
                  AI Real Estate Assistant
                </p>
              </div>
              {/* Chat messages mock */}
              <div className="flex-1 px-3 py-3 space-y-2">
                <div className="max-w-[80%] rounded-xl rounded-tl-sm bg-teal-700 px-3 py-2">
                  <p className="text-xs text-white">
                    Hi! I&apos;m Jane&apos;s AI assistant. How can I help you
                    with real estate today?
                  </p>
                </div>
                <div className="ml-auto max-w-[70%] rounded-xl rounded-tr-sm bg-gray-200 px-3 py-2">
                  <p className="text-xs text-gray-800">
                    I&apos;m looking for homes in Oakville
                  </p>
                </div>
                <div className="max-w-[80%] rounded-xl rounded-tl-sm bg-teal-700 px-3 py-2">
                  <p className="text-xs text-white">
                    Great choice! Oakville has some wonderful neighbourhoods...
                  </p>
                </div>
              </div>
              {/* Input mock */}
              <div className="border-t border-gray-200 px-3 py-2">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="flex-1 text-xs text-gray-400">
                    Type a message...
                  </div>
                  <div className="h-6 w-6 rounded-full bg-teal-700 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: QR Code                                                       */
/* ------------------------------------------------------------------ */

function QRCodeTab({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (t: string, k: string) => void;
}) {
  const qrUrl = QR_API(CHAT_URL_PROD);

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `nestiq-chatbot-qr-${AGENT_SLUG}.png`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
        <p className="mt-1 text-sm text-gray-500">
          Print on business cards, yard signs, flyers, and open house materials.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* QR Code */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="QR Code for your chatbot"
            width={300}
            height={300}
            className="rounded-lg"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={downloadQR}
              className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
            >
              Download PNG
            </button>
            <CopyButton
              text={CHAT_URL_PROD}
              label="Copy URL"
              copyKey="qr-url"
              copied={copied}
              onCopy={onCopy}
            />
          </div>
        </div>

        {/* Use Cases */}
        <div className="flex-1 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Where to use your QR code
          </h4>
          {[
            {
              title: "Business Cards",
              desc: "Add a QR code to the back of your business cards for instant chatbot access.",
              icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
            },
            {
              title: "Yard Signs",
              desc: "Buyers can scan while driving by to instantly chat about the listing.",
              icon: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
            },
            {
              title: "Flyers & Brochures",
              desc: "Include in print materials at open houses and community events.",
              icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
            },
            {
              title: "Open Houses",
              desc: "Place at the entrance so visitors can chat and ask questions later.",
              icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <svg
                  className="h-5 w-5 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Email Signature                                               */
/* ------------------------------------------------------------------ */

function EmailSignatureTab({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (t: string, k: string) => void;
}) {
  const signatureHtml = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="padding:12px 0;">
      <a href="${CHAT_URL_PROD}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 20px;background-color:#0f766e;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
        &#x1F4AC; Chat with me about real estate
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:0;font-size:11px;color:#888888;">
      Powered by NestIQ &mdash; AI Real Estate Assistant
    </td>
  </tr>
</table>`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Email Signature
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a chat button to your email signature. Works with Gmail, Outlook,
          and most email clients.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
          Preview
        </label>
        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-6">
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-semibold">Jane Smith</p>
            <p className="text-gray-500">Real Estate Agent | RE/MAX</p>
            <p className="text-gray-500">jane@example.com | (555) 123-4567</p>
          </div>
          <div className="mt-3">
            <span className="inline-block rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white">
              Chat with me about real estate
            </span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Powered by NestIQ -- AI Real Estate Assistant
          </p>
        </div>
      </div>

      {/* HTML Code */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            HTML Code
          </label>
          <CopyButton
            text={signatureHtml}
            label="Copy HTML"
            copyKey="sig-html"
            copied={copied}
            onCopy={onCopy}
          />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-xs text-green-400 font-mono leading-relaxed">
          <code>{signatureHtml}</code>
        </pre>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900">
          How to add to your email
        </h4>
        <div className="mt-4 space-y-4">
          {[
            {
              platform: "Gmail",
              steps:
                "Settings (gear icon) > See all settings > General > Signature > Click the HTML editor icon (< >) > Paste the code",
            },
            {
              platform: "Outlook",
              steps:
                'File > Options > Mail > Signatures > New > Switch to "Source Edit" > Paste the code',
            },
            {
              platform: "Apple Mail",
              steps:
                "Mail > Preferences > Signatures > Create a new signature > Paste the code in an HTML editor first, then copy the rendered version",
            },
          ].map((item) => (
            <div key={item.platform} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                {item.platform[0]}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.platform}
                </p>
                <p className="text-xs text-gray-500">{item.steps}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Website Embed                                                 */
/* ------------------------------------------------------------------ */

function WebsiteEmbedTab({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (t: string, k: string) => void;
}) {
  const [activeGuide, setActiveGuide] = useState("WordPress");

  const guides: Record<string, { steps: string[] }> = {
    WordPress: {
      steps: [
        'Install via Plugin (recommended): Install the "WPCode" plugin, add a new snippet, paste the embed code, set to run site-wide in the footer, and activate.',
        "Manual: Go to Appearance > Theme File Editor > footer.php, paste the code before the closing </body> tag.",
        "Save and verify the chatbot bubble appears on your site.",
      ],
    },
    Squarespace: {
      steps: [
        "Go to Settings > Advanced > Code Injection.",
        'Paste the embed code in the "Footer" section.',
        "Click Save and visit your live site to verify.",
      ],
    },
    Wix: {
      steps: [
        "Go to Settings > Custom Code.",
        'Click "+ Add Custom Code" and paste the embed code.',
        'Set placement to "Body - end" and apply to "All pages".',
        "Publish your site and verify.",
      ],
    },
    Webflow: {
      steps: [
        "Go to Site Settings > Custom Code.",
        'Paste the embed code in the "Footer Code" section.',
        "Save and publish your site.",
      ],
    },
    Other: {
      steps: [
        "Open the HTML file for your website.",
        "Paste the embed code just before the closing </body> tag.",
        "Upload / deploy the updated file and verify the chatbot loads.",
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Website Embed</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add the NestIQ chatbot to any website with a single line of code.
        </p>
      </div>

      {/* Embed Code Block */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium uppercase tracking-wider text-gray-400">
            Your Embed Code
          </label>
          <CopyButton
            text={EMBED_SCRIPT}
            label="Copy Code"
            copyKey="embed-code"
            copied={copied}
            onCopy={onCopy}
          />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-sm text-green-400 font-mono">
          <code>{EMBED_SCRIPT}</code>
        </pre>
        <p className="mt-2 text-xs text-gray-500">
          Replace{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-700">
            your-agent-slug
          </code>{" "}
          with your actual agent slug from your profile settings.
        </p>
      </div>

      {/* Platform Guides */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900">
          Platform-Specific Instructions
        </h4>

        {/* Platform Tabs */}
        <div className="mt-4 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
          {Object.keys(guides).map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveGuide(platform)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeGuide === platform
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Steps */}
        <ol className="mt-4 space-y-3">
          {guides[activeGuide].steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Widget Preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900">Preview</h4>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-gray-400">
              your-website.com
            </span>
          </div>
          <div className="relative h-64 bg-gray-50">
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">Your website content</p>
            </div>
            {/* Simulated chat bubble */}
            <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 shadow-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Social Media                                                  */
/* ------------------------------------------------------------------ */

function SocialMediaTab({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (t: string, k: string) => void;
}) {
  const socials = [
    {
      platform: "Instagram",
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Z",
      label: "Instagram Bio",
      text: CHAT_URL_PROD,
      hint: "Paste in your Instagram bio link",
      color: "from-purple-500 to-pink-500",
    },
    {
      platform: "Facebook",
      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z",
      label: "Facebook Post",
      text: `Have questions about real estate? Chat with my AI assistant 24/7 -- get instant answers about listings, neighbourhoods, and market trends!\n\n${CHAT_URL_PROD}`,
      hint: "Share as a post or add to your business page",
      color: "from-blue-600 to-blue-700",
    },
    {
      platform: "LinkedIn",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z",
      label: "LinkedIn Post",
      text: `Excited to share my new AI real estate assistant! Whether you have questions about the market, specific listings, or neighbourhood insights -- my AI chatbot is available 24/7 to help.\n\nTry it here: ${CHAT_URL_PROD}\n\n#RealEstate #AI #PropTech`,
      hint: "Share as a professional post",
      color: "from-blue-700 to-blue-800",
    },
    {
      platform: "TikTok",
      icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
      label: "TikTok Bio",
      text: CHAT_URL_PROD,
      hint: "Add to your TikTok profile bio link",
      color: "from-gray-900 to-gray-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
        <p className="mt-1 text-sm text-gray-500">
          Share your chatbot across social platforms to reach more potential
          clients.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {socials.map((social) => (
          <div
            key={social.platform}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div
              className={`bg-gradient-to-r ${social.color} px-4 py-3 flex items-center gap-3`}
            >
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d={social.icon} />
              </svg>
              <span className="text-sm font-semibold text-white">
                {social.label}
              </span>
            </div>
            {/* Body */}
            <div className="p-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed">
                  {social.text}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">{social.hint}</p>
                <CopyButton
                  text={social.text}
                  copyKey={`social-${social.platform}`}
                  copied={copied}
                  onCopy={onCopy}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SharePage() {
  const [activeTab, setActiveTab] = useState<TabId>("link");
  const { copied, copy } = useCopy();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Share Your Chatbot</h1>
      <p className="mt-1 text-sm text-gray-500">
        Get your AI assistant in front of clients -- no tech skills required.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.id === "link" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            )}
            {tab.id === "qr" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 14.625v2.625m3.375-2.625v2.625m-6.75 2.25h9.75"
                />
              </svg>
            )}
            {tab.id === "email" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            )}
            {tab.id === "embed" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
            )}
            {tab.id === "social" && (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                />
              </svg>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "link" && (
          <ChatLinkTab copied={copied} onCopy={copy} />
        )}
        {activeTab === "qr" && <QRCodeTab copied={copied} onCopy={copy} />}
        {activeTab === "email" && (
          <EmailSignatureTab copied={copied} onCopy={copy} />
        )}
        {activeTab === "embed" && (
          <WebsiteEmbedTab copied={copied} onCopy={copy} />
        )}
        {activeTab === "social" && (
          <SocialMediaTab copied={copied} onCopy={copy} />
        )}
      </div>
    </div>
  );
}
