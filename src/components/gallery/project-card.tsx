import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
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
}

export function ProjectCard({
  id,
  title,
  tagline,
  cover_image_url,
  author,
  tags,
}: ProjectCardProps) {
  const initials = author.display_name
    ? author.display_name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <Link
      href={`/projects/${id}`}
      className="group block rounded-xl border border-[#3E5E63] bg-[#214C54] overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 hover:border-[#FFD94C]/50"
    >
      {/* Cover image — 16:9 */}
      <div className="relative w-full aspect-video bg-[#15333B]">
        {cover_image_url ? (
          <Image
            src={cover_image_url}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">🖼</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-[#FDF5DA] font-semibold text-base leading-tight truncate">
            {title}
          </h3>
          <p className="text-[#F0F0F0]/70 text-sm mt-1 line-clamp-2 leading-snug">
            {tagline}
          </p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#3E5E63] text-[#FDF5DA] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[#F0F0F0]/60 text-xs truncate">
            {author.display_name ?? "Ẩn danh"}
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-[#3E5E63] text-[#FFD94C] bg-transparent px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
