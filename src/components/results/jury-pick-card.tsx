import Image from "next/image";

interface JuryPickCardProps {
  project: {
    id: string;
    title: string;
    cover_image_url: string | null;
    author_name: string;
  };
  captainNote: string | null;
}

export function JuryPickCard({ project, captainNote }: JuryPickCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden max-w-2xl mx-auto"
      style={{
        background: "linear-gradient(135deg, #214C54 0%, #1a3e47 100%)",
        border: "2px solid #FFD94C",
        boxShadow: "0 0 40px #FFD94C20",
      }}
    >
      {/* Badge header */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(90deg, #FFD94C20 0%, transparent 100%)",
          borderBottom: "1px solid #FFD94C40",
        }}
      >
        <span className="text-2xl">🎖️</span>
        <div>
          <p
            className="font-bold text-base"
            style={{ color: "#FFD94C" }}
          >
            Jury&apos;s Pick
          </p>
          <p className="text-xs" style={{ color: "#F0F0F0", opacity: 0.6 }}>
            Chọn bởi The Captain
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Cover image */}
        <div className="relative sm:w-64 aspect-video sm:aspect-auto shrink-0 bg-[#15333B]">
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          ) : (
            <div className="flex h-full items-center justify-center min-h-[120px]">
              <span className="text-4xl opacity-20">🖼</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col justify-center gap-3 flex-1">
          <div>
            <h3
              className="font-bold text-xl leading-tight"
              style={{ color: "#FDF5DA" }}
            >
              {project.title}
            </h3>
            <p className="text-sm mt-1" style={{ color: "#F0F0F0", opacity: 0.7 }}>
              {project.author_name}
            </p>
          </div>

          {captainNote && (
            <blockquote
              className="border-l-4 pl-4 italic text-sm leading-relaxed"
              style={{
                borderColor: "#FFD94C",
                color: "#F0F0F0",
                opacity: 0.85,
              }}
            >
              &ldquo;{captainNote}&rdquo;
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}
