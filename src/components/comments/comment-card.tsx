"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateComment, deleteComment } from "@/lib/actions/comment";

interface CommentAuthor {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    is_hidden: boolean;
    author: CommentAuthor;
  };
  projectId: string;
  currentUserId: string | null;
}

export function CommentCard({
  comment,
  projectId,
  currentUserId,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === comment.author.id;
  const authorName = comment.author.display_name ?? "Ẩn danh";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const relativeTime = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: vi,
  });

  if (comment.is_hidden) {
    return (
      <div
        className="rounded-xl px-4 py-3"
        style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
      >
        <p className="text-sm italic" style={{ color: "#F0F0F0", opacity: 0.4 }}>
          Bình luận này đã bị ẩn.
        </p>
      </div>
    );
  }

  function handleEdit() {
    setEditContent(comment.content);
    setEditError(null);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditError(null);
  }

  function handleSaveEdit() {
    if (editContent.trim().length === 0) {
      setEditError("Nội dung không được để trống.");
      return;
    }
    if (editContent.trim().length > 1000) {
      setEditError("Tối đa 1000 ký tự.");
      return;
    }
    startTransition(async () => {
      const result = await updateComment(comment.id, projectId, editContent);
      if (result?.error) {
        setEditError(result.error);
      } else {
        setIsEditing(false);
        setEditError(null);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    startTransition(async () => {
      await deleteComment(comment.id, projectId);
    });
  }

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2"
      style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage
            src={comment.author.avatar_url ?? ""}
            alt={authorName}
          />
          <AvatarFallback
            style={{ backgroundColor: "#3E5E63", color: "#FFD94C" }}
            className="text-xs"
          >
            {authorInitial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium" style={{ color: "#FDF5DA" }}>
          {authorName}
        </span>
        <span className="text-xs" style={{ color: "#F0F0F0", opacity: 0.5 }}>
          {relativeTime}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
            style={{
              backgroundColor: "#15333B",
              color: "#F0F0F0",
              border: "1px solid #3E5E63",
            }}
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
            >
              {isPending ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isPending}
              className="rounded-lg px-3 py-1 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "#F0F0F0", opacity: 0.7 }}
            >
              Huỷ
            </button>
            <span className="ml-auto text-xs" style={{ color: "#F0F0F0", opacity: 0.4 }}>
              {editContent.length}/1000
            </span>
          </div>
          {editError && (
            <p className="text-xs" style={{ color: "#FF6B6B" }}>
              {editError}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm whitespace-pre-wrap" style={{ color: "#F0F0F0" }}>
            {comment.content}
          </p>
          {isOwner && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleEdit}
                disabled={isPending}
                className="text-xs transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ color: "#FFD94C" }}
              >
                Sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ color: "#F0F0F0", opacity: 0.5 }}
              >
                {isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
