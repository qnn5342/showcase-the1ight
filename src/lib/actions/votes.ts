"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type VoteCategory = "most_loved" | "most_creative" | "best_execution";

export async function upsertVote(projectId: string, category: VoteCategory) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập để vote." };

  // Check can_vote
  const { data: profile } = await supabase
    .from("profiles")
    .select("can_vote")
    .eq("id", user.id)
    .single();

  if (!profile?.can_vote) return { error: "Bạn chưa được phép vote." };

  // Get project + cohort_id + owner_id
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, cohort_id, title")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Không tìm thấy dự án." };

  // No self-vote
  if (project.owner_id === user.id) {
    return { error: "Không thể vote cho dự án của mình." };
  }

  const cohortId = project.cohort_id;

  // Check voting session is open
  const { data: session } = await supabase
    .from("voting_sessions")
    .select("status")
    .eq("cohort_id", cohortId)
    .single();

  if (!session || session.status !== "open") {
    return { error: "Phiên vote chưa mở hoặc đã kết thúc." };
  }

  // Check existing vote for (voter_id, category, cohort_id)
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id, project_id")
    .eq("voter_id", user.id)
    .eq("category", category)
    .eq("cohort_id", cohortId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.project_id === projectId) {
      // Toggle off — delete
      await supabase.from("votes").delete().eq("id", existingVote.id);
      revalidatePath(`/projects/${projectId}`);
      return { success: true, toggled: "off" };
    } else {
      // Swap: get old project title then upsert
      const { data: oldProject } = await supabase
        .from("projects")
        .select("title")
        .eq("id", existingVote.project_id)
        .single();

      await supabase
        .from("votes")
        .update({ project_id: projectId, updated_at: new Date().toISOString() })
        .eq("id", existingVote.id);

      revalidatePath(`/projects/${projectId}`);
      return {
        success: true,
        toggled: "swapped",
        swappedFrom: { title: oldProject?.title ?? "dự án trước" },
      };
    }
  }

  // Insert new vote
  const { error } = await supabase.from("votes").insert({
    voter_id: user.id,
    project_id: projectId,
    category,
    cohort_id: cohortId,
  });

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true, toggled: "on" };
}

export async function getUserVotes(cohortId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: votes } = await supabase
    .from("votes")
    .select("project_id, category")
    .eq("voter_id", user.id)
    .eq("cohort_id", cohortId);

  return votes ?? [];
}
