import { getYouTubeEmbedUrl } from "@/lib/showcase/youtube";

type ProjectVideoSectionProps = {
  presentationUrl?: string | null;
  feedbackUrl?: string | null;
};

function VideoEmbed({
  title,
  url,
  variant = "primary",
}: {
  title: string;
  url: string;
  variant?: "primary" | "feedback";
}) {
  return (
    <div
      className={
        variant === "primary"
          ? "space-y-3"
          : "grid gap-3 rounded-xl border p-4 sm:grid-cols-[180px_1fr] sm:items-center"
      }
      style={
        variant === "feedback"
          ? { backgroundColor: "#214C54", borderColor: "#3E5E63" }
          : undefined
      }
    >
      {variant === "feedback" && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#FFD94C" }}
          >
            Feedback highlight
          </p>
          <p className="mt-1 text-sm" style={{ color: "#F0F0F0", opacity: 0.72 }}>
            Một đoạn phản hồi ngắn từ người học hoặc người dùng.
          </p>
        </div>
      )}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#3E5E63] bg-[#0E2328]">
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function ProjectVideoSection({
  presentationUrl,
  feedbackUrl,
}: ProjectVideoSectionProps) {
  const presentationEmbedUrl = getYouTubeEmbedUrl(presentationUrl);
  const feedbackEmbedUrl = getYouTubeEmbedUrl(feedbackUrl);

  if (!presentationEmbedUrl && !feedbackEmbedUrl) return null;

  return (
    <section className="space-y-4" aria-label="Project videos">
      {presentationEmbedUrl && (
        <VideoEmbed title="Presentation video" url={presentationEmbedUrl} />
      )}
      {feedbackEmbedUrl && (
        <VideoEmbed
          title="Feedback highlight video"
          url={feedbackEmbedUrl}
          variant="feedback"
        />
      )}
    </section>
  );
}
