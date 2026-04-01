import { create } from "zustand";
import type {
  CheatSheet,
  Section,
  Item,
  SectionColor,
  ItemType,
} from "@/lib/types/database";

interface EditorState {
  sheet: CheatSheet | null;
  sections: Section[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  activeToggleValues: Record<string, string>;

  // Initialize
  initSheet: (sheet: CheatSheet, sections: Section[]) => void;

  // Sheet actions
  updateSheet: (updates: Partial<CheatSheet>) => void;

  // Section actions
  addSection: () => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;

  // Item actions
  addItem: (sectionId: string, type?: ItemType) => void;
  updateItem: (sectionId: string, itemId: string, updates: Partial<Item>) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reorderItems: (sectionId: string, activeId: string, overId: string) => void;

  // Toggle
  setToggleValue: (toggleId: string, value: string) => void;

  // Save
  save: () => Promise<void>;
  markClean: () => void;
}

const SECTION_COLORS: SectionColor[] = [
  "blue",
  "purple",
  "green",
  "amber",
  "orange",
  "red",
  "cyan",
  "gray",
];

function generateId(): string {
  return crypto.randomUUID();
}

export const useEditorStore = create<EditorState>((set, get) => ({
  sheet: null,
  sections: [],
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  activeToggleValues: {},

  initSheet: (sheet, sections) => {
    const toggleValues: Record<string, string> = {};
    sheet.toggles?.forEach((t) => {
      toggleValues[t.id] = t.default;
    });
    set({
      sheet,
      sections: sections.sort((a, b) => a.position - b.position),
      isDirty: false,
      saveError: null,
      activeToggleValues: toggleValues,
    });
  },

  updateSheet: (updates) => {
    set((state) => ({
      sheet: state.sheet ? { ...state.sheet, ...updates } : null,
      isDirty: true,
      saveError: null,
    }));
  },

  addSection: () => {
    const { sections } = get();
    const colorIndex = sections.length % SECTION_COLORS.length;
    const newSection: Section = {
      id: generateId(),
      sheet_id: get().sheet?.id || "",
      title: "New Section",
      color: SECTION_COLORS[colorIndex],
      icon: null,
      position: sections.length,
      column_hint: null,
      items: [],
    };
    set((state) => ({
      sections: [...state.sections, newSection],
      isDirty: true,
      saveError: null,
    }));
  },

  updateSection: (id, updates) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      isDirty: true,
      saveError: null,
    }));
  },

  removeSection: (id) => {
    set((state) => ({
      sections: state.sections
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, position: i })),
      isDirty: true,
      saveError: null,
    }));
  },

  reorderSections: (activeId, overId) => {
    set((state) => {
      const oldIndex = state.sections.findIndex((s) => s.id === activeId);
      const newIndex = state.sections.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return state;

      const newSections = [...state.sections];
      const [moved] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, moved);

      return {
        sections: newSections.map((s, i) => ({ ...s, position: i })),
        isDirty: true,
        saveError: null,
      };
    });
  },

  addItem: (sectionId, type = "pair") => {
    const newItem: Item = {
      id: generateId(),
      section_id: sectionId,
      item_type: type,
      key_text: "",
      value_text: "",
      variants: null,
      is_new: false,
      added_date: new Date().toISOString().split("T")[0],
      position: 0,
    };

    set((state) => ({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = s.items || [];
        newItem.position = items.length;
        return { ...s, items: [...items, newItem] };
      }),
      isDirty: true,
      saveError: null,
    }));
  },

  updateItem: (sectionId, itemId, updates) => {
    set((state) => ({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: (s.items || []).map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        };
      }),
      isDirty: true,
      saveError: null,
    }));
  },

  removeItem: (sectionId, itemId) => {
    set((state) => ({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: (s.items || [])
            .filter((item) => item.id !== itemId)
            .map((item, i) => ({ ...item, position: i })),
        };
      }),
      isDirty: true,
      saveError: null,
    }));
  },

  reorderItems: (sectionId, activeId, overId) => {
    set((state) => ({
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...(s.items || [])];
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        if (oldIndex === -1 || newIndex === -1) return s;

        const [moved] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, moved);

        return {
          ...s,
          items: items.map((item, i) => ({ ...item, position: i })),
        };
      }),
      isDirty: true,
      saveError: null,
    }));
  },

  setToggleValue: (toggleId, value) => {
    set((state) => ({
      activeToggleValues: { ...state.activeToggleValues, [toggleId]: value },
      saveError: null,
    }));
  },

  save: async () => {
    const { sheet, sections, isSaving } = get();
    if (!sheet || isSaving) return;

    set({ isSaving: true, saveError: null });

    try {
      const response = await fetch(`/api/sheets/${sheet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sheet.title,
          description: sheet.description,
          is_public: sheet.is_public,
          layout: sheet.layout,
          theme: sheet.theme,
          toggles: sheet.toggles,
          sections: sections.map((s) => ({
            id: s.id,
            title: s.title,
            color: s.color,
            icon: s.icon,
            position: s.position,
            column_hint: s.column_hint,
            items: (s.items || []).map((item) => ({
              id: item.id,
              item_type: item.item_type,
              key_text: item.key_text,
              value_text: item.value_text,
              variants: item.variants,
              is_new: item.is_new,
              added_date: item.added_date,
              position: item.position,
            })),
          })),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Failed to save");
      }

      set({
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
        saveError: null,
      });
    } catch (error) {
      console.error("Save failed:", error);
      set({
        isSaving: false,
        saveError:
          error instanceof Error ? error.message : "Failed to save changes",
      });
    }
  },

  markClean: () => set({ isDirty: false }),
}));
