export type SectionColor =
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "orange"
  | "red"
  | "cyan"
  | "gray";

export interface LayoutSettings {
  columns: 1 | 2 | 3 | 4;
  font_body: string;
  font_mono: string;
}

export interface ThemeSettings {
  background: string;
  text: string;
}

export interface ToggleOption {
  key: string;
  label: string;
}

export interface Toggle {
  id: string;
  label: string;
  options: ToggleOption[];
  default: string;
}

export interface CheatSheet {
  id: string;
  user_id: string;
  title: string;
  description: string;
  slug: string;
  is_public: boolean;
  layout: LayoutSettings;
  theme: ThemeSettings;
  toggles: Toggle[];
  created_at: string;
  updated_at: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  sheet_id: string;
  title: string;
  color: SectionColor;
  icon: string | null;
  position: number;
  column_hint: number | null;
  items?: Item[];
}

export type ItemType = "pair" | "subheader" | "divider";

export interface Item {
  id: string;
  section_id: string;
  item_type: ItemType;
  key_text: string;
  value_text: string;
  variants: Record<
    string,
    Record<string, Partial<Pick<Item, "key_text" | "value_text">>>
  > | null;
  is_new: boolean;
  added_date: string | null;
  position: number;
}
