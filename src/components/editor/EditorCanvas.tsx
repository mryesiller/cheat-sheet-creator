"use client";

import { useEffect, useCallback, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/store/editor-store";
import SectionEditor from "./SectionEditor";
import ToolbarPanel from "./ToolbarPanel";
import SettingsPanel from "./SettingsPanel";
import type { CheatSheet, Section } from "@/lib/types/database";

interface EditorCanvasProps {
  initialSheet: CheatSheet;
  initialSections: Section[];
}

export default function EditorCanvas({
  initialSheet,
  initialSections,
}: EditorCanvasProps) {
  const {
    initSheet,
    sections,
    addSection,
    reorderSections,
    reorderItems,
    isDirty,
    save,
  } = useEditorStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initSheet(initialSheet, initialSections);
  }, [initialSheet, initialSections, initSheet]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDirty, save]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "section" && overType === "section") {
        reorderSections(active.id as string, over.id as string);
        return;
      }

      if (activeType === "item" && overType === "item") {
        const activeSectionId = active.data.current?.sectionId as string | undefined;
        const overSectionId = over.data.current?.sectionId as string | undefined;
        if (!activeSectionId || activeSectionId !== overSectionId) return;
        reorderItems(activeSectionId, active.id as string, over.id as string);
      }
    },
    [reorderItems, reorderSections]
  );

  const columns = useEditorStore((s) => s.sheet?.layout.columns ?? 4);

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <ToolbarPanel
        slug={initialSheet.slug}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="max-w-[1400px] mx-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={rectSortingStrategy}
          >
            <div className={`grid ${gridCols} gap-4`}>
              {sections.map((section) => (
                <SectionEditor key={section.id} section={section} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add section button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
