import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#3E5E63] bg-[#214C54] overflow-hidden">
      {/* Cover image placeholder */}
      <Skeleton className="w-full aspect-video bg-[#15333B]" />

      <div className="p-4 flex flex-col gap-3">
        {/* Title + tagline */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4 bg-[#3E5E63]" />
          <Skeleton className="h-4 w-full bg-[#3E5E63]" />
          <Skeleton className="h-4 w-2/3 bg-[#3E5E63]" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full bg-[#3E5E63]" />
          <Skeleton className="h-3 w-24 bg-[#3E5E63]" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full bg-[#3E5E63]" />
          <Skeleton className="h-5 w-16 rounded-full bg-[#3E5E63]" />
        </div>
      </div>
    </div>
  );
}
