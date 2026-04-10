"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type VotingSessionStatus = "pending" | "open" | "closed" | "revealed";

const STATUS_ORDER: VotingSessionStatus[] = [
  "pending",
  "open",
  "closed",
  "revealed",
];

async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Không có quyền thực hiện thao tác này." };
  }

  return { user, supabase };
}

export async function advanceVotingSession(cohortId: string) {
  const result = await getAdminUser();
  if ("error" in result) return result;
  const { supabase } = result;

  // Get existing session
  const { data: session } = await supabase
    .from("voting_sessions")
    .select("id, status")
    .eq("cohort_id", cohortId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (!session) {
    // Create new session in "pending" state, then advance to "open"
    const { data: newSession, error: createError } = await supabase
      .from("voting_sessions")
      .insert({ cohort_id: cohortId, status: "pending" })
      .select("id")
      .single();

    if (createError || !newSession) {
      return { error: "Không thể tạo phiên vote." };
    }

    // Advance pending → open
    const { error: updateError } = await supabase
      .from("voting_sessions")
      .update({ status: "open", opened_at: now })
      .eq("id", newSession.id);

    if (updateError) return { error: "Không thể mở phiên vote." };

    revalidatePath("/admin");
    return { success: true, status: "open" as VotingSessionStatus };
  }

  const currentIndex = STATUS_ORDER.indexOf(
    session.status as VotingSessionStatus
  );
  if (currentIndex === -1 || currentIndex === STATUS_ORDER.length - 1) {
    return { error: "Phiên vote đã ở trạng thái cuối cùng." };
  }

  const nextStatus = STATUS_ORDER[currentIndex + 1];

  const updates: Record<string, string> = { status: nextStatus };
  if (nextStatus === "open") updates.opened_at = now;
  if (nextStatus === "closed") updates.closed_at = now;
  if (nextStatus === "revealed") updates.revealed_at = now;

  const { error } = await supabase
    .from("voting_sessions")
    .update(updates)
    .eq("id", session.id);

  if (error) return { error: "Không thể cập nhật trạng thái phiên vote." };

  revalidatePath("/admin");
  return { success: true, status: nextStatus };
}

export async function upsertJuryPick(
  cohortId: string,
  projectId: string,
  note: string
) {
  const result = await getAdminUser();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("jury_picks")
    .upsert(
      { cohort_id: cohortId, project_id: projectId, note },
      { onConflict: "cohort_id" }
    );

  if (error) return { error: "Không thể lưu jury pick." };

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleStudentVoteAccess(
  profileId: string,
  canVote: boolean
) {
  const result = await getAdminUser();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("profiles")
    .update({ can_vote: canVote })
    .eq("id", profileId);

  if (error) return { error: "Không thể cập nhật quyền vote." };

  revalidatePath("/admin");
  return { success: true };
}

export async function createCohort(name: string, slug: string) {
  const result = await getAdminUser();
  if ("error" in result) return result;
  const { supabase } = result;

  const { error } = await supabase
    .from("cohorts")
    .insert({ name, slug, status: "draft" });

  if (error) return { error: "Không thể tạo cohort. Slug có thể đã tồn tại." };

  revalidatePath("/admin");
  return { success: true };
}
