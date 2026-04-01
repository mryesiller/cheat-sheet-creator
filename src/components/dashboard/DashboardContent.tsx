"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { SECTION_COLORS } from "@/lib/utils/colors";
import type { SectionColor } from "@/lib/types/database";
import { TEMPLATES } from "@/lib/data/templates";

interface SheetSummary {
  id: string;
  title: string;
  description: string;
  slug: string;
  is_public: boolean;
  updated_at: string;
  sections: { id: string; color: SectionColor }[];
}

export default function DashboardContent({
  sheets,
}: {
  sheets: SheetSummary[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate() {
    setActionError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Cheat Sheet" }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.id) {
        throw new Error(payload?.error || "Failed to create cheat sheet.");
      }
      router.push(`/editor/${payload.id}`);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to create cheat sheet."
      );
      setCreating(false);
    }
  }

  async function handleUseTemplate(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setActionError(null);
    setCreatingTemplate(templateId);
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.name,
          sections: template.sections,
          toggles: template.toggles,
          layout: template.layout,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.id) {
        throw new Error(payload?.error || "Failed to create from template.");
      }
      router.push(`/editor/${payload.id}`);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to create from template."
      );
      setCreatingTemplate(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this cheat sheet? This cannot be undone.")) return;
    setActionError(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/sheets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete cheat sheet.");
      }
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete cheat sheet."
      );
    } finally {
      setDeleting(null);
    }
  }

  async function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/sheet/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cheat Sheets</h1>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Plus size={16} />
          {creating ? "Creating..." : "Create New"}
        </button>
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Templates */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Start from a template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleUseTemplate(template.id)}
              disabled={creatingTemplate === template.id}
              className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
            >
              <div className="text-2xl mb-2">{template.emoji}</div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {creatingTemplate === template.id ? "Creating..." : template.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {template.description}
              </div>
              <div className="flex gap-1 mt-3">
                {template.sections.slice(0, 6).map((s, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SECTION_COLORS[s.color]?.header || "#6b7280" }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {sheets.length > 0 && (
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Your sheets
        </h2>
      )}

      {sheets.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-300 mb-4">
            <FileEmptyIcon />
          </div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">
            No cheat sheets yet
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Create your first cheat sheet and share it with the world.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Create your first sheet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              {/* Color dots */}
              <div className="flex gap-1 mb-3">
                {sheet.sections.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        SECTION_COLORS[s.color]?.header || "#6b7280",
                    }}
                  />
                ))}
                {sheet.sections.length === 0 && (
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                )}
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                {sheet.title}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                {sheet.sections.length} sections &middot; Updated{" "}
                {new Date(sheet.updated_at).toLocaleDateString()}
                {!sheet.is_public && (
                  <span className="ml-1 text-amber-500">&middot; Private</span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/editor/${sheet.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
                <a
                  href={`/sheet/${sheet.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ExternalLink size={12} />
                  View
                </a>
                <button
                  onClick={() => handleCopyLink(sheet.slug)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <LinkIcon size={12} />
                  {copied === sheet.slug ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => handleDelete(sheet.id)}
                  disabled={deleting === sheet.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileEmptyIcon() {
  return (
    <svg
      className="w-16 h-16 mx-auto"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
