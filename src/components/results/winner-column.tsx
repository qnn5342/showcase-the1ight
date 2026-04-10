import Image from "next/image";

type Category = "most_loved" | "most_creative" | "best_execution";

interface ProjectData {
  id: string;
  title: string;
  cover_image_url: string | null;
  author_name: string;
  vote_count: number;
}

interface WinnerColumnProps {
  category: Category;
  winner: ProjectData | null;
  runnerUp: ProjectData | null;
}

const CATEGORY_CONFIG: Record<
  Category,
  { emoji: string; label: string; borderColor: string; badgeColor: string }
> = {
  most_loved: {
    emoji: "❤️",
    label: "Most Loved",
    borderColor: "#FFD94C",
    badgeColor: "#FFD94C",
  },
  most_creative: {
    emoji: "🎨",
    label: "Most Creative",
    borderColor: "#4E8770",
    badgeColor: "#4E8770",
  },
  best_execution: {
    emoji: "⚡",
    label: "Best Execution",
    borderColor: "#60A5FA",
    badgeColor: "#60A5FA",
  },
};

export function WinnerColumn({ category, winner, runnerUp }: WinnerColumnProps) {
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="flex flex-col gap-4">
      {/* Category header */}
      <div
        className="text-center py-3 rounded-lg font-bold text-lg"
        style={{
          backgroundColor: "#214C54",
          border: `2px solid ${config.borderColor}`,
          color: config.borderColor,
        }}
      >
        {config.emoji} {config.label}
      </div>

      {/* Winner card */}
      {winner ? (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: "#214C54",
            border: `2px solid ${config.borderColor}`,
            boxShadow: `0 0 20px ${config.borderColor}30`,
          }}
        >
          {/* Cover image 16:9 */}
          <div className="relative w-full aspect-video bg-[#15333B]">
            {winner.cover_image_url ? (
              <Image
                src={winner.cover_image_url}
                alt={winner.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-4xl opacity-20">🖼</span>
              </div>
            )}
            {/* Winner badge overlay */}
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold"
              style={{ backgroundColor: config.badgeColor, color: "#15333B" }}
            >
              🏆 Winner
            </div>
          </div>

          <div className="p-4 space-y-2">
            <h3
              className="font-bold text-base leading-tight"
              style={{ color: "#FDF5DA" }}
            >
              {winner.title}
            </h3>
            <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.7 }}>
              {winner.author_name}
            </p>
            <div
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: config.borderColor }}
            >
              <span>{winner.vote_count}</span>
              <span className="font-normal opacity-70">votes</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "#214C54",
            border: "1px solid #3E5E63",
            color: "#F0F0F0",
            opacity: 0.5,
          }}
        >
          Chưa có dữ liệu
        </div>
      )}

      {/* Runner-up mini card */}
      {runnerUp && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#1a3e47",
            border: "1px solid #3E5E63",
          }}
        >
          <div className="flex items-center gap-3 p-3">
            <div
              className="relative w-16 h-10 rounded shrink-0 bg-[#15333B] overflow-hidden"
            >
              {runnerUp.cover_image_url ? (
                <Image
                  src={runnerUp.cover_image_url}
                  alt={runnerUp.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-lg opacity-20">🖼</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "#FDF5DA" }}
              >
                {runnerUp.title}
              </p>
              <p className="text-xs" style={{ color: "#F0F0F0", opacity: 0.6 }}>
                {runnerUp.author_name} · {runnerUp.vote_count} votes
              </p>
            </div>
            <span
              className="text-xs shrink-0"
              style={{ color: "#F0F0F0", opacity: 0.5 }}
            >
              2nd
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
