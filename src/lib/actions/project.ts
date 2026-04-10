"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";
import type { ProjectFormValues } from "@/lib/validations/project";

export async function updateProject(
  projectId: string,
  formData: ProjectFormValues
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const parsed = projectSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { tags, ...projectData } = parsed.data;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      title: projectData.title,
      tagline: projectData.tagline,
      description: projectData.description || null,
      live_url: projectData.live_url,
      github_url: projectData.github_url || null,
      cover_image_url: projectData.cover_image_url || null,
      status: projectData.status,
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (updateError)
    return { error: { _form: ["Có lỗi xảy ra, thử lại sau."] } };

  // Re-link tags: delete old, insert new
  await supabase.from("project_tags").delete().eq("project_id", projectId);
  for (const tagName of tags) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagName)
      .single();
    if (tag) {
      await supabase
        .from("project_tags")
        .insert({ project_id: projectId, tag_id: tag.id });
    }
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function createProject(formData: ProjectFormValues) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const parsed = projectSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { tags, cohort_id, ...projectData } = parsed.data;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      cohort_id,
      title: projectData.title,
      tagline: projectData.tagline,
      description: projectData.description || null,
      live_url: projectData.live_url,
      github_url: projectData.github_url || null,
      cover_image_url: projectData.cover_image_url || null,
      status: projectData.status,
    })
    .select("id")
    .single();

  if (projectError || !project)
    return { error: { _form: ["Có lỗi xảy ra, thử lại sau."] } };

  // Link tags
  for (const tagName of tags) {
    const { data: tag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagName)
      .single();
    if (tag) {
      await supabase
        .from("project_tags")
        .insert({ project_id: project.id, tag_id: tag.id });
    }
  }

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}
