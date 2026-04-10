"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addComment(projectId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập để bình luận." };

  const trimmed = content.trim();
  if (!trimmed || trimmed.length === 0)
    return { error: "Nội dung bình luận không được để trống." };
  if (trimmed.length > 1000)
    return { error: "Bình luận không được vượt quá 1000 ký tự." };

  const { error } = await supabase.from("comments").insert({
    project_id: projectId,
    author_id: user.id,
    content: trimmed,
  });

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function updateComment(
  commentId: string,
  projectId: string,
  content: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  const trimmed = content.trim();
  if (!trimmed || trimmed.length === 0)
    return { error: "Nội dung bình luận không được để trống." };
  if (trimmed.length > 1000)
    return { error: "Bình luận không được vượt quá 1000 ký tự." };

  const { error } = await supabase
    .from("comments")
    .update({ content: trimmed, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteComment(commentId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function hideComment(commentId: string, projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn cần đăng nhập." };

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin")
    return { error: "Không có quyền thực hiện thao tác này." };

  const { error } = await supabase
    .from("comments")
    .update({ is_hidden: true })
    .eq("id", commentId);

  if (error) return { error: "Có lỗi xảy ra, thử lại sau." };

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
