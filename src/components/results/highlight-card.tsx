"use client";

import { forwardRef } from "react";

export type AwardType =
  | "most_loved"
  | "most_creative"
  | "best_execution"
  | "jury_pick"
  | "participant";

interface HighlightCardProps {
  project: {
    title: string;
    author_name: string;
    cover_image_url: string | null;
  };
  cohortName: string;
  award: AwardType;
}

const AWARD_CONFIG: Record<
  AwardType,
  { label: string; emoji: string; bg: string; color: string }
> = {
  most_loved: {
    label: "Most Loved",
    emoji: "❤️",
    bg: "#FFD94C",
    color: "#15333B",
  },
  most_creative: {
    label: "Most Creative",
    emoji: "🎨",
    bg: "#4E8770",
    color: "#FDF5DA",
  },
  best_execution: {
    label: "Best Execution",
    emoji: "⚡",
    bg: "#60A5FA",
    color: "#15333B",
  },
  jury_pick: {
    label: "Jury's Pick",
    emoji: "🎖️",
    bg: "#FFD94C",
    color: "#15333B",
  },
  participant: {
    label: "Participant",
    emoji: "🌱",
    bg: "#3E5E63",
    color: "#F0F0F0",
  },
};

// NOTE: Uses inline styles throughout — Tailwind classes are NOT reliable inside html2canvas captures.
// Uses <img> not Next.js Image for html2canvas compatibility.
export const HighlightCard = forwardRef<HTMLDivElement, HighlightCardProps>(
  function HighlightCard({ project, cohortName, award }, ref) {
    const config = AWARD_CONFIG[award];
    const isWinner = award !== "participant";

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1080,
          backgroundColor: "#15333B",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          overflow: "hidden",
          border: isWinner ? `6px solid ${config.bg}` : "6px solid #3E5E63",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            backgroundColor: "#214C54",
            borderBottom: "2px solid #3E5E63",
            padding: "32px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo mark */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "#FFD94C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: 28,
                color: "#15333B",
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#FDF5DA",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                The1ight
              </div>
              <div style={{ fontSize: 16, color: "#F0F0F0", opacity: 0.6, marginTop: 4 }}>
                Showcase
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#F0F0F0",
              opacity: 0.7,
              fontWeight: "500",
            }}
          >
            {cohortName}
          </div>
        </div>

        {/* Award badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "28px 48px 20px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              backgroundColor: config.bg,
              color: config.color,
              borderRadius: 50,
              padding: "12px 32px",
              fontSize: 22,
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </div>
        </div>

        {/* Cover image — flex 1 fill */}
        <div
          style={{
            flex: 1,
            margin: "0 48px",
            overflow: "hidden",
            borderRadius: 16,
            backgroundColor: "#214C54",
            position: "relative",
            minHeight: 0,
          }}
        >
          {project.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image_url}
              alt={project.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                opacity: 0.15,
              }}
            >
              🖼
            </div>
          )}
        </div>

        {/* Project info */}
        <div
          style={{
            padding: "28px 48px 16px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: "800",
              color: "#FDF5DA",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#F0F0F0",
              opacity: 0.65,
              marginTop: 10,
              fontWeight: "500",
            }}
          >
            {project.author_name}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 48px 32px",
            borderTop: "1px solid #3E5E63",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 18,
              color: "#FFD94C",
              fontWeight: "600",
              opacity: 0.9,
            }}
          >
            showcase.the1ight.com
          </span>
        </div>
      </div>
    );
  }
);
