import type { SectionColor } from "@/lib/types/database";

export interface ColorScheme {
  bg: string;
  header: string;
  border: string;
  headerText: string;
  bgDark: string;
  borderDark: string;
}

export const SECTION_COLORS: Record<SectionColor, ColorScheme> = {
  blue: {
    bg: "#eff6ff",
    header: "#3b82f6",
    border: "#bfdbfe",
    headerText: "#ffffff",
    bgDark: "#1e2a3d",
    borderDark: "#2d4a6e",
  },
  purple: {
    bg: "#f5f3ff",
    header: "#8b5cf6",
    border: "#ddd6fe",
    headerText: "#ffffff",
    bgDark: "#221a35",
    borderDark: "#3d2a5e",
  },
  green: {
    bg: "#f0fdf4",
    header: "#22c55e",
    border: "#bbf7d0",
    headerText: "#ffffff",
    bgDark: "#162616",
    borderDark: "#1e3d1e",
  },
  amber: {
    bg: "#fffbeb",
    header: "#f59e0b",
    border: "#fde68a",
    headerText: "#ffffff",
    bgDark: "#2a2009",
    borderDark: "#3d3010",
  },
  orange: {
    bg: "#fff7ed",
    header: "#f97316",
    border: "#fed7aa",
    headerText: "#ffffff",
    bgDark: "#2a1a09",
    borderDark: "#3d2812",
  },
  red: {
    bg: "#fef2f2",
    header: "#ef4444",
    border: "#fecaca",
    headerText: "#ffffff",
    bgDark: "#2a1212",
    borderDark: "#3d1818",
  },
  cyan: {
    bg: "#ecfeff",
    header: "#06b6d4",
    border: "#a5f3fc",
    headerText: "#ffffff",
    bgDark: "#0d2529",
    borderDark: "#123540",
  },
  gray: {
    bg: "#f9fafb",
    header: "#6b7280",
    border: "#e5e7eb",
    headerText: "#ffffff",
    bgDark: "#1e2028",
    borderDark: "#2d3040",
  },
};

export const SECTION_COLOR_KEYS: SectionColor[] = Object.keys(
  SECTION_COLORS
) as SectionColor[];
