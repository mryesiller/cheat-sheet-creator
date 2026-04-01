import { SECTION_COLORS } from "@/lib/utils/colors";
import type { Section } from "@/lib/types/database";
import ItemRow from "./ItemRow";

interface SectionCardProps {
  section: Section;
  activeToggleValues: Record<string, string>;
  isDark?: boolean;
}

export default function SectionCard({
  section,
  activeToggleValues,
  isDark = false,
}: SectionCardProps) {
  const colors = SECTION_COLORS[section.color] || SECTION_COLORS.blue;
  const items = section.items || [];

  return (
    <div
      className="section-card rounded-lg border overflow-hidden"
      style={{ borderColor: isDark ? colors.borderDark : colors.border }}
    >
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: colors.header,
          color: colors.headerText,
        }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider">
          {section.title}
        </h3>
      </div>
      <div className="px-3 py-2" style={{ backgroundColor: isDark ? colors.bgDark : colors.bg }}>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            activeToggleValues={activeToggleValues}
            isDark={isDark}
          />
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 italic">No items</p>
        )}
      </div>
    </div>
  );
}
