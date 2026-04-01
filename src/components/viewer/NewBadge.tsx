"use client";

import { useState } from "react";

interface NewBadgeProps {
  isNew: boolean;
  addedDate: string | null;
}

export default function NewBadge({ isNew, addedDate }: NewBadgeProps) {
  const [now] = useState(() => Date.now());

  if (!isNew) return null;

  if (addedDate) {
    const daysSince =
      (now - new Date(addedDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 14) return null;
  }

  return (
    <span className="inline-block ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-500 text-white rounded">
      NEW
    </span>
  );
}
