"use client";

import { GripVertical } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

interface DragHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

export default function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <button
      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
      {...listeners}
      {...attributes}
    >
      <GripVertical size={16} />
    </button>
  );
}
