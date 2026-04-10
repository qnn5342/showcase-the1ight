"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { hideComment } from "@/lib/actions/comment";
import { toast } from "sonner";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  project_id: string;
  author_id: string;
  profiles: { display_name: string | null } | { display_name: string | null }[] | null;
};

export function CommentsTab({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{ color: "#FDF5DA" }}>
        Bình Luận Gần Đây ({comments.length})
      </h2>
      {comments.length === 0 && (
        <p style={{ color: "#9ca3af" }}>Không có bình luận nào.</p>
      )}
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const [isPending, startTransition] = useTransition();

  function handleHide() {
    startTransition(async () => {
      const result = await hideComment(comment.id, comment.project_id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Đã ẩn bình luận.");
      }
    });
  }

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-lg border p-3"
      style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: "#FFD94C" }}>
          {(Array.isArray(comment.profiles) ? comment.profiles[0]?.display_name : comment.profiles?.display_name) ?? "Ẩn danh"}
        </p>
        <p
          className="mt-1 line-clamp-3 text-sm"
          style={{ color: "#F0F0F0" }}
        >
          {comment.content}
        </p>
        <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>
          {new Date(comment.created_at).toLocaleString("vi-VN")} · project:{" "}
          {comment.project_id.slice(0, 8)}...
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleHide}
        disabled={isPending}
        className="shrink-0"
      >
        {isPending ? "..." : "Ẩn"}
      </Button>
    </div>
  );
}
