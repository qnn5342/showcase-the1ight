"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const editProfileSchema = z.object({
  bio: z.string().max(300, "Bio tối đa 300 ký tự.").optional(),
  github_url: z.string().url("GitHub URL không hợp lệ.").optional().or(z.literal("")),
  linkedin_url: z.string().url("LinkedIn URL không hợp lệ.").optional().or(z.literal("")),
  website_url: z.string().url("Website URL không hợp lệ.").optional().or(z.literal("")),
});

export async function updateProfile(input: z.infer<typeof editProfileSchema>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = editProfileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("profiles")
    .update({
      bio: parsed.data.bio || null,
      github_url: parsed.data.github_url || null,
      linkedin_url: parsed.data.linkedin_url || null,
      website_url: parsed.data.website_url || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/me");
  return { success: true };
}

export async function updateMyCohort(cohortSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: cohort } = await supabase
    .from("cohorts")
    .select("slug")
    .eq("slug", cohortSlug)
    .single();
  if (!cohort) return { error: "Batch không tồn tại." };

  const { error } = await supabase
    .from("profiles")
    .update({ cohort_slug: cohort.slug })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/me");
  return { success: true };
}

export async function adminUpdateStudentCohort(
  targetUserId: string,
  cohortSlug: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (caller?.role !== "admin") return { error: "Chỉ admin được đổi cohort." };

  if (cohortSlug) {
    const { data: cohort } = await supabase
      .from("cohorts")
      .select("slug")
      .eq("slug", cohortSlug)
      .single();
    if (!cohort) return { error: "Batch không tồn tại." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ cohort_slug: cohortSlug })
    .eq("id", targetUserId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { success: true };
}
