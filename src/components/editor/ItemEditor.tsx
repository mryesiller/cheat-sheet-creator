"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import DragHandle from "./DragHandle";
import type { Item } from "@/lib/types/database";

interface ItemEditorProps {
  item: Item;
  sectionId: string;
  onUpdate: (updates: Partial<Item>) => void;
  onRemove: () => void;
}

export default function ItemEditor({
  item,
  sectionId,
  onUpdate,
  onRemove,
}: ItemEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "item",
      sectionId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const removeBtn = (
    <button
      onClick={onRemove}
      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity"
    >
      <Trash2 size={14} />
    </button>
  );

  if (item.item_type === "divider") {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1 group">
        <DragHandle listeners={listeners} attributes={attributes} />
        <hr className="flex-1 border-gray-300 dark:border-gray-600" />
        {removeBtn}
      </div>
    );
  }

  if (item.item_type === "subheader") {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1 group">
        <DragHandle listeners={listeners} attributes={attributes} />
        <input
          type="text"
          value={item.key_text}
          onChange={(e) => onUpdate({ key_text: e.target.value })}
          placeholder="Subheader title..."
          className="flex-1 text-sm font-semibold italic text-gray-700 dark:text-gray-200 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none py-0.5 placeholder-gray-400 dark:placeholder-gray-500"
        />
        {removeBtn}
      </div>
    );
  }

  // Default: pair
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 py-1 group">
      <DragHandle listeners={listeners} attributes={attributes} />
      <input
        type="text"
        value={item.key_text}
        onChange={(e) => onUpdate({ key_text: e.target.value })}
        placeholder="Key / shortcut..."
        className="w-2/5 text-sm font-mono text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
      />
      <input
        type="text"
        value={item.value_text}
        onChange={(e) => onUpdate({ value_text: e.target.value })}
        placeholder="Description..."
        className="flex-1 text-sm text-gray-800 dark:text-gray-100 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
      />
      {removeBtn}
    </div>
  );
}
