"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

interface ToastState {
  type: "success" | "error" | "info";
  message: string;
}

const MAX_SHEETS_PER_USER = 3;

export default function DashboardContent({
  sheets,
}: {
  sheets: SheetSummary[];
}) {
  const router = useRouter();
  const [sheetList, setSheetList] = useState<SheetSummary[]>(sheets);
  const [creating, setCreating] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setSheetList(sheets);
  }, [sheets]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(type: ToastState["type"], message: string) {
    setToast({ type, message });
  }

  const limitReached = sheetList.length >= MAX_SHEETS_PER_USER;

  async function handleCreate() {
    if (limitReached) {
      const message = `You can create up to ${MAX_SHEETS_PER_USER} cheat sheets on the free plan.`;
      setActionError(message);
      showToast("info", message);
      return;
    }

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
      showToast(
        "success",
        "Cheat sheet created. Redirecting to the editor..."
      );
      router.push(`/editor/${payload.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create cheat sheet.";
      setActionError(message);
      showToast("error", message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUseTemplate(templateId: string) {
    if (limitReached) {
      const message = `You can create up to ${MAX_SHEETS_PER_USER} cheat sheets on the free plan.`;
      setActionError(message);
      showToast("info", message);
      return;
    }

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
      showToast("success", `${template.name} template was added.`);
      router.push(`/editor/${payload.id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create from template.";
      setActionError(message);
      showToast("error", message);
    } finally {
      setCreatingTemplate(null);
    }
  }

  function handleDeleteRequest(id: string) {
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    const previousSheets = sheetList;
    setPendingDeleteId(null);
    setActionError(null);
    setDeleting(id);
    setSheetList((current) => current.filter((sheet) => sheet.id !== id));

    try {
      const res = await fetch(`/api/sheets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete cheat sheet.");
      }
      showToast("success", "Cheat sheet deleted.");
      router.refresh();
    } catch (error) {
      setSheetList(previousSheets);
      const message =
        error instanceof Error ? error.message : "Failed to delete cheat sheet.";
      setActionError(message);
      showToast("error", message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/sheet/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    showToast("success", "Share link copied to clipboard.");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cheat Sheets</h1>
        <button
          onClick={handleCreate}
          disabled={creating || limitReached}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          {creating ? "Creating..." : limitReached ? "Limit Reached" : "Create New"}
        </button>
      </div>

      {actionError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
        Free plan limit: up to <strong>{MAX_SHEETS_PER_USER}</strong> cheat sheets.
        Current usage: <strong>{sheetList.length}</strong> /{" "}
        {MAX_SHEETS_PER_USER}
      </div>

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
              disabled={creatingTemplate === template.id || limitReached}
              className="cursor-pointer text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">{template.emoji}</div>
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {creatingTemplate === template.id
                  ? "Creating..."
                  : limitReached
                  ? `${template.name} (Limit)`
                  : template.name}
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

      {sheetList.length > 0 && (
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Your sheets
        </h2>
      )}

      {sheetList.length === 0 ? (
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
            disabled={creating || limitReached}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            {limitReached ? "Limit Reached" : "Create your first sheet"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheetList.map((sheet) => (
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
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <LinkIcon size={12} />
                  {copied === sheet.slug ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => handleDeleteRequest(sheet.id)}
                  disabled={deleting === sheet.id}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPendingDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-xl">
            <h3 className="text-base font-semibold mb-2">Delete this cheat sheet?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="cursor-pointer px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toast.message}
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
