"use client";

import type { Toggle } from "@/lib/types/database";

interface ToggleSwitcherProps {
  toggles: Toggle[];
  values: Record<string, string>;
  onChange: (toggleId: string, value: string) => void;
}

export default function ToggleSwitcher({
  toggles,
  values,
  onChange,
}: ToggleSwitcherProps) {
  if (toggles.length === 0) return null;

  return (
    <div className="flex items-center gap-4 no-print">
      {toggles.map((toggle) => (
        <div key={toggle.id} className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">{toggle.label}:</span>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {toggle.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onChange(toggle.id, opt.key)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  values[toggle.id] === opt.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
