"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toggleStudentVoteAccess } from "@/lib/actions/voting-session";
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
    cohortNameMap[c.slug] = c.name;
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
              <StudentRow key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentRow({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();

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

  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3"
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
      <div className="flex items-center gap-2">
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
