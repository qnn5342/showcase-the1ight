import Link from "next/link";
import { ProjectCard } from "@/components/gallery/project-card";

interface FeaturedProject {
  id: string;
  title: string;
  tagline: string;
  cover_image_url: string | null;
  live_url: string;
  author: {
    display_name: string | null;
    avatar_url: string | null;
  };
  tags: string[];
  isWinner?: boolean;
}

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section id="featured" className="px-4 sm:px-6 lg:px-8 pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Heading row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FDF5DA]">
              Dự án nổi bật
            </h2>
            <p className="mt-1 text-sm text-[#F0F0F0]/50">
              Những sản phẩm đáng chú ý nhất từ học viên
            </p>
          </div>
          <Link
            href="#gallery"
            className="text-sm text-[#FFD94C] hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              {project.isWinner && (
                <div className="absolute -top-2 -right-2 z-10 rounded-full bg-[#FFD94C] px-2.5 py-1 text-xs font-bold text-[#15333B] shadow-lg">
                  🏆 Winner
                </div>
              )}
              <ProjectCard
                id={project.id}
                title={project.title}
                tagline={project.tagline}
                cover_image_url={project.cover_image_url}
                live_url={project.live_url}
                author={project.author}
                tags={project.tags}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
