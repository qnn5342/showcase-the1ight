"use client";

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { addDevlogEntry } from "@/lib/actions/devlog";
import { Loader2 } from "lucide-react";

interface AddDevlogEntryProps {
  projectId: string;
}

type EntryType = "text" | "image" | "milestone";

const TYPE_LABELS: Record<EntryType, string> = {
  text: "Ghi chú",
  image: "Hình ảnh",
  milestone: "Cột mốc",
};

export function AddDevlogEntry({ projectId }: AddDevlogEntryProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EntryType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Chỉ chấp nhận file ảnh");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUploadError("Bạn cần đăng nhập để upload ảnh.");
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `devlog-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("project-covers")
        .upload(fileName, compressed, { contentType: compressed.type });
      if (uploadError) {
        setUploadError("Upload thất bại. Thử lại sau.");
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("project-covers").getPublicUrl(fileName);
      setImageUrl(publicUrl);
    } catch {
      setUploadError("Có lỗi xảy ra khi upload ảnh.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tiêu đề không được để trống.");
      return;
    }
    if (type === "image" && !imageUrl) {
      setError("Vui lòng upload ảnh trước khi lưu.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await addDevlogEntry(projectId, {
      type,
      title: title.trim(),
      content: content.trim() || undefined,
      image_url: imageUrl || undefined,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    // Reset
    setOpen(false);
    setTitle("");
    setContent("");
    setImageUrl("");
    setType("text");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        style={{
          backgroundColor: "#214C54",
          color: "#FFD94C",
          border: "1px solid #3E5E63",
        }}
      >
        <span>+ Thêm devlog entry</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-5 space-y-4"
      style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
    >
      <h3 className="font-semibold text-sm" style={{ color: "#FDF5DA" }}>
        Thêm devlog entry mới
      </h3>

      {/* Type selector */}
      <div className="flex gap-2">
        {(["text", "image", "milestone"] as EntryType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: type === t ? "#FFD94C" : "#15333B",
              color: type === t ? "#15333B" : "#F0F0F0",
              border: `1px solid ${type === t ? "#FFD94C" : "#3E5E63"}`,
            }}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Tiêu đề *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "#15333B",
            color: "#F0F0F0",
            border: "1px solid #3E5E63",
          }}
        />
      </div>

      {/* Content (text + milestone) */}
      {(type === "text" || type === "milestone") && (
        <div>
          <textarea
            placeholder="Mô tả (không bắt buộc)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              backgroundColor: "#15333B",
              color: "#F0F0F0",
              border: "1px solid #3E5E63",
            }}
          />
        </div>
      )}

      {/* Image upload */}
      {type === "image" && (
        <div className="space-y-2">
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-[#3E5E63]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full px-2 py-0.5 text-xs"
              >
                Xóa
              </button>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
              style={{ borderColor: "#3E5E63", backgroundColor: "#15333B" }}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
              {uploading ? (
                <div className="flex items-center gap-2 text-sm" style={{ color: "#F0F0F0", opacity: 0.6 }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang upload...</span>
                </div>
              ) : (
                <span className="text-sm" style={{ color: "#F0F0F0", opacity: 0.5 }}>
                  Click để chọn ảnh
                </span>
              )}
            </label>
          )}
          {uploadError && <p className="text-red-400 text-xs">{uploadError}</p>}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTitle("");
            setContent("");
            setImageUrl("");
            setError(null);
          }}
          className="px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-70"
          style={{ color: "#F0F0F0", opacity: 0.6 }}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
        >
          {submitting ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
