"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateMyCohort } from "@/lib/actions/profile";

type Cohort = {
  id: string;
  name: string;
  slug: string;
  class_code: string | null;
};

export function CohortPickerBanner({ cohorts }: { cohorts: Cohort[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!value) return;
    startTransition(async () => {
      const result = await updateMyCohort(value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã cập nhật batch.");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border border-[#FFD94C]/40 bg-[#FFD94C]/10 p-4">
      <p className="text-sm font-medium text-[#FFD94C]">
        Bạn chưa chọn Batch
      </p>
      <p className="text-xs text-[#F0F0F0]/70 mt-1 mb-3">
        Chọn khoá — lớp bạn đang tham gia để team Showcase quản lý dễ hơn.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isPending}
          className="flex-1 h-10 px-3 rounded-md bg-[#15333B] border border-[#3E5E63] text-[#F0F0F0] focus:ring-2 focus:ring-[#FFD94C]/50 focus:outline-none disabled:opacity-50"
        >
          <option value="">Chọn batch...</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.class_code ? `${c.class_code} — ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!value || isPending}
          onClick={handleSave}
          className="h-10 px-4 rounded-md bg-[#FFD94C] text-[#15333B] text-sm font-semibold hover:bg-[#FFD94C]/90 disabled:opacity-50"
        >
          {isPending ? "Đang lưu..." : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}
