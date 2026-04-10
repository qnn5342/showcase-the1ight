"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCohort } from "@/lib/actions/voting-session";
import { toast } from "sonner";

type Cohort = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#9ca3af",
  submitting: "#60a5fa",
  voting: "#34d399",
  closed: "#f87171",
};

export function CohortsTab({ cohorts }: { cohorts: Cohort[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim() || !slug.trim()) {
      toast.error("Vui lòng điền đầy đủ tên và slug.");
      return;
    }
    startTransition(async () => {
      const result = await createCohort(name.trim(), slug.trim());
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Tạo cohort thành công!");
        setName("");
        setSlug("");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: "#FDF5DA" }}
        >
          Tạo Cohort Mới
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label style={{ color: "#F0F0F0" }}>Tên Cohort</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Batch 3"
              className="mt-1"
              style={{
                backgroundColor: "#15333B",
                borderColor: "#3E5E63",
                color: "#F0F0F0",
              }}
            />
          </div>
          <div>
            <Label style={{ color: "#F0F0F0" }}>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="batch-3"
              className="mt-1"
              style={{
                backgroundColor: "#15333B",
                borderColor: "#3E5E63",
                color: "#F0F0F0",
              }}
            />
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isPending}
          className="mt-4"
          style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
        >
          {isPending ? "Đang tạo..." : "Tạo Cohort"}
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold" style={{ color: "#FDF5DA" }}>
          Danh Sách Cohort
        </h2>
        {cohorts.length === 0 && (
          <p style={{ color: "#9ca3af" }}>Chưa có cohort nào.</p>
        )}
        {cohorts.map((cohort) => (
          <div
            key={cohort.id}
            className="flex items-center justify-between rounded-lg border p-3"
            style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
          >
            <div>
              <span
                className="font-medium"
                style={{ color: "#FDF5DA" }}
              >
                {cohort.name}
              </span>
              <span
                className="ml-2 text-sm"
                style={{ color: "#9ca3af" }}
              >
                /{cohort.slug}
              </span>
            </div>
            <Badge
              style={{
                backgroundColor: STATUS_COLORS[cohort.status] ?? "#9ca3af",
                color: "#15333B",
              }}
            >
              {cohort.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
