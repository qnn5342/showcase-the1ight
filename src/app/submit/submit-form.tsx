"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/project";
import { createProject, updateProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Label } from "@/components/ui/label";
import { CoverUpload } from "@/components/submit/cover-upload";
import { TagSelector } from "@/components/submit/tag-selector";
import { CohortSelector } from "@/components/submit/cohort-selector";
import { Loader2 } from "lucide-react";

interface SubmitFormProps {
  projectId?: string;
  initialValues?: Partial<ProjectFormValues>;
}

export function SubmitForm({ projectId, initialValues }: SubmitFormProps) {
  const isEdit = !!projectId;
  const currentStatus = initialValues?.status ?? "draft";
  const isAlreadyPublished = isEdit && currentStatus === "published";
  const [submitting, setSubmitting] = useState<"draft" | "published" | null>(null);
  const [serverError, setServerError] = useState<string[] | null>(null);
  const lockRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      tagline: initialValues?.tagline ?? "",
      live_url: initialValues?.live_url ?? "",
      github_url: initialValues?.github_url ?? "",
      description: initialValues?.description ?? "",
      cover_image_url: initialValues?.cover_image_url ?? "",
      cover_focus_position: initialValues?.cover_focus_position ?? "50% 50%",
      cohort_id: initialValues?.cohort_id ?? "",
      status: isAlreadyPublished ? "published" : "draft",
      tags: initialValues?.tags ?? [],
    },
  });

  const submitAs = (status: "draft" | "published") =>
    async (e?: React.BaseSyntheticEvent) => {
      if (lockRef.current) return;
      lockRef.current = true;
      try {
        await handleSubmit(async (data) => {
          setSubmitting(status);
          setServerError(null);
          const payload = { ...data, status };
          const result = isEdit
            ? await updateProject(projectId, payload)
            : await createProject(payload);
          // Success path throws NEXT_REDIRECT above; we only reach here on server error.
          if (result?.error && "_form" in result.error) {
            setServerError(result.error._form as string[]);
          }
          setSubmitting(null);
        })(e);
      } catch {
        // redirect() throws on success — keep spinner until navigation unmounts.
      } finally {
        // Always release lock so user can retry after validation/server errors.
        // On redirect success, component unmounts before this matters.
        lockRef.current = false;
      }
    };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 bg-[#214C54] rounded-xl p-6 border border-[#3E5E63]"
    >
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-[#FDF5DA]">
          Tên dự án <span className="text-[#FFD94C]">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ví dụ: TaskFlow AI"
          className="bg-[#15333B] border-[#3E5E63] text-[#F0F0F0] placeholder:text-[#F0F0F0]/30 focus-visible:ring-[#FFD94C]/50"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-red-400 text-sm">{errors.title.message}</p>
        )}
      </div>

      {/* Tagline */}
      <div className="space-y-1.5">
        <Label htmlFor="tagline" className="text-[#FDF5DA]">
          Tagline <span className="text-[#FFD94C]">*</span>
        </Label>
        <Input
          id="tagline"
          placeholder="Mô tả ngắn gọn về sản phẩm trong 1 câu"
          className="bg-[#15333B] border-[#3E5E63] text-[#F0F0F0] placeholder:text-[#F0F0F0]/30 focus-visible:ring-[#FFD94C]/50"
          {...register("tagline")}
        />
        {errors.tagline && (
          <p className="text-red-400 text-sm">{errors.tagline.message}</p>
        )}
      </div>

      {/* Live URL */}
      <div className="space-y-1.5">
        <Label htmlFor="live_url" className="text-[#FDF5DA]">
          Link demo / live <span className="text-[#FFD94C]">*</span>
        </Label>
        <Input
          id="live_url"
          placeholder="https://your-project.com"
          className="bg-[#15333B] border-[#3E5E63] text-[#F0F0F0] placeholder:text-[#F0F0F0]/30 focus-visible:ring-[#FFD94C]/50"
          {...register("live_url")}
        />
        {errors.live_url && (
          <p className="text-red-400 text-sm">{errors.live_url.message}</p>
        )}
      </div>

      {/* GitHub URL */}
      <div className="space-y-1.5">
        <Label htmlFor="github_url" className="text-[#FDF5DA]/70">
          GitHub (tuỳ chọn)
        </Label>
        <Input
          id="github_url"
          placeholder="https://github.com/username/repo"
          className="bg-[#15333B] border-[#3E5E63] text-[#F0F0F0] placeholder:text-[#F0F0F0]/30 focus-visible:ring-[#FFD94C]/50"
          {...register("github_url")}
        />
        {errors.github_url && (
          <p className="text-red-400 text-sm">{errors.github_url.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[#FDF5DA]/70">
          Mô tả chi tiết (tuỳ chọn)
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              content={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-1.5">
        <Label className="text-[#FDF5DA]/70">Ảnh bìa (tuỳ chọn)</Label>
        <Controller
          name="cover_image_url"
          control={control}
          render={({ field }) => (
            <CoverUpload
              value={field.value}
              onChange={field.onChange}
              focusPosition={watch("cover_focus_position") || "50% 50%"}
              onFocusChange={(pos) => setValue("cover_focus_position", pos)}
            />
          )}
        />
      </div>

      {/* Course & Cohort */}
      <div className="space-y-1.5">
        <Label className="text-[#FDF5DA]">
          Khoá & Lớp <span className="text-[#FFD94C]">*</span>
        </Label>
        <Controller
          name="cohort_id"
          control={control}
          render={({ field }) => (
            <CohortSelector
              value={field.value}
              onChange={field.onChange}
              disabled={isEdit}
            />
          )}
        />
        {errors.cohort_id && (
          <p className="text-red-400 text-sm">{errors.cohort_id.message}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-[#FDF5DA]">
          Tags <span className="text-[#FFD94C]">*</span>
          <span className="text-[#F0F0F0]/40 text-xs ml-2">chọn 1–3</span>
        </Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagSelector value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.tags && (
          <p className="text-red-400 text-sm">{errors.tags.message}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-lg bg-red-950/50 border border-red-800 px-4 py-3">
          {serverError.map((msg, i) => (
            <p key={i} className="text-red-400 text-sm">
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        {!isAlreadyPublished && (
          <Button
            type="button"
            variant="ghost"
            disabled={submitting !== null}
            onClick={submitAs("draft")}
            className="flex-1 h-11 text-base text-[#FDF5DA] hover:bg-[#15333B] border border-[#3E5E63]"
          >
            {submitting === "draft" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu nháp"
            )}
          </Button>
        )}
        <Button
          type="button"
          disabled={submitting !== null}
          onClick={submitAs("published")}
          className="flex-1 bg-[#FFD94C] hover:bg-[#FFD94C]/90 text-[#15333B] font-semibold h-11 text-base"
        >
          {submitting === "published" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang publish...
            </>
          ) : isAlreadyPublished ? (
            "Lưu thay đổi"
          ) : isEdit ? (
            "Publish ngay"
          ) : (
            "Publish"
          )}
        </Button>
      </div>
    </form>
  );
}
