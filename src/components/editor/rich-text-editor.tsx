"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImagePlus,
  Minus,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

async function uploadImage(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Bạn cần đăng nhập để upload ảnh.");

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(fileName, compressed, { contentType: compressed.type });

  if (error) throw new Error("Upload thất bại.");

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(fileName);

  return publicUrl;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#FFD94C] underline",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[200px] p-4 focus:outline-none",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;
        const file = event.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) {
          event.preventDefault();
          handleImageInsert(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) handleImageInsert(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageInsert = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // silently fail — could add toast here
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const handleToolbarImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageInsert(file);
    e.target.value = "";
  };

  const handleLink = () => {
    if (!editor) return;
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "#3E5E63", backgroundColor: "#15333B" }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 p-2 border-b"
        style={{ borderColor: "#3E5E63", backgroundColor: "#214C54" }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={handleLink} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={handleToolbarImage}
          title="Insert Image"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {uploading && (
        <div
          className="px-4 py-2 text-xs flex items-center gap-2"
          style={{ color: "#FFD94C" }}
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang upload ảnh...
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded transition-colors disabled:opacity-50"
      style={{
        backgroundColor: active ? "#FFD94C" : "transparent",
        color: active ? "#15333B" : "#F0F0F0",
      }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      className="w-px h-5 mx-1"
      style={{ backgroundColor: "#3E5E63" }}
    />
  );
}
