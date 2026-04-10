"use client";

import { useRef, useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import { addComment } from "@/lib/actions/comment";
import { CommentCard } from "./comment-card";

interface OptimisticComment {
  id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface AddCommentProps {
  projectId: string;
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserAvatar: string | null;
  initialComments: OptimisticComment[];
}

export function AddComment({
  projectId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  initialComments,
}: AddCommentProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state: OptimisticComment[], newComment: OptimisticComment) => [
      newComment,
      ...state,
    ]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Nội dung không được để trống.");
      return;
    }
    if (trimmed.length > 1000) {
      setError("Tối đa 1000 ký tự.");
      return;
    }

    setError(null);

    const tempComment: OptimisticComment = {
      id: `temp-${Date.now()}`,
      content: trimmed,
      created_at: new Date().toISOString(),
      is_hidden: false,
      author: {
        id: currentUserId,
        display_name: currentUserName,
        avatar_url: currentUserAvatar,
      },
    };

    startTransition(async () => {
      addOptimisticComment(tempComment);
      const result = await addComment(projectId, trimmed);
      if (result?.error) {
        setError(result.error);
      } else {
        setContent("");
        formRef.current?.reset();
      }
    });
  }

  return (
    <div className="space-y-4">
      {currentUserId ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            maxLength={1000}
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
            style={{
              backgroundColor: "#214C54",
              color: "#F0F0F0",
              border: "1px solid #3E5E63",
            }}
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isPending || content.trim().length === 0}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
            >
              {isPending ? "Đang gửi..." : "Gửi bình luận"}
            </button>
            <span className="text-xs" style={{ color: "#F0F0F0", opacity: 0.4 }}>
              {content.length}/1000
            </span>
          </div>
          {error && (
            <p className="text-xs" style={{ color: "#FF6B6B" }}>
              {error}
            </p>
          )}
        </form>
      ) : (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: "#214C54",
            border: "1px solid #3E5E63",
            color: "#F0F0F0",
          }}
        >
          <Link
            href="/login"
            className="font-medium underline"
            style={{ color: "#FFD94C" }}
          >
            Đăng nhập
          </Link>{" "}
          để bình luận.
        </div>
      )}

      {optimisticComments.length === 0 ? (
        <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.5 }}>
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      ) : (
        <div className="space-y-3">
          {optimisticComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              projectId={projectId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
