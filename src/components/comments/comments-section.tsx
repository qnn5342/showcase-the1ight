import { createClient } from "@/lib/supabase/server";
import { AddComment } from "./add-comment";

interface CommentsSectionProps {
  projectId: string;
}

export async function CommentsSection({ projectId }: CommentsSectionProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      is_hidden,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("project_id", projectId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  // Get current user's profile if logged in
  let currentUserName: string | null = null;
  let currentUserAvatar: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    currentUserName = profile?.display_name ?? null;
    currentUserAvatar = profile?.avatar_url ?? null;
  }

  // Normalize comments shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedComments = (comments ?? []).map((c: any) => {
    const author = Array.isArray(c.author) ? c.author[0] : c.author;
    return {
      id: c.id as string,
      content: c.content as string,
      created_at: c.created_at as string,
      is_hidden: c.is_hidden as boolean,
      author: {
        id: (author?.id ?? "") as string,
        display_name: (author?.display_name ?? null) as string | null,
        avatar_url: (author?.avatar_url ?? null) as string | null,
      },
    };
  });

  return (
    <AddComment
      projectId={projectId}
      currentUserId={user?.id ?? null}
      currentUserName={currentUserName}
      currentUserAvatar={currentUserAvatar}
      initialComments={normalizedComments}
    />
  );
}
