import { createClient } from "@/lib/supabase/server";
import { DevlogEntry } from "./devlog-entry";
import { AddDevlogEntry } from "./add-devlog-entry";

interface DevlogSectionProps {
  projectId: string;
  projectOwnerId: string;
}

export async function DevlogSection({ projectId, projectOwnerId }: DevlogSectionProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("devlog_entries")
    .select("id, type, title, content, image_url, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const isOwner = !!user && user.id === projectOwnerId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedEntries = (entries ?? []).map((e: any) => ({
    id: e.id as string,
    type: e.type as "text" | "image" | "milestone",
    title: e.title as string,
    content: e.content as string | null,
    image_url: e.image_url as string | null,
    created_at: e.created_at as string,
  }));

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="mb-6">
          <AddDevlogEntry projectId={projectId} />
        </div>
      )}

      {normalizedEntries.length === 0 ? (
        <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.5 }}>
          Chưa có devlog nào. {isOwner ? "Hãy thêm entry đầu tiên!" : ""}
        </p>
      ) : (
        <div>
          {normalizedEntries.map((entry, index) => (
            <DevlogEntry
              key={entry.id}
              entry={entry}
              projectId={projectId}
              isOwner={isOwner}
              isLast={index === normalizedEntries.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
