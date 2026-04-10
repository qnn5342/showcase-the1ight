"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addDevlogEntry(
  projectId: string,
  data: {
    title: string;
    content?: string;
    type: "text" | "image" | "milestone";
    image_url?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Không tìm thấy dự án." };
  if (project.owner_id !== user.id) return { error: "Bạn không có quyền thêm devlog cho dự án này." };

  const { error } = await supabase.from("devlog_entries").insert({
    project_id: projectId,
    author_id: user.id,
    type: data.type,
    title: data.title.trim(),
    content: data.content?.trim() || null,
    image_url: data.image_url || null,
  });

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteDevlogEntry(entryId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  const { error } = await supabase
    .from("devlog_entries")
    .delete()
    .eq("id", entryId)
    .eq("author_id", user.id);

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
