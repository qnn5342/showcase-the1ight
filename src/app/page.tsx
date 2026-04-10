import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/gallery/project-card";
import { ProjectCardSkeleton } from "@/components/gallery/project-card-skeleton";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

interface HomePageProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

// ─── Gallery Grid (unchanged logic) ───────────────────────────────────────────

async function ProjectGrid({ tag, sort }: { tag?: string; sort?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(
      `
      id,
      title,
      tagline,
      cover_image_url,
      live_url,
      created_at,
      profiles (
        id,
        display_name,
        avatar_url
      ),
      project_tags (
        tags (
          name
        )
      )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: sort === "oldest" });

  if (tag) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tag)
      .single();

    if (!tagRow) {
      return <EmptyState />;
    }

    const { data: taggedIds } = await supabase
      .from("project_tags")
      .select("project_id")
      .eq("tag_id", tagRow.id);

    const ids = (taggedIds ?? []).map((r) => r.project_id);
    if (ids.length === 0) return <EmptyState />;
    query = query.in("id", ids);
  }

  const { data: projects, error } = await query;

  if (error) {
    return (
      <p className="text-[#F0F0F0]/60 col-span-full text-center py-12">
        Đã có lỗi xảy ra. Vui lòng thử lại sau.
      </p>
    );
  }

  const filtered = projects ?? [];
  if (filtered.length === 0) return <EmptyState />;

  return (
    <>
      {filtered.map((project) => {
        const author = Array.isArray(project.profiles)
          ? project.profiles[0]
          : project.profiles;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tags = (project.project_tags ?? []).flatMap((pt: any) => {
          const tagsVal = pt.tags;
          if (!tagsVal) return [];
          if (Array.isArray(tagsVal)) return tagsVal.map((t) => t.name as string);
          return [tagsVal.name as string];
        });

        return (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            tagline={project.tagline}
            cover_image_url={project.cover_image_url ?? null}
            live_url={project.live_url}
            author={{
              display_name: author?.display_name ?? null,
              avatar_url: author?.avatar_url ?? null,
            }}
            tags={tags}
          />
        );
      })}
    </>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20">
      <p className="text-[#F0F0F0]/50 text-lg">Chưa có dự án nào.</p>
      <Link
        href="/submit"
        className="rounded-lg bg-[#FFD94C] px-5 py-2.5 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90"
      >
        Nộp dự án đầu tiên
      </Link>
    </div>
  );
}

function ProjectGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag, sort } = await searchParams;
  const supabase = await createClient();

  // Fetch stats
  const [profilesRes, projectsRes, awardsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("voting_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "revealed"),
  ]);

  const studentCount = profilesRes.count ?? 0;
  const projectCount = projectsRes.count ?? 0;
  const awardCount = awardsRes.count ?? 0;

  // Fetch featured projects: winners first, fallback to most recent 3
  let featuredProjects: {
    id: string;
    title: string;
    tagline: string;
    cover_image_url: string | null;
    live_url: string;
    author: { display_name: string | null; avatar_url: string | null };
    tags: string[];
    isWinner?: boolean;
  }[] = [];

  // Try to get winners from public_vote_counts or recent published projects
  const { data: recentProjects } = await supabase
    .from("projects")
    .select(
      `
      id,
      title,
      tagline,
      cover_image_url,
      live_url,
      profiles (
        display_name,
        avatar_url
      ),
      project_tags (
        tags (
          name
        )
      )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  if (recentProjects) {
    featuredProjects = recentProjects.map((project) => {
      const author = Array.isArray(project.profiles)
        ? project.profiles[0]
        : project.profiles;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tags = (project.project_tags ?? []).flatMap((pt: any) => {
        const tagsVal = pt.tags;
        if (!tagsVal) return [];
        if (Array.isArray(tagsVal)) return tagsVal.map((t) => t.name as string);
        return [tagsVal.name as string];
      });

      return {
        id: project.id,
        title: project.title,
        tagline: project.tagline,
        cover_image_url: project.cover_image_url ?? null,
        live_url: project.live_url,
        author: {
          display_name: author?.display_name ?? null,
          avatar_url: author?.avatar_url ?? null,
        },
        tags,
      };
    });
  }

  return (
    <main className="min-h-screen bg-[#15333B]">
      {/* Hero */}
      <HeroSection studentCount={studentCount} projectCount={projectCount} />

      {/* Stats */}
      <StatsBar
        studentCount={studentCount}
        projectCount={projectCount}
        awardCount={awardCount}
      />

      {/* Featured */}
      <FeaturedProjects projects={featuredProjects} />

      {/* Gallery Section */}
      <section id="gallery" className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-6xl">
          {/* Gallery heading */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#FDF5DA]">
                Tất cả dự án
              </h2>
              <p className="mt-1 text-[#F0F0F0]/60 text-sm">
                Dự án từ học viên The1ight
              </p>
            </div>
            <Link
              href="/submit"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 rounded-lg bg-[#FFD94C] px-4 py-2.5 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90 self-start sm:self-auto"
            >
              <span>+</span> Nộp dự án
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <GalleryFilters />
            </Suspense>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={<ProjectGridSkeleton />}>
              <ProjectGrid tag={tag} sort={sort} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CtaSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
