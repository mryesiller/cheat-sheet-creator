"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import {
  Save,
  ExternalLink,
  Share2,
  Settings,
  Check,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";

interface ToolbarPanelProps {
  slug: string;
  onOpenSettings: () => void;
}

export default function ToolbarPanel({
  slug,
  onOpenSettings,
}: ToolbarPanelProps) {
  const { sheet, updateSheet, isDirty, isSaving, lastSaved, save, saveError } =
    useEditorStore();
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine
  );

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!sheet) return null;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sheet/${slug}`
      : "";

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusMessage = !isOnline
    ? "Offline — changes will not save"
    : saveError
      ? saveError
      : null;

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm px-4 py-3 flex items-center gap-4 no-print">
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shrink-0"
      >
        <LayoutDashboard size={14} />
        Dashboard
      </Link>
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />
      {/* Title */}
      <input
        type="text"
        value={sheet.title}
        onChange={(e) => updateSheet({ title: e.target.value })}
        className="text-lg font-bold bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-b-2 focus:border-blue-500 flex-1 min-w-0 placeholder-gray-400 dark:placeholder-gray-600"
        placeholder="Cheat sheet title..."
      />

      {/* Status */}
      <span
        className={`text-xs whitespace-nowrap ${
          statusMessage ? "text-red-500" : "text-gray-400"
        }`}
      >
        {statusMessage ? (
          statusMessage
        ) : isSaving ? (
          <span className="flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" /> Saving...
          </span>
        ) : lastSaved ? (
          <span className="flex items-center gap-1">
            <Check size={12} className="text-green-500" /> Saved
          </span>
        ) : isDirty ? (
          "Unsaved changes"
        ) : null}
      </span>

      {/* Actions */}
      <ThemeToggle />

      <button
        onClick={() => save()}
        disabled={!isDirty || isSaving || !isOnline}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <Save size={14} />
        Save
      </button>

      {saveError && isOnline && (
        <button
          onClick={() => save()}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          Retry
        </button>
      )}

      <a
        href={`/sheet/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <ExternalLink size={14} />
        Preview
      </a>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Share2 size={14} />
        {copied ? "Copied!" : "Share"}
      </button>

      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Settings size={14} />
      </button>
    </div>
  );
}
