"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/project";
import { createProject, updateProject } from "@/lib/actions/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string[] | null>(null);

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
      cohort_id: initialValues?.cohort_id ?? "",
      status: initialValues?.status ?? "draft",
      tags: initialValues?.tags ?? [],
    },
  });

  const statusValue = watch("status");

  const onSubmit = async (data: ProjectFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const result = isEdit
        ? await updateProject(projectId, data)
        : await createProject(data);
      if (result?.error) {
        if ("_form" in result.error) {
          setServerError(result.error._form as string[]);
        }
      }
    } catch {
      // redirect() throws — that's expected on success
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
        <Label htmlFor="description" className="text-[#FDF5DA]/70">
          Mô tả chi tiết (tuỳ chọn)
        </Label>
        <Textarea
          id="description"
          placeholder="Mô tả về tính năng, công nghệ sử dụng, hành trình xây dựng..."
          rows={4}
          className="bg-[#15333B] border-[#3E5E63] text-[#F0F0F0] placeholder:text-[#F0F0F0]/30 focus-visible:ring-[#FFD94C]/50 resize-none"
          {...register("description")}
        />
      </div>

      {/* Cover Image */}
      <div className="space-y-1.5">
        <Label className="text-[#FDF5DA]/70">Ảnh bìa (tuỳ chọn)</Label>
        <Controller
          name="cover_image_url"
          control={control}
          render={({ field }) => (
            <CoverUpload value={field.value} onChange={field.onChange} />
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

      {/* Status toggle */}
      <div className="flex items-center justify-between rounded-lg border border-[#3E5E63] px-4 py-3 bg-[#15333B]/40">
        <div>
          <p className="text-[#FDF5DA] text-sm font-medium">
            {statusValue === "published" ? "Publish ngay" : "Lưu nháp"}
          </p>
          <p className="text-[#F0F0F0]/40 text-xs mt-0.5">
            {statusValue === "published"
              ? "Dự án sẽ hiển thị công khai"
              : "Chỉ bạn thấy, chưa công khai"}
          </p>
        </div>
        <Switch
          checked={statusValue === "published"}
          onCheckedChange={(checked) =>
            setValue("status", checked ? "published" : "draft")
          }
          className="data-[state=checked]:bg-[#4E8770]"
        />
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

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#FFD94C] hover:bg-[#FFD94C]/90 text-[#15333B] font-semibold h-11 text-base"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang submit...
          </>
        ) : isEdit ? (
          statusValue === "published" ? "Lưu & Publish" : "Lưu thay đổi"
        ) : statusValue === "published" ? (
          "Submit & Publish"
        ) : (
          "Lưu nháp"
        )}
      </Button>
    </form>
  );
}
