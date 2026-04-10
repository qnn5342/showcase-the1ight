import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(100),
  tagline: z.string().min(1, "Tagline không được để trống").max(100),
  live_url: z
    .string()
    .min(1, "URL không được để trống")
    .url("URL không hợp lệ")
    .refine((val) => val.startsWith("https://"), {
      message: "URL phải bắt đầu bằng https://",
    }),
  github_url: z
    .string()
    .url("URL không hợp lệ")
    .refine((val) => val.startsWith("https://"), {
      message: "URL phải bắt đầu bằng https://",
    })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  status: z.enum(["draft", "published"]),
  tags: z
    .array(z.string())
    .min(1, "Chọn ít nhất 1 tag")
    .max(3, "Chọn tối đa 3 tag"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const PRESET_TAGS = [
  "AI",
  "SaaS",
  "Tool",
  "Game",
  "Education",
  "Lifestyle",
  "Other",
] as const;
