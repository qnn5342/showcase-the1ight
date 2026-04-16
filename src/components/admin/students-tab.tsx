"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toggleStudentVoteAccess } from "@/lib/actions/voting-session";
import { adminUpdateStudentCohort } from "@/lib/actions/profile";
import { toast } from "sonner";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  cohort_slug: string | null;
  can_vote: boolean;
  role: string;
};

type Cohort = {
  id: string;
  name: string;
  slug: string;
  status: string;
  class_code: string | null;
};

export function StudentsTab({
  profiles,
  cohorts,
}: {
  profiles: Profile[];
  cohorts: Cohort[];
}) {
  // Group by cohort_slug
  const grouped: Record<string, Profile[]> = {};
  for (const profile of profiles) {
    const key = profile.cohort_slug ?? "no-cohort";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(profile);
  }

  const cohortNameMap: Record<string, string> = {};
  for (const c of cohorts) {
    cohortNameMap[c.slug] = c.class_code ? `${c.class_code} — ${c.name}` : c.name;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold" style={{ color: "#FDF5DA" }}>
        Học Viên ({profiles.length})
      </h2>
      {Object.entries(grouped).map(([slug, members]) => (
        <div key={slug}>
          <h3
            className="mb-2 text-sm font-semibold uppercase tracking-wide"
            style={{ color: "#FFD94C" }}
          >
            {cohortNameMap[slug] ?? slug}
          </h3>
          <div className="space-y-2">
            {members.map((profile) => (
              <StudentRow key={profile.id} profile={profile} cohorts={cohorts} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentRow({ profile, cohorts }: { profile: Profile; cohorts: Cohort[] }) {
  const [isPending, startTransition] = useTransition();
  const [isCohortPending, startCohortTransition] = useTransition();

  function handleToggle(value: boolean) {
    startTransition(async () => {
      const result = await toggleStudentVoteAccess(profile.id, value);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(
          value ? "Đã bật quyền vote." : "Đã tắt quyền vote."
        );
      }
    });
  }

  function handleCohortChange(newSlug: string) {
    startCohortTransition(async () => {
      const result = await adminUpdateStudentCohort(profile.id, newSlug || null);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success("Đã cập nhật cohort.");
      }
    });
  }

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3"
      style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
    >
      <div className="flex items-center gap-3">
        <div>
          <span className="text-sm font-medium" style={{ color: "#FDF5DA" }}>
            {profile.display_name ?? "Chưa đặt tên"}
          </span>
          {profile.role === "admin" && (
            <Badge
              className="ml-2"
              style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
            >
              admin
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={profile.cohort_slug ?? ""}
          onChange={(e) => handleCohortChange(e.target.value)}
          disabled={isCohortPending}
          className="h-8 px-2 text-xs rounded-md bg-[#15333B] border border-[#3E5E63] text-[#F0F0F0] focus:ring-2 focus:ring-[#FFD94C]/50 focus:outline-none disabled:opacity-50"
        >
          <option value="">— chưa gán —</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.class_code ? `${c.class_code} — ${c.name}` : c.name}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: "#9ca3af" }}>
          {profile.can_vote ? "Có thể vote" : "Chưa vote"}
        </span>
        <Switch
          checked={profile.can_vote}
          onCheckedChange={handleToggle}
          disabled={isPending}
        />
      </div>
    </div>
  );
}
