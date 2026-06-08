"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  projectMediaSchema,
  type ProjectMediaFormValues,
} from "@/lib/validations/project-media";

async function getAdminClient() {
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
    return { error: "Không có quyền cập nhật video showcase." };
  }

  return { supabase };
}

export async function updateProjectMedia(input: ProjectMediaFormValues) {
  const parsed = projectMediaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const result = await getAdminClient();
  if ("error" in result) return { error: { _form: [result.error] } };

  const { projectId, presentation_youtube_url, feedback_youtube_url } =
    parsed.data;

  const { error } = await result.supabase
    .from("projects")
    .update({
      presentation_youtube_url: presentation_youtube_url || null,
      feedback_youtube_url: feedback_youtube_url || null,
    })
    .eq("id", projectId);

  if (error) {
    return { error: { _form: ["Không thể lưu video showcase."] } };
  }

  revalidatePath("/admin");
  revalidatePath(`/projects/${projectId}`);

  return { success: true };
}
