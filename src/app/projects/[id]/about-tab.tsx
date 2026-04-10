"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AboutTabProps {
  content: string;
}

export function AboutTab({ content }: AboutTabProps) {
  if (!content) {
    return (
      <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.6 }}>
        Chưa có mô tả.
      </p>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
