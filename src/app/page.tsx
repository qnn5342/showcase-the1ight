import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/gallery/project-card";
import { ProjectCardSkeleton } from "@/components/gallery/project-card-skeleton";
import { GalleryFilters } from "@/components/gallery/gallery-filters";

interface HomePageProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

async function ProjectGrid({
  tag,
  sort,
}: {
  tag?: string;
  sort?: string;
}) {
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

  const { data: projects, error } = await query;

  if (error) {
    return (
      <p className="text-[#F0F0F0]/60 col-span-full text-center py-12">
        Đã có lỗi xảy ra. Vui lòng thử lại sau.
      </p>
    );
  }

  // Client-side tag filter (Supabase join filter is complex, do it in memory)
  const filtered = tag
    ? (projects ?? []).filter((p) =>
        p.project_tags?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pt: any) => {
            const tagsVal = pt.tags;
            if (!tagsVal) return false;
            if (Array.isArray(tagsVal)) return tagsVal.some((t) => t.name === tag);
            return tagsVal.name === tag;
          }
        )
      )
    : (projects ?? []);

  if (filtered.length === 0) {
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

function ProjectGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag, sort } = await searchParams;

  return (
    <main className="min-h-screen bg-[#15333B] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#FDF5DA] sm:text-4xl">
              Showcase
            </h1>
            <p className="mt-1 text-[#F0F0F0]/60 text-sm sm:text-base">
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
    </main>
  );
}
