import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { AboutTab } from "./about-tab";
import { CommentsSection } from "@/components/comments/comments-section";
import { DevlogSection } from "@/components/devlog/devlog-section";
import { VotePanel } from "@/components/voting/vote-panel";
import { VoteBottomBar } from "@/components/voting/vote-bottom-bar";
import { getUserVotes } from "@/lib/actions/votes";
import { OfflineBadge } from "@/components/projects/offline-badge";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      id,
      owner_id,
      cohort_id,
      title,
      tagline,
      description,
      cover_image_url,
      live_url,
      github_url,
      status,
      is_offline,
      created_at,
      profiles:owner_id (
        id,
        display_name,
        avatar_url,
        cohort_slug
      ),
      project_tags (
        tags (
          name
        )
      )
    `
    )
    .eq("id", id)
    .single();

  return project;
}

async function getCounts(id: string) {
  const supabase = await createClient();

  const [{ count: commentsCount }, { count: devlogCount }] = await Promise.all([
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id),
    supabase
      .from("devlog_entries")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id),
  ]);

  return {
    comments: commentsCount ?? 0,
    devlogs: devlogCount ?? 0,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return { title: "Không tìm thấy dự án" };
  }

  return {
    title: project.title,
    description: project.tagline ?? project.description?.slice(0, 160),
    openGraph: {
      title: project.title,
      description: project.tagline ?? project.description?.slice(0, 160) ?? "",
      images: [
        {
          url: `/api/og?type=project&title=${encodeURIComponent(project.title)}&author=${encodeURIComponent((project.profiles as { display_name?: string | null } | null)?.display_name ?? "")}&cover=${encodeURIComponent(project.cover_image_url ?? "")}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  // Hide draft projects from non-owners
  if (project.status === "draft" && project.owner_id !== user?.id) {
    notFound();
  }

  const counts = await getCounts(id);

  // Voting data
  const cohortId = project.cohort_id;

  const [profileData, votingSession] = await Promise.all([
    supabase
      .from("profiles")
      .select("can_vote")
      .eq("id", user?.id ?? "")
      .maybeSingle(),
    cohortId
      ? supabase
          .from("voting_sessions")
          .select("status")
          .eq("cohort_id", cohortId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const canVote = profileData.data?.can_vote ?? false;
  const sessionStatus = votingSession.data?.status ?? null;
  const userVotes = cohortId ? await getUserVotes(cohortId) : [];

  // Extract tags
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags: string[] = (project.project_tags ?? [])
    .map((pt: any) => {
      const t = pt.tags;
      if (!t) return undefined;
      if (Array.isArray(t)) return t[0]?.name as string | undefined;
      return t.name as string | undefined;
    })
    .filter(Boolean) as string[];

  // Extract profile — Supabase returns single object or array depending on relation
  const profile = Array.isArray(project.profiles)
    ? project.profiles[0]
    : project.profiles;

  const authorName = profile?.display_name ?? "Unknown";
  const authorAvatar = profile?.avatar_url ?? "";
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#15333B", color: "#F0F0F0" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex gap-8 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                style={{
                  backgroundColor: "#214C54",
                  color: "#FFD94C",
                  border: "1px solid #3E5E63",
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          className="text-4xl font-bold leading-tight"
          style={{ color: "#FDF5DA" }}
        >
          {project.title}
        </h1>

        {/* Tagline */}
        {project.tagline && (
          <p className="text-lg" style={{ color: "#F0F0F0", opacity: 0.75 }}>
            {project.tagline}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback
              style={{ backgroundColor: "#214C54", color: "#FFD94C" }}
            >
              {authorInitial}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium" style={{ color: "#F0F0F0" }}>
            {authorName}
          </span>
          <Badge
            style={{
              backgroundColor: "#4E8770",
              color: "#FDF5DA",
              border: "none",
            }}
          >
            Batch 3
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap items-center">
          {user?.id === project.owner_id && (
            <Link
              href={`/projects/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                borderColor: "#FFD94C",
                color: "#FFD94C",
                backgroundColor: "transparent",
              }}
            >
              Chỉnh sửa
            </Link>
          )}
          {project.live_url && !project.is_offline && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FFD94C", color: "#15333B" }}
            >
              Xem demo →
            </a>
          )}
          {project.is_offline && <OfflineBadge />}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                borderColor: "#3E5E63",
                color: "#F0F0F0",
                backgroundColor: "transparent",
              }}
            >
              GitHub
            </a>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList
            style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
          >
            <TabsTrigger
              value="about"
              className="data-[state=active]:text-[#FFD94C]"
            >
              Giới thiệu
            </TabsTrigger>
            <TabsTrigger
              value="devlog"
              className="data-[state=active]:text-[#FFD94C]"
            >
              Devlog ({counts.devlogs})
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:text-[#FFD94C]"
            >
              Bình luận ({counts.comments})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <AboutTab content={project.description ?? ""} />
          </TabsContent>

          <TabsContent value="devlog" className="mt-6">
            <DevlogSection
              projectId={id}
              projectOwnerId={project.owner_id}
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentsSection projectId={id} />
          </TabsContent>
        </Tabs>
      </div>
      {/* Right sidebar — VotePanel */}
      {user && sessionStatus === "open" && (
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
          <VotePanel
            projectId={id}
            projectOwnerId={project.owner_id}
            currentUserId={user?.id ?? null}
            canVote={canVote}
            sessionStatus={sessionStatus}
            userVotes={userVotes}
          />
        </aside>
      )}
      </div>
      {/* Mobile VotePanel — below hero */}
      {user && sessionStatus === "open" && (
        <div className="lg:hidden mt-6">
          <VotePanel
            projectId={id}
            projectOwnerId={project.owner_id}
            currentUserId={user?.id ?? null}
            canVote={canVote}
            sessionStatus={sessionStatus}
            userVotes={userVotes}
          />
        </div>
      )}
      </div>
      {/* Vote bottom bar */}
      {user && sessionStatus === "open" && (
        <VoteBottomBar userVotes={userVotes} />
      )}
    </main>
  );
}
