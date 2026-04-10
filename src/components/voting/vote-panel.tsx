"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { upsertVote } from "@/lib/actions/votes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VoteCategory = "most_loved" | "most_creative" | "best_execution";

interface UserVote {
  project_id: string;
  category: string;
}

interface VotePanelProps {
  projectId: string;
  projectOwnerId: string;
  currentUserId: string | null;
  canVote: boolean;
  sessionStatus: string | null;
  userVotes: UserVote[];
}

const CATEGORIES: { key: VoteCategory; label: string; icon: string }[] = [
  { key: "most_loved", label: "Most Loved", icon: "❤️" },
  { key: "most_creative", label: "Most Creative", icon: "🎨" },
  { key: "best_execution", label: "Best Execution", icon: "⚡" },
];

export function VotePanel({
  projectId,
  projectOwnerId,
  currentUserId,
  canVote,
  sessionStatus,
  userVotes,
}: VotePanelProps) {
  const [isPending, startTransition] = useTransition();

  if (!canVote || sessionStatus !== "open") return null;

  const isSelf = currentUserId === projectOwnerId;

  function isActive(category: VoteCategory) {
    return userVotes.some(
      (v) => v.project_id === projectId && v.category === category
    );
  }

  function handleVote(category: VoteCategory) {
    startTransition(async () => {
      const result = await upsertVote(projectId, category);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.toggled === "off") {
        toast.success("Đã bỏ vote.");
      } else {
        toast.success("Đã vote thành công!");
      }
    });
  }

  return (
    <TooltipProvider>
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
      >
        <p
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "#FFD94C" }}
        >
          Bầu chọn
        </p>

        {CATEGORIES.map(({ key, label, icon }) => {
          const active = isActive(key);

          const button = (
            <button
              key={key}
              disabled={isSelf || isPending}
              onClick={() => !isSelf && handleVote(key)}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: active ? "rgba(255,217,76,0.1)" : "transparent",
                border: active ? "1px solid #FFD94C" : "1px solid #3E5E63",
                color: active ? "#FFD94C" : "#F0F0F0",
              }}
            >
              <span>{icon}</span>
              <span className="flex-1 text-left">{label}</span>
              {active && (
                <span style={{ color: "#FFD94C" }}>✓</span>
              )}
            </button>
          );

          if (isSelf) {
            return (
              <Tooltip key={key}>
                <TooltipTrigger render={button} />
                <TooltipContent>
                  <p>Không thể vote cho dự án của mình</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </div>
    </TooltipProvider>
  );
}
