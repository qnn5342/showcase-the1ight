import Link from "next/link";
import { Suspense } from "react";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { ProjectCard } from "@/components/gallery/project-card";
import { ProjectCardSkeleton } from "@/components/gallery/project-card-skeleton";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { CohortShowcaseSection } from "@/components/landing/cohort-showcase-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import {
  getHomepageShowcaseData,
  getPublishedProjects,
} from "@/lib/showcase/data";

interface HomePageProps {
  searchParams: Promise<{ tag?: string; sort?: string }>;
}

async function ProjectGrid({ tag, sort }: { tag?: string; sort?: string }) {
  const projects = await getPublishedProjects({ tag, sort });

  if (projects.length === 0) return <EmptyState />;

  return (
    <>
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
    </>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20">
      <p className="text-lg text-[#F0F0F0]/50">Chưa có dự án nào.</p>
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tag, sort } = await searchParams;
  const {
    studentCount,
    projectCount,
    awardCount,
    featuredProjects,
    cohortSections,
  } = await getHomepageShowcaseData();

  return (
    <main className="min-h-screen bg-[#15333B]">
      <HeroSection studentCount={studentCount} projectCount={projectCount} />

      <StatsBar
        studentCount={studentCount}
        projectCount={projectCount}
        awardCount={awardCount}
      />

      <FeaturedProjects projects={featuredProjects} />

      <CohortShowcaseSection cohorts={cohortSections} />

      <section id="all-projects" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#FDF5DA] sm:text-3xl">
                Tất cả dự án
              </h2>
              <p className="mt-1 text-sm text-[#F0F0F0]/60">
                Browse toàn bộ sản phẩm từ học viên The1ight
              </p>
            </div>
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg bg-[#FFD94C] px-4 py-2.5 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90 sm:mt-0 sm:self-auto"
            >
              <span>+</span> Nộp dự án
            </Link>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <GalleryFilters />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={<ProjectGridSkeleton />}>
              <ProjectGrid tag={tag} sort={sort} />
            </Suspense>
          </div>
        </div>
      </section>

      <CtaSection />

      <Footer />
    </main>
  );
}
