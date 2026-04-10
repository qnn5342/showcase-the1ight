"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRESET_TAGS } from "@/lib/validations/project";

export function GalleryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTag = searchParams.get("tag") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleTag = (tag: string) => {
    updateParam("tag", activeTag === tag ? "" : tag);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-sm font-medium border transition-colors duration-150 ${
                isActive
                  ? "bg-[#FFD94C] text-[#15333B] border-[#FFD94C]"
                  : "bg-transparent text-[#F0F0F0]/70 border-[#3E5E63] hover:border-[#FFD94C]/60 hover:text-[#FDF5DA]"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <div className="ml-auto">
        <Select
          value={activeSort}
          onValueChange={(val) => updateParam("sort", val ?? "newest")}
        >
          <SelectTrigger className="w-36 border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] text-sm focus:ring-[#FFD94C]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#214C54] border-[#3E5E63] text-[#F0F0F0]">
            <SelectItem value="newest" className="focus:bg-[#3E5E63]">
              Mới nhất
            </SelectItem>
            <SelectItem value="oldest" className="focus:bg-[#3E5E63]">
              Cũ nhất
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
