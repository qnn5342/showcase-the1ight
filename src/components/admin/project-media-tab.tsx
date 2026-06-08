"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectMedia } from "@/lib/actions/project-media";
import { getYouTubeEmbedUrl, isValidYouTubeUrl } from "@/lib/showcase/youtube";

type ProjectMedia = {
  id: string;
  title: string;
  status: string;
  presentation_youtube_url: string | null;
  feedback_youtube_url: string | null;
  cohorts:
    | { name: string | null; class_code: string | null }
    | { name: string | null; class_code: string | null }[]
    | null;
};

type ProjectMediaErrors = {
  _form?: string[];
  presentation_youtube_url?: string[];
  feedback_youtube_url?: string[];
};

function getCohortLabel(project: ProjectMedia) {
  const cohort = Array.isArray(project.cohorts)
    ? project.cohorts[0]
    : project.cohorts;
  if (!cohort) return "Chưa có lớp";
  return cohort.class_code ? `${cohort.class_code} — ${cohort.name}` : cohort.name;
}

function VideoPreview({ label, value }: { label: string; value: string }) {
  const embedUrl = getYouTubeEmbedUrl(value);
  if (!value.trim()) return null;
  if (!embedUrl) {
    return <p className="text-xs text-red-300">{label} chưa phải link YouTube hợp lệ.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium" style={{ color: "#FFD94C" }}>
        {label}
      </p>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-[#3E5E63] bg-[#15333B]">
        <iframe
          src={embedUrl}
          title={label}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function ProjectMediaTab({ projects }: { projects: ProjectMedia[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );
  const [presentationUrl, setPresentationUrl] = useState(
    selectedProject?.presentation_youtube_url ?? ""
  );
  const [feedbackUrl, setFeedbackUrl] = useState(
    selectedProject?.feedback_youtube_url ?? ""
  );
  const [isPending, startTransition] = useTransition();

  function handleSelect(projectId: string) {
    const project = projects.find((item) => item.id === projectId);
    setSelectedProjectId(projectId);
    setPresentationUrl(project?.presentation_youtube_url ?? "");
    setFeedbackUrl(project?.feedback_youtube_url ?? "");
  }

  function handleSave() {
    if (!selectedProjectId) {
      toast.error("Chọn một project trước.");
      return;
    }

    if (presentationUrl.trim() && !isValidYouTubeUrl(presentationUrl)) {
      toast.error("Presentation video chưa phải link YouTube hợp lệ.");
      return;
    }

    if (feedbackUrl.trim() && !isValidYouTubeUrl(feedbackUrl)) {
      toast.error("Feedback clip chưa phải link YouTube hợp lệ.");
      return;
    }

    startTransition(async () => {
      const result = await updateProjectMedia({
        projectId: selectedProjectId,
        presentation_youtube_url: presentationUrl,
        feedback_youtube_url: feedbackUrl,
      });

      const errors = "error" in result ? (result.error as ProjectMediaErrors) : null;
      if (errors) {
        const firstError =
          errors._form?.[0] ??
          errors.presentation_youtube_url?.[0] ??
          errors.feedback_youtube_url?.[0] ??
          "Không thể lưu video showcase.";
        toast.error(firstError);
        return;
      }

      toast.success("Đã lưu video showcase.");
    });
  }

  if (projects.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.72 }}>
        Chưa có project nào để gắn video.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <Label htmlFor="project-media-picker" style={{ color: "#FDF5DA" }}>
          Chọn project
        </Label>
        <select
          id="project-media-picker"
          value={selectedProjectId}
          onChange={(event) => handleSelect(event.target.value)}
          className="mt-2 h-10 w-full rounded-lg border border-[#3E5E63] bg-[#15333B] px-3 text-sm text-[#F0F0F0] outline-none focus:ring-2 focus:ring-[#FFD94C]/50"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>

        {selectedProject && (
          <div className="mt-4 space-y-2 text-sm" style={{ color: "#F0F0F0" }}>
            <p className="font-medium">{selectedProject.title}</p>
            <p className="text-xs opacity-70">{getCohortLabel(selectedProject)}</p>
            <p className="text-xs opacity-70">Status: {selectedProject.status}</p>
          </div>
        )}
      </div>

      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="presentation-youtube-url" style={{ color: "#FDF5DA" }}>
              Presentation YouTube URL
            </Label>
            <Input
              id="presentation-youtube-url"
              value={presentationUrl}
              onChange={(event) => setPresentationUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-10 border-[#3E5E63] bg-[#15333B] text-[#F0F0F0] placeholder:text-[#F0F0F0]/35 focus-visible:ring-[#FFD94C]/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-youtube-url" style={{ color: "#FDF5DA" }}>
              Feedback clip URL <span className="text-[#F0F0F0]/50">(optional)</span>
            </Label>
            <Input
              id="feedback-youtube-url"
              value={feedbackUrl}
              onChange={(event) => setFeedbackUrl(event.target.value)}
              placeholder="https://youtu.be/..."
              className="h-10 border-[#3E5E63] bg-[#15333B] text-[#F0F0F0] placeholder:text-[#F0F0F0]/35 focus-visible:ring-[#FFD94C]/50"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPresentationUrl("");
                setFeedbackUrl("");
              }}
              disabled={isPending}
              className="border-[#3E5E63] text-[#F0F0F0] hover:bg-[#15333B]"
            >
              Clear videos
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#FFD94C] font-semibold text-[#15333B] hover:bg-[#FFD94C]/90"
            >
              {isPending ? "Đang lưu..." : "Save project media"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <VideoPreview label="Presentation preview" value={presentationUrl} />
          <VideoPreview label="Feedback preview" value={feedbackUrl} />
        </div>
      </div>
    </div>
  );
}
