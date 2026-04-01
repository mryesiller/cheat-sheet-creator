"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import { X, Plus, Trash2 } from "lucide-react";
import type { LayoutSettings, Toggle } from "@/lib/types/database";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { sheet, updateSheet } = useEditorStore();

  if (!open || !sheet) return null;

  const layout = sheet.layout;
  const toggles = sheet.toggles || [];

  function updateLayout(updates: Partial<LayoutSettings>) {
    updateSheet({ layout: { ...layout, ...updates } });
  }

  function addToggle() {
    const newToggle: Toggle = {
      id: `toggle-${Date.now()}`,
      label: "New Toggle",
      options: [
        { key: "option1", label: "Option 1" },
        { key: "option2", label: "Option 2" },
      ],
      default: "option1",
    };
    updateSheet({ toggles: [...toggles, newToggle] });
  }

  function updateToggle(index: number, updates: Partial<Toggle>) {
    const newToggles = [...toggles];
    newToggles[index] = { ...newToggles[index], ...updates };
    updateSheet({ toggles: newToggles });
  }

  function removeToggle(index: number) {
    updateSheet({ toggles: toggles.filter((_, i) => i !== index) });
  }

  const inputCls = "w-full text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500";
  const smallInputCls = "text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" onClick={onClose} />
      <div className="relative w-80 bg-white dark:bg-gray-900 shadow-xl h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Layout */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Layout</h3>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Columns</label>
            <div className="flex gap-2">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => updateLayout({ columns: n })}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    layout.columns === n
                      ? "bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibility</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sheet.is_public}
                onChange={(e) => updateSheet({ is_public: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Public (shareable via link)</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
            <textarea
              value={sheet.description}
              onChange={(e) => updateSheet({ description: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder="A brief description of this cheat sheet..."
            />
          </div>

          {/* Toggles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Toggles</h3>
              <button
                onClick={addToggle}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
              Toggles let viewers switch between variants (e.g. Mac/Windows).
            </p>
            {toggles.map((toggle, i) => (
              <div
                key={toggle.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={toggle.label}
                    onChange={(e) => updateToggle(i, { label: e.target.value })}
                    className={`flex-1 ${smallInputCls}`}
                    placeholder="Toggle label"
                  />
                  <button onClick={() => removeToggle(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                {toggle.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2 ml-2">
                    <input
                      type="text"
                      value={opt.key}
                      onChange={(e) => {
                        const newOptions = [...toggle.options];
                        newOptions[j] = { ...opt, key: e.target.value };
                        updateToggle(i, { options: newOptions });
                      }}
                      className={`w-20 text-xs ${smallInputCls}`}
                      placeholder="key"
                    />
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOptions = [...toggle.options];
                        newOptions[j] = { ...opt, label: e.target.value };
                        updateToggle(i, { options: newOptions });
                      }}
                      className={`flex-1 text-xs ${smallInputCls}`}
                      placeholder="Label"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
