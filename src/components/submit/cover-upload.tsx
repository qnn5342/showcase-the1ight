"use client";

import { useCallback, useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

interface CoverUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function CoverUpload({ value, onChange }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh");
        return;
      }

      setError(null);
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
          setError("Bạn cần đăng nhập để upload ảnh.");
          return;
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("project-covers")
          .upload(fileName, compressed, { contentType: compressed.type });

        if (uploadError) {
          setError("Upload thất bại. Thử lại sau.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-covers").getPublicUrl(fileName);

        onChange(publicUrl);
      } catch {
        setError("Có lỗi xảy ra khi upload ảnh.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-[#3E5E63]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`relative flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-[#FFD94C] bg-[#FFD94C]/5"
              : "border-[#3E5E63] hover:border-[#4E8770] bg-[#214C54]/30"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#F0F0F0]/60">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Đang upload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#F0F0F0]/50 pointer-events-none">
              <Upload className="w-8 h-8" />
              <span className="text-sm">
                Kéo thả hoặc click để chọn ảnh bìa
              </span>
              <span className="text-xs">PNG, JPG, WebP — tối đa 2MB</span>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
