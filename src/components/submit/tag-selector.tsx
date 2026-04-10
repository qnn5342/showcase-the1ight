"use client";

import { PRESET_TAGS } from "@/lib/validations/project";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else if (value.length < 3) {
      onChange([...value, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_TAGS.map((tag) => {
        const selected = value.includes(tag);
        const maxReached = value.length >= 3 && !selected;
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            disabled={maxReached}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected
                ? "bg-[#FFD94C] text-[#15333B] border-[#FFD94C]"
                : maxReached
                ? "border-[#3E5E63] text-[#F0F0F0]/30 cursor-not-allowed"
                : "border-[#3E5E63] text-[#F0F0F0]/70 hover:border-[#4E8770] hover:text-[#F0F0F0]"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
