"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { CheatSheet, Section } from "@/lib/types/database";
import SectionCard from "./SectionCard";
import ToggleSwitcher from "./ToggleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface SheetViewerProps {
  sheet: CheatSheet;
  sections: Section[];
  editorId?: string;
}

export default function SheetViewer({ sheet, sections, editorId }: SheetViewerProps) {
  const toggles = useMemo(() => sheet.toggles || [], [sheet.toggles]);

  const [toggleValues, setToggleValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};

    toggles.forEach((toggle) => {
      const key = `sheet-${sheet.slug}-${toggle.id}`;
      const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;

      if (saved) {
        initial[toggle.id] = saved;
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        (toggle.id === "os" || toggle.label.toLowerCase().includes("os"))
      ) {
        const isMac = navigator.userAgent.toLowerCase().includes("mac");
        initial[toggle.id] = isMac ? "mac" : "windows";
        return;
      }

      initial[toggle.id] = toggle.default;
    });

    return initial;
  });

  function handleToggleChange(toggleId: string, value: string) {
    setToggleValues((prev) => ({ ...prev, [toggleId]: value }));
    localStorage.setItem(`sheet-${sheet.slug}-${toggleId}`, value);
  }

  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const columns = sheet.layout?.columns ?? 4;
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Owner edit bar */}
      {editorId && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg no-print">
          <span className="text-xs text-amber-700 dark:text-amber-300">You&apos;re viewing your cheat sheet</span>
          <Link
            href={`/editor/${editorId}`}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
          >
            <Pencil size={12} />
            Back to Editor
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold">{sheet.title}</h1>
          {sheet.description && (
            <p className="text-sm text-gray-500 mt-1">{sheet.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitcher
            toggles={toggles}
            values={toggleValues}
            onChange={handleToggleChange}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-lg font-bold">{sheet.title}</h1>
      </div>

      {/* Grid */}
      <div className={`grid ${gridCols} gap-4`}>
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            activeToggleValues={toggleValues}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}
