import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { WinnerColumn } from "@/components/results/winner-column";
import { JuryPickCard } from "@/components/results/jury-pick-card";
import { DownloadHighlightButton } from "@/components/results/download-highlight-button";

interface Props {
  params: Promise<{ cohort: string }>;
}

type Category = "most_loved" | "most_creative" | "best_execution";

interface ProjectData {
  id: string;
  title: string;
  cover_image_url: string | null;
  author_name: string;
  vote_count: number;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cohort } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("cohorts")
    .select("name")
    .eq("slug", cohort)
    .single();

  return {
    title: data ? `Kết quả — ${data.name}` : "Kết quả Showcase",
    description: data
      ? `Bảng kết quả bình chọn Showcase ${data.name}`
      : "Bảng kết quả Showcase The1ight",
  };
}

export default async function ResultsPage({ params }: Props) {
  const { cohort: cohortSlug } = await params;
  const supabase = await createClient();

  // 1. Fetch cohort
  const { data: cohortData } = await supabase
    .from("cohorts")
    .select("id, name, slug")
    .eq("slug", cohortSlug)
    .single();

  if (!cohortData) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#15333B", color: "#F0F0F0" }}
      >
        <div className="text-center space-y-3">
          <p className="text-4xl">🔍</p>
          <h1 className="text-2xl font-bold" style={{ color: "#FDF5DA" }}>
            Không tìm thấy cohort
          </h1>
        </div>
      </main>
    );
  }

  // 2. Check voting session status
  const { data: votingSession } = await supabase
    .from("voting_sessions")
    .select("status")
    .eq("cohort_id", cohortData.id)
    .single();

  const isRevealed = votingSession?.status === "revealed";

  if (!isRevealed) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#15333B", color: "#F0F0F0" }}
      >
        <div
          className="text-center space-y-4 max-w-md p-8 rounded-2xl"
          style={{ backgroundColor: "#214C54", border: "1px solid #3E5E63" }}
        >
          <p className="text-5xl">🔒</p>
          <h1 className="text-2xl font-bold" style={{ color: "#FDF5DA" }}>
            Kết quả chưa được công bố
          </h1>
          <p className="text-sm" style={{ color: "#F0F0F0", opacity: 0.7 }}>
            Kết quả bình chọn của {cohortData.name} sẽ được công bố sớm.
            Hãy theo dõi The1ight để không bỏ lỡ.
          </p>
        </div>
      </main>
    );
  }

  // 3. Fetch all data in parallel
  const [voteCounts, projectsData, juryPickData] = await Promise.all([
    supabase
      .from("public_vote_counts")
      .select("project_id, category, vote_count")
      .eq("cohort_id", cohortData.id),
    supabase
      .from("projects")
      .select(
        `
        id,
        title,
        cover_image_url,
        status,
        profiles:owner_id (
          display_name,
          avatar_url
        )
      `
      )
      .eq("cohort_id", cohortData.id)
      .eq("status", "published"),
    supabase
      .from("jury_picks")
      .select("project_id, note")
      .eq("cohort_id", cohortData.id)
      .maybeSingle(),
  ]);

  // 4. Build a map of project info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectMap = new Map<string, { title: string; cover_image_url: string | null; author_name: string }>();
  for (const p of projectsData.data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : (p.profiles as any);
    projectMap.set(p.id, {
      title: p.title,
      cover_image_url: p.cover_image_url ?? null,
      author_name: profile?.display_name ?? "Ẩn danh",
    });
  }

  // 5. Compute winner + runner-up per category
  const categories: Category[] = ["most_loved", "most_creative", "best_execution"];

  function getTopTwo(category: Category): { winner: ProjectData | null; runnerUp: ProjectData | null } {
    const rows = (voteCounts.data ?? [])
      .filter((r) => r.category === category)
      .map((r) => ({
        ...r,
        project: projectMap.get(r.project_id),
      }))
      .filter((r) => r.project !== undefined)
      .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));

    const toProjectData = (r: typeof rows[0]): ProjectData => ({
      id: r.project_id,
      title: r.project!.title,
      cover_image_url: r.project!.cover_image_url,
      author_name: r.project!.author_name,
      vote_count: r.vote_count ?? 0,
    });

    return {
      winner: rows[0] ? toProjectData(rows[0]) : null,
      runnerUp: rows[1] ? toProjectData(rows[1]) : null,
    };
  }

  const results = {
    most_loved: getTopTwo("most_loved"),
    most_creative: getTopTwo("most_creative"),
    best_execution: getTopTwo("best_execution"),
  };

  // 6. Jury pick project
  const juryPick = juryPickData.data;
  const juryProject = juryPick ? projectMap.get(juryPick.project_id) : null;

  // 7. All participants (for the grid at bottom)
  const allParticipants = (projectsData.data ?? []).map((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : (p.profiles as any);
    return {
      id: p.id,
      title: p.title,
      cover_image_url: p.cover_image_url ?? null,
      author_name: profile?.display_name ?? "Ẩn danh",
    };
  });

  // Determine award per project for highlight card
  function getAward(projectId: string) {
    if (juryPick?.project_id === projectId) return "jury_pick" as const;
    if (results.most_loved.winner?.id === projectId) return "most_loved" as const;
    if (results.most_creative.winner?.id === projectId) return "most_creative" as const;
    if (results.best_execution.winner?.id === projectId) return "best_execution" as const;
    return "participant" as const;
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#15333B", color: "#F0F0F0" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Hero heading */}
        <div className="text-center space-y-3">
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#FFD94C" }}
          >
            Kết quả bình chọn
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black leading-tight"
            style={{ color: "#FDF5DA" }}
          >
            {cohortData.name}
          </h1>
          <p className="text-base" style={{ color: "#F0F0F0", opacity: 0.65 }}>
            Tổng hợp kết quả bình chọn từ cộng đồng The1ight
          </p>
        </div>

        {/* 3 Winner columns */}
        <section>
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: "#FDF5DA" }}
          >
            🏆 Người chiến thắng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <WinnerColumn
                key={cat}
                category={cat}
                winner={results[cat].winner}
                runnerUp={results[cat].runnerUp}
              />
            ))}
          </div>
        </section>

        {/* Jury pick */}
        {juryPick && juryProject && (
          <section>
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: "#FDF5DA" }}
            >
              🎖️ Jury&apos;s Pick
            </h2>
            <JuryPickCard
              project={{
                id: juryPick.project_id,
                ...juryProject,
              }}
              captainNote={juryPick.note ?? null}
            />
          </section>
        )}

        {/* All participants */}
        <section>
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: "#FDF5DA" }}
          >
            👥 Tất cả dự án ({allParticipants.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allParticipants.map((project) => {
              const award = getAward(project.id);
              const isWinner = award !== "participant";
              return (
                <div
                  key={project.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "#214C54",
                    border: isWinner ? "1px solid #FFD94C" : "1px solid #3E5E63",
                  }}
                >
                  {/* Cover */}
                  <div className="relative w-full aspect-video bg-[#15333B]">
                    {project.cover_image_url ? (
                      <Image
                        src={project.cover_image_url}
                        alt={project.title}
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
                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3
                        className="font-semibold text-sm leading-tight truncate"
                        style={{ color: "#FDF5DA" }}
                      >
                        {project.title}
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#F0F0F0", opacity: 0.6 }}
                      >
                        {project.author_name}
                      </p>
                    </div>
                    {/* Download button */}
                    <DownloadHighlightButton
                      project={project}
                      cohortName={cohortData.name}
                      award={award}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
