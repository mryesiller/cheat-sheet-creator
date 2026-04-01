"use client";

import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SECTION_COLORS } from "@/lib/utils/colors";
import { useEditorStore } from "@/lib/store/editor-store";
import ColorPicker from "./ColorPicker";
import DragHandle from "./DragHandle";
import ItemEditor from "./ItemEditor";
import type { Section, ItemType } from "@/lib/types/database";

interface SectionEditorProps {
  section: Section;
}

export default function SectionEditor({ section }: SectionEditorProps) {
  const { updateSection, removeSection, addItem, updateItem, removeItem } =
    useEditorStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: {
      type: "section",
      sectionId: section.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colors = SECTION_COLORS[section.color];
  const items = section.items || [];

  function handleAddItem(type: ItemType) {
    addItem(section.id, type);
    setShowAddMenu(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 dark:border-gray-700"
      data-color={section.color}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-lg"
        style={{ backgroundColor: colors.header }}
      >
        <DragHandle listeners={listeners} attributes={attributes} />
        <input
          type="text"
          value={section.title}
          onChange={(e) =>
            updateSection(section.id, { title: e.target.value })
          }
          className="flex-1 bg-transparent text-white text-sm font-semibold uppercase tracking-wider placeholder-white/60 focus:outline-none"
          placeholder="Section title..."
        />
        <ColorPicker
          value={section.color}
          onChange={(color) => updateSection(section.id, { color })}
        />
        <button
          onClick={() => removeSection(section.id)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Items */}
      <div className="p-3 space-y-1 bg-white dark:bg-gray-800 rounded-b-lg">
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <ItemEditor
              key={item.id}
              item={item}
              sectionId={section.id}
              onUpdate={(updates) => updateItem(section.id, item.id, updates)}
              onRemove={() => removeItem(section.id, item.id)}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
            No items yet. Add one below.
          </p>
        )}

        {/* Add item button */}
        <div className="relative pt-1">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Plus size={14} />
            Add item
            <ChevronDown size={12} />
          </button>
          {showAddMenu && (
            <div className="absolute left-0 top-full mt-1 z-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 min-w-[140px]">
              <button
                onClick={() => handleAddItem("pair")}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Key → Value
              </button>
              <button
                onClick={() => handleAddItem("subheader")}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Subheader
              </button>
              <button
                onClick={() => handleAddItem("divider")}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Divider
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
