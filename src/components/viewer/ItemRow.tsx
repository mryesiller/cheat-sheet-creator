import type { Item } from "@/lib/types/database";
import NewBadge from "./NewBadge";

interface ItemRowProps {
  item: Item;
  activeToggleValues: Record<string, string>;
  isDark?: boolean;
}

export default function ItemRow({ item, activeToggleValues, isDark = false }: ItemRowProps) {
  // Apply variant overrides
  let keyText = item.key_text;
  let valueText = item.value_text;

  if (item.variants) {
    for (const [toggleId, options] of Object.entries(item.variants)) {
      const activeValue = activeToggleValues[toggleId];
      if (activeValue && options[activeValue]) {
        if (options[activeValue].key_text !== undefined) {
          keyText = options[activeValue].key_text!;
        }
        if (options[activeValue].value_text !== undefined) {
          valueText = options[activeValue].value_text!;
        }
      }
    }
  }

  if (item.item_type === "divider") {
    return (
      <hr
        className={`item-row my-1.5 ${isDark ? "border-gray-600" : "border-gray-200"}`}
      />
    );
  }

  if (item.item_type === "subheader") {
    return (
      <div
        className={`item-row mt-2 mb-1 text-xs font-semibold italic pb-0.5 border-b border-dashed ${
          isDark
            ? "text-gray-300 border-gray-600"
            : "text-gray-600 border-gray-300"
        }`}
      >
        {keyText}
      </div>
    );
  }

  // pair — render key_text as code/kbd only if it looks like a shortcut or command
  const looksLikeShortcut = /[⌘⌥⌃⇧⌫↑↓←→]/.test(keyText) ||
    /^(F\d+|Escape|Enter|Tab|Shift|Ctrl|Alt|Win)(\s*\+\s*.+)?$/.test(keyText);

  return (
    <div className="item-row flex items-baseline gap-2 py-0.5 text-xs">
      <span
        className={`font-mono whitespace-nowrap flex-shrink-0 ${isDark ? "text-gray-200" : "text-gray-800"}`}
      >
        {looksLikeShortcut ? (
          keyText.split("+").map((part, i, arr) => (
            <span key={i}>
              <kbd>{part.trim()}</kbd>
              {i < arr.length - 1 && (
                <span className={`mx-0.5 ${isDark ? "text-gray-400" : "text-gray-400"}`}>+</span>
              )}
            </span>
          ))
        ) : (
          <code className={`text-[0.7rem] px-1 py-0.5 rounded ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"}`}>
            {keyText}
          </code>
        )}
      </span>
      <span className={`flex-1 leading-snug ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {valueText}
        <NewBadge isNew={item.is_new} addedDate={item.added_date} />
      </span>
    </div>
  );
}
