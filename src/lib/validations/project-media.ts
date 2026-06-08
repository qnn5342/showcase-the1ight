import { z } from "zod";
import { isValidYouTubeUrl } from "@/lib/showcase/youtube";

function optionalYouTubeUrl(label: string) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || isValidYouTubeUrl(value), {
      message: `${label} phải là link YouTube hợp lệ.`,
    });
}

export const projectMediaSchema = z.object({
  projectId: z.string().min(1, "Chọn dự án."),
  presentation_youtube_url: optionalYouTubeUrl("Presentation video"),
  feedback_youtube_url: optionalYouTubeUrl("Feedback clip"),
});

export type ProjectMediaFormValues = z.infer<typeof projectMediaSchema>;
