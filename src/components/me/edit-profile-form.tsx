"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile, updateMyCohort } from "@/lib/actions/profile";

const editProfileSchema = z.object({
  bio: z.string().max(300, "Bio tối đa 300 ký tự.").optional(),
  github_url: z.string().url("GitHub URL không hợp lệ.").optional().or(z.literal("")),
  linkedin_url: z.string().url("LinkedIn URL không hợp lệ.").optional().or(z.literal("")),
  website_url: z.string().url("Website URL không hợp lệ.").optional().or(z.literal("")),
  cohort_slug: z.string().optional(),
});

type FormValues = z.infer<typeof editProfileSchema>;

type Cohort = {
  id: string;
  name: string;
  slug: string;
  class_code: string | null;
};

interface EditProfileFormProps {
  defaultValues: FormValues;
  cohorts: Cohort[];
}

export function EditProfileForm({ defaultValues, cohorts }: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
  });

  const bioValue = watch("bio") ?? "";

  async function onSubmit(values: FormValues) {
    const { cohort_slug, ...profileValues } = values;
    const result = await updateProfile(profileValues);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    // Sync cohort if changed
    if (cohort_slug && cohort_slug !== defaultValues.cohort_slug) {
      const cohortResult = await updateMyCohort(cohort_slug);
      if (cohortResult?.error) {
        toast.error(cohortResult.error);
        return;
      }
    }
    toast.success("Hồ sơ đã được cập nhật.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cohort_slug" className="text-[#F0F0F0]">
          Khoá & Lớp
        </Label>
        <select
          id="cohort_slug"
          {...register("cohort_slug")}
          className="w-full h-10 px-3 rounded-md border border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] focus:ring-2 focus:ring-[#FFD94C]/50 focus:outline-none"
        >
          <option value="">Chưa chọn</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.class_code ? `${c.class_code} — ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-[#F0F0F0]">
          Giới thiệu bản thân
        </Label>
        <Textarea
          id="bio"
          placeholder="Kể ngắn gọn về bạn — background, đang làm gì, quan tâm gì..."
          className="resize-none border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 focus-visible:ring-[#FFD94C]"
          rows={3}
          {...register("bio")}
        />
        <div className="flex items-center justify-between">
          {errors.bio ? (
            <p className="text-xs text-red-400">{errors.bio.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-[#F0F0F0]/50">{bioValue.length}/300</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="github_url" className="text-[#F0F0F0]">
          GitHub URL
        </Label>
        <Input
          id="github_url"
          placeholder="https://github.com/username"
          className="border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 focus-visible:ring-[#FFD94C]"
          {...register("github_url")}
        />
        {errors.github_url && (
          <p className="text-xs text-red-400">{errors.github_url.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linkedin_url" className="text-[#F0F0F0]">
          LinkedIn URL
        </Label>
        <Input
          id="linkedin_url"
          placeholder="https://linkedin.com/in/username"
          className="border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 focus-visible:ring-[#FFD94C]"
          {...register("linkedin_url")}
        />
        {errors.linkedin_url && (
          <p className="text-xs text-red-400">{errors.linkedin_url.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website_url" className="text-[#F0F0F0]">
          Website / Portfolio URL
        </Label>
        <Input
          id="website_url"
          placeholder="https://yoursite.com"
          className="border-[#3E5E63] bg-[#214C54] text-[#F0F0F0] placeholder:text-[#F0F0F0]/40 focus-visible:ring-[#FFD94C]"
          {...register("website_url")}
        />
        {errors.website_url && (
          <p className="text-xs text-red-400">{errors.website_url.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#FFD94C] text-[#15333B] font-semibold hover:bg-[#FFD94C]/90 disabled:opacity-60"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
