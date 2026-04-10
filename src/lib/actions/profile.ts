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
