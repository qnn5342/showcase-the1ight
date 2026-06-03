import Link from "next/link";
import { ProjectCard } from "@/components/gallery/project-card";
import type { CohortSectionData } from "@/lib/showcase/data";
import { getSeasonPath } from "@/lib/showcase/format";

interface CohortShowcaseSectionProps {
  cohorts: CohortSectionData[];
}

export function CohortShowcaseSection({ cohorts }: CohortShowcaseSectionProps) {
  if (cohorts.length === 0) return null;

  return (
    <section id="seasons" className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#FDF5DA] sm:text-3xl">
              Sản phẩm theo từng lớp
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[#F0F0F0]/60">
              Mỗi lớp có một không gian riêng để xem đúng output của học viên
              trong cohort đó.
            </p>
          </div>
          <Link
            href="#all-projects"
            className="text-sm text-[#FFD94C] transition-opacity hover:opacity-80"
          >
            Xem tất cả dự án →
          </Link>
        </div>

        <div className="space-y-10">
          {cohorts.map((cohort) => (
            <article
              key={cohort.id}
              className="rounded-xl border border-[#3E5E63] bg-[#214C54]/45 p-5 sm:p-6"
            >
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#FFD94C]">
                    {cohort.projectCount} sản phẩm
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#FDF5DA] sm:text-2xl">
                    {cohort.name}
                  </h3>
                  {cohort.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F0F0F0]/65">
                      {cohort.description}
                    </p>
                  )}
                </div>
                <Link
                  href={getSeasonPath(cohort.slug)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#FFD94C] px-4 py-2.5 text-sm font-semibold text-[#15333B] transition-opacity hover:opacity-90"
                >
                  Xem lớp này
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cohort.projects.map((project) => (
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
