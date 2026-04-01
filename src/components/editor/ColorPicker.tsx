"use client";

import { SECTION_COLORS, SECTION_COLOR_KEYS } from "@/lib/utils/colors";
import type { SectionColor } from "@/lib/types/database";
import { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  value: SectionColor;
  onChange: (color: SectionColor) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: SECTION_COLORS[value].header }}
        title="Change color"
      />
      {open && (
        <div className="absolute top-8 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 grid grid-cols-4 gap-1.5">
          {SECTION_COLOR_KEYS.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                value === color
                  ? "border-gray-800 dark:border-white scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: SECTION_COLORS[color].header }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
