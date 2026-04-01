import type {
  Item,
  ItemType,
  LayoutSettings,
  Section,
  SectionColor,
  ThemeSettings,
  Toggle,
  ToggleOption,
} from "@/lib/types/database";

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

const ITEM_TYPES: ItemType[] = ["pair", "subheader", "divider"];

type JsonObject = Record<string, unknown>;

export interface ParsedCreateSheetBody {
  title: string;
  sections?: Array<{
    title: string;
    color: SectionColor;
    items?: Array<{
      item_type: ItemType;
      key_text: string;
      value_text: string;
      is_new?: boolean;
    }>;
  }>;
  toggles?: Toggle[];
  layout?: LayoutSettings;
}

export interface ParsedUpdateSheetBody {
  title: string;
  description: string;
  is_public: boolean;
  layout: LayoutSettings;
  theme: ThemeSettings;
  toggles: Toggle[];
  sections: Section[];
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function asObject(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${label} must be an object`);
  }

  return value as JsonObject;
}

function asString(value: unknown, label: string, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value !== "string") {
    throw new ValidationError(`${label} must be a string`);
  }

  return value.trim();
}

function asBoolean(value: unknown, label: string, fallback = false): boolean {
  if (value == null) return fallback;
  if (typeof value !== "boolean") {
    throw new ValidationError(`${label} must be a boolean`);
  }

  return value;
}

function asNullableString(value: unknown, label: string): string | null {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new ValidationError(`${label} must be a string or null`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown, label: string, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`${label} must be a number`);
  }

  return value;
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${label} must be an array`);
  }

  return value;
}

function parseColor(value: unknown, label: string): SectionColor {
  const color = asString(value, label, "blue");
  if (!SECTION_COLORS.includes(color as SectionColor)) {
    throw new ValidationError(`${label} must be a valid section color`);
  }

  return color as SectionColor;
}

function parseItemType(value: unknown, label: string): ItemType {
  const itemType = asString(value, label, "pair");
  if (!ITEM_TYPES.includes(itemType as ItemType)) {
    throw new ValidationError(`${label} must be a valid item type`);
  }

  return itemType as ItemType;
}

function parseToggleOption(value: unknown, index: number): ToggleOption {
  const option = asObject(value, `toggles[?].options[${index}]`);

  return {
    key: asString(option.key, `toggles[?].options[${index}].key`),
    label: asString(option.label, `toggles[?].options[${index}].label`),
  };
}

function parseToggle(value: unknown, index: number): Toggle {
  const toggle = asObject(value, `toggles[${index}]`);
  const options = toggle.options == null
    ? []
    : asArray(toggle.options, `toggles[${index}].options`).map((option, optionIndex) =>
        parseToggleOption(option, optionIndex)
      );

  return {
    id: asString(toggle.id, `toggles[${index}].id`),
    label: asString(toggle.label, `toggles[${index}].label`),
    default: asString(toggle.default, `toggles[${index}].default`),
    options,
  };
}

function parseLayout(value: unknown): LayoutSettings {
  const layout = asObject(value, "layout");
  const columns = asNumber(layout.columns, "layout.columns", 4);

  if (![1, 2, 3, 4].includes(columns)) {
    throw new ValidationError("layout.columns must be 1, 2, 3, or 4");
  }

  return {
    columns: columns as LayoutSettings["columns"],
    font_body: asString(layout.font_body, "layout.font_body", "inter"),
    font_mono: asString(layout.font_mono, "layout.font_mono", "jetbrains-mono"),
  };
}

function parseTheme(value: unknown): ThemeSettings {
  const theme = asObject(value, "theme");

  return {
    background: asString(theme.background, "theme.background", "#ffffff"),
    text: asString(theme.text, "theme.text", "#1f2937"),
  };
}

function parseVariants(value: unknown): Item["variants"] {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("item.variants must be an object or null");
  }

  return value as Item["variants"];
}

function parseItem(value: unknown, sectionIndex: number, itemIndex: number): Item {
  const item = asObject(value, `sections[${sectionIndex}].items[${itemIndex}]`);

  return {
    id: asString(item.id, `sections[${sectionIndex}].items[${itemIndex}].id`),
    section_id: asString(
      item.section_id,
      `sections[${sectionIndex}].items[${itemIndex}].section_id`,
      ""
    ),
    item_type: parseItemType(
      item.item_type,
      `sections[${sectionIndex}].items[${itemIndex}].item_type`
    ),
    key_text: asString(item.key_text, `sections[${sectionIndex}].items[${itemIndex}].key_text`),
    value_text: asString(item.value_text, `sections[${sectionIndex}].items[${itemIndex}].value_text`),
    variants: parseVariants(item.variants),
    is_new: asBoolean(item.is_new, `sections[${sectionIndex}].items[${itemIndex}].is_new`, false),
    added_date: asNullableString(
      item.added_date,
      `sections[${sectionIndex}].items[${itemIndex}].added_date`
    ),
    position: asNumber(item.position, `sections[${sectionIndex}].items[${itemIndex}].position`, itemIndex),
  };
}

function parseSection(value: unknown, sectionIndex: number): Section {
  const section = asObject(value, `sections[${sectionIndex}]`);
  const items = section.items == null
    ? []
    : asArray(section.items, `sections[${sectionIndex}].items`).map((item, itemIndex) =>
        parseItem(item, sectionIndex, itemIndex)
      );

  return {
    id: asString(section.id, `sections[${sectionIndex}].id`),
    sheet_id: asString(section.sheet_id, `sections[${sectionIndex}].sheet_id`, ""),
    title: asString(section.title, `sections[${sectionIndex}].title`),
    color: parseColor(section.color, `sections[${sectionIndex}].color`),
    icon: asNullableString(section.icon, `sections[${sectionIndex}].icon`),
    position: asNumber(section.position, `sections[${sectionIndex}].position`, sectionIndex),
    column_hint: section.column_hint == null
      ? null
      : asNumber(section.column_hint, `sections[${sectionIndex}].column_hint`),
    items,
  };
}

export async function parseCreateSheetBody(request: Request): Promise<ParsedCreateSheetBody> {
  const body = asObject(await request.json(), "body");
  const title = asString(body.title, "title", "Untitled Cheat Sheet") || "Untitled Cheat Sheet";

  const sections = body.sections == null
    ? undefined
    : asArray(body.sections, "sections").map((value, sectionIndex) => {
        const section = asObject(value, `sections[${sectionIndex}]`);
        const items = section.items == null
          ? undefined
          : asArray(section.items, `sections[${sectionIndex}].items`).map((itemValue, itemIndex) => {
              const item = asObject(itemValue, `sections[${sectionIndex}].items[${itemIndex}]`);

              return {
                item_type: parseItemType(
                  item.item_type,
                  `sections[${sectionIndex}].items[${itemIndex}].item_type`
                ),
                key_text: asString(item.key_text, `sections[${sectionIndex}].items[${itemIndex}].key_text`),
                value_text: asString(item.value_text, `sections[${sectionIndex}].items[${itemIndex}].value_text`),
                is_new: asBoolean(
                  item.is_new,
                  `sections[${sectionIndex}].items[${itemIndex}].is_new`,
                  false
                ),
              };
            });

        return {
          title: asString(section.title, `sections[${sectionIndex}].title`),
          color: parseColor(section.color, `sections[${sectionIndex}].color`),
          items,
        };
      });

  return {
    title,
    sections,
    toggles: body.toggles == null
      ? undefined
      : asArray(body.toggles, "toggles").map((toggle, index) => parseToggle(toggle, index)),
    layout: body.layout == null ? undefined : parseLayout(body.layout),
  };
}

export async function parseUpdateSheetBody(request: Request): Promise<ParsedUpdateSheetBody> {
  const body = asObject(await request.json(), "body");

  return {
    title: asString(body.title, "title"),
    description: asString(body.description, "description", ""),
    is_public: asBoolean(body.is_public, "is_public", true),
    layout: parseLayout(body.layout),
    theme: parseTheme(body.theme),
    toggles: asArray(body.toggles ?? [], "toggles").map((toggle, index) => parseToggle(toggle, index)),
    sections: asArray(body.sections ?? [], "sections").map((section, index) => parseSection(section, index)),
  };
}
