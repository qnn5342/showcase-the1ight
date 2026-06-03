import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { ProjectCard } from "@/components/gallery/project-card";
import { StatsBar } from "@/components/landing/stats-bar";
import { Footer } from "@/components/landing/footer";
import {
  getCohortBySlug,
  getPublishedProjects,
  type CohortData,
  type ProjectCardData,
} from "@/lib/showcase/data";

interface SeasonPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

export async function generateMetadata({
  params,
}: SeasonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cohort = await getCohortBySlug(slug);

  if (!cohort) {
    return { title: "Không tìm thấy lớp - Showcase The1ight" };
  }

  return {
    title: `${cohort.name} - Showcase The1ight`,
    description:
      cohort.description ??
      `Sản phẩm học viên ${cohort.name} trên Showcase The1ight.`,
  };
}

export default async function SeasonPage({
  params,
  searchParams,
}: SeasonPageProps) {
  const [{ slug }, { tag, sort }] = await Promise.all([params, searchParams]);
  const cohort = await getCohortBySlug(slug);

  if (!cohort) {
    notFound();
  }

  const [projects, allCohortProjects] = await Promise.all([
    getPublishedProjects({ cohortId: cohort.id, tag, sort }),
    getPublishedProjects({ cohortId: cohort.id, sort: "newest" }),
  ]);

  const studentCount = new Set(
    allCohortProjects.map((project) => project.author.id).filter(Boolean)
  ).size;

  return (
    <main className="min-h-screen bg-[#15333B]">
      <SeasonHero cohort={cohort} projectCount={allCohortProjects.length} />

      <StatsBar
        studentCount={studentCount}
        projectCount={allCohortProjects.length}
        awardCount={0}
      />

      <section id="projects" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#FDF5DA] sm:text-3xl">
                Sản phẩm của {cohort.name}
              </h2>
              <p className="mt-1 text-sm text-[#F0F0F0]/60">
                Các sản phẩm đã được học viên hoàn thiện và publish công khai.
              </p>
            </div>
            <Link
              href="/#seasons"
              className="mt-4 inline-flex self-start rounded-lg border border-[#3E5E63] px-4 py-2.5 text-sm font-semibold text-[#F0F0F0] transition-colors hover:border-[#FFD94C]/60 hover:text-[#FFD94C] sm:mt-0 sm:self-auto"
            >
              Xem các lớp khác
            </Link>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <GalleryFilters />
            </Suspense>
          </div>

          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <EmptyState cohort={cohort} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SeasonHero({
  cohort,
  projectCount,
}: {
  cohort: CohortData;
  projectCount: number;
}) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-semibold text-[#FFD94C] transition-opacity hover:opacity-80"
        >
          ← Showcase The1ight
        </Link>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#FFD94C]">
            {projectCount} sản phẩm học viên
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#FDF5DA] sm:text-5xl">
            {cohort.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#F0F0F0]/70 sm:text-lg">
            {cohort.description ??
              "Một không gian riêng để xem các sản phẩm học viên đã build, deploy và chia sẻ công khai sau lớp."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="rounded-xl bg-[#FFD94C] px-6 py-3 text-sm font-bold text-[#15333B] transition-opacity hover:opacity-90"
            >
              Xem sản phẩm
            </a>
            <Link
              href={`/results/${cohort.slug}`}
              className="rounded-xl border border-[#3E5E63] px-6 py-3 text-sm font-semibold text-[#F0F0F0] transition-colors hover:border-[#FFD94C]/60 hover:text-[#FFD94C]"
            >
              Xem kết quả bình chọn
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectGrid({ projects }: { projects: ProjectCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          tagline={project.tagline}
          cover_image_url={project.cover_image_url}
          live_url={project.live_url}
          author={project.author}
          tags={project.tags}
        />
      ))}
    </div>
  );
}

function EmptyState({ cohort }: { cohort: CohortData }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[#3E5E63] bg-[#214C54]/45 px-6 py-16 text-center">
      <p className="text-lg font-semibold text-[#FDF5DA]">
        Chưa có dự án nào trong {cohort.name}.
      </p>
      <p className="max-w-md text-sm text-[#F0F0F0]/60">
        Hiện lớp này chưa có sản phẩm công khai.
      </p>
      <Link
        href="/submit"
        className="rounded-lg bg-[#FFD94C] px-5 py-2.5 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90"
      >
        Nộp dự án
      </Link>
    </div>
  );
}
