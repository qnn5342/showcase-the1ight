"use client";

import { useRef, useState } from "react";
import { HighlightCard, type AwardType } from "./highlight-card";

interface DownloadHighlightButtonProps {
  project: {
    title: string;
    author_name: string;
    cover_image_url: string | null;
  };
  cohortName: string;
  award: AwardType;
}

export function DownloadHighlightButton({
  project,
  cohortName,
  award,
}: DownloadHighlightButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(cardRef.current, {
        width: 1080,
        height: 1080,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#15333B",
        logging: false,
      });

      const link = document.createElement("a");
      const safeName = project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `highlight_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate highlight card:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Off-screen card for capture */}
      <div
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          width: 1080,
          height: 1080,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <HighlightCard
          ref={cardRef}
          project={project}
          cohortName={cohortName}
          award={award}
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#3E5E63" : "#FFD94C",
          color: "#15333B",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "opacity 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "Đang tạo..." : "⬇ Tải Highlight Card"}
      </button>
    </>
  );
}
