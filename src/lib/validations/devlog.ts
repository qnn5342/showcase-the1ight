import { z } from "zod";

export const devlogEntrySchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  content: z.string().optional(),
  type: z.enum(["text", "image", "milestone"]),
  image_url: z.string().optional(),
});
