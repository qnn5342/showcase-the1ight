"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { deleteDevlogEntry } from "@/lib/actions/devlog";

interface DevlogEntryProps {
  entry: {
    id: string;
    type: "text" | "image" | "milestone";
    title: string;
    content: string | null;
    image_url: string | null;
    created_at: string;
  };
  projectId: string;
  isOwner: boolean;
  isLast: boolean;
}

function TypeIcon({ type }: { type: "text" | "image" | "milestone" }) {
  if (type === "milestone") {
    return <span className="text-base leading-none">★</span>;
  }
  if (type === "image") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
        <polyline points="21 15 16 10 5 21" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

const TYPE_LABELS = {
  text: "Ghi chú",
  image: "Hình ảnh",
  milestone: "Cột mốc",
};

export function DevlogEntry({ entry, projectId, isOwner, isLast }: DevlogEntryProps) {
  const [deleting, setDeleting] = useState(false);

  const isMilestone = entry.type === "milestone";

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa entry này không?")) return;
    setDeleting(true);
    await deleteDevlogEntry(entry.id, projectId);
    setDeleting(false);
  };

  const relativeTime = formatDistanceToNow(new Date(entry.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="flex gap-4">
      {/* Left: icon + line */}
      <div className="flex flex-col items-center">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 z-10"
          style={{
            backgroundColor: isMilestone ? "#FFD94C" : "#214C54",
            color: isMilestone ? "#15333B" : "#F0F0F0",
            border: `2px solid ${isMilestone ? "#FFD94C" : "#3E5E63"}`,
          }}
        >
          <TypeIcon type={entry.type} />
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 mt-1"
            style={{ backgroundColor: "#3E5E63", minHeight: "24px" }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-8">
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            backgroundColor: isMilestone ? "rgba(255,217,76,0.08)" : "#214C54",
            border: `1px solid ${isMilestone ? "#FFD94C44" : "#3E5E63"}`,
          }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: isMilestone ? "#FFD94C22" : "#15333B",
                    color: isMilestone ? "#FFD94C" : "#F0F0F0",
                    border: `1px solid ${isMilestone ? "#FFD94C55" : "#3E5E63"}`,
                  }}
                >
                  {TYPE_LABELS[entry.type]}
                </span>
                <span className="text-xs" style={{ color: "#F0F0F0", opacity: 0.45 }}>
                  {relativeTime}
                </span>
              </div>
              <h3
                className={`font-semibold leading-snug mt-1 ${isMilestone ? "text-lg" : "text-base"}`}
                style={{ color: isMilestone ? "#FFD94C" : "#FDF5DA" }}
              >
                {entry.title}
              </h3>
            </div>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="shrink-0 text-xs px-2 py-1 rounded transition-colors hover:bg-red-500/20 text-red-400 disabled:opacity-50"
              >
                {deleting ? "..." : "Xóa"}
              </button>
            )}
          </div>

          {/* Content */}
          {entry.content && (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#F0F0F0", opacity: 0.8 }}
            >
              {entry.content}
            </p>
          )}

          {/* Image */}
          {entry.type === "image" && entry.image_url && (
            <div className="rounded-lg overflow-hidden mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.image_url}
                alt={entry.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
