import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { EditProfileForm } from "@/components/me/edit-profile-form";
import { MyVotesSummary } from "@/components/me/my-votes-summary";

export const metadata = { title: "Hồ sơ của bạn — Showcase The1ight" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  published: "Published",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-[#3E5E63] text-[#F0F0F0]",
  published: "bg-[#FFD94C]/20 text-[#FFD94C] border-[#FFD94C]/40",
};

export default async function MePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, bio, github_url, linkedin_url, website_url, cohort_slug, can_vote")
    .eq("id", user.id)
    .single();

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch active cohort to scope votes
  const { data: activeCohort } = await supabase
    .from("cohorts")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch votes with project titles
  type VoteRow = { category: "most_loved" | "most_creative" | "best_execution"; project_title: string | null };
  let votes: VoteRow[] = [];

  if (activeCohort) {
    const { data: rawVotes } = await supabase
      .from("votes")
      .select("category, projects(title)")
      .eq("voter_id", user.id)
      .eq("cohort_id", activeCohort.id);

    if (rawVotes) {
      votes = rawVotes.map((v) => ({
        category: v.category as VoteRow["category"],
        project_title: (v.projects as unknown as { title: string } | null)?.title ?? null,
      }));
    }
  }

  const displayName = profile?.display_name ?? user.email ?? "User";
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={72}
            height={72}
            className="rounded-full ring-2 ring-[#3E5E63]"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#214C54] ring-2 ring-[#3E5E63] text-2xl font-bold text-[#FFD94C]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#FDF5DA" }}>
            {displayName}
          </h1>
          {profile?.bio && (
            <p className="text-sm text-[#F0F0F0]/70 mt-0.5">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* My Projects */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: "#FDF5DA" }}>
            Dự án của bạn
          </h2>
          <Link
            href="/submit"
            className="inline-flex items-center gap-1 rounded-lg bg-[#FFD94C] px-3 py-1.5 text-xs font-semibold text-[#15333B] transition-opacity hover:opacity-90"
          >
            + Nộp dự án
          </Link>
        </div>
        {!projects || projects.length === 0 ? (
          <p className="text-sm text-[#F0F0F0]/50">
            Bạn chưa nộp dự án nào.{" "}
            <Link href="/submit" className="text-[#FFD94C] hover:underline">
              Nộp ngay
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="flex items-center justify-between rounded-lg border border-[#3E5E63] bg-[#214C54]/50 px-4 py-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-medium text-[#F0F0F0] flex-1 hover:text-[#FFD94C] transition-colors"
                  >
                    {project.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs border ${STATUS_COLOR[project.status] ?? "bg-[#3E5E63] text-[#F0F0F0]"}`}
                    >
                      {STATUS_LABEL[project.status] ?? project.status}
                    </Badge>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="text-xs text-[#FFD94C] hover:underline"
                    >
                      Sửa
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My Votes */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "#FDF5DA" }}>
          Phiếu bầu của bạn
        </h2>
        {profile?.can_vote ? (
          <MyVotesSummary votes={votes} />
        ) : (
          <p className="text-sm text-[#F0F0F0]/50">
            Tài khoản của bạn chưa được kích hoạt quyền vote.
          </p>
        )}
      </section>

      {/* Edit Profile — collapsible */}
      <details className="rounded-xl border border-[#3E5E63] bg-[#214C54]">
        <summary className="cursor-pointer px-6 py-4 text-lg font-semibold select-none" style={{ color: "#FDF5DA" }}>
          Chỉnh sửa hồ sơ
        </summary>
        <div className="px-6 pb-6 pt-2">
          <EditProfileForm
            defaultValues={{
              bio: profile?.bio ?? "",
              github_url: profile?.github_url ?? "",
              linkedin_url: profile?.linkedin_url ?? "",
              website_url: profile?.website_url ?? "",
            }}
          />
        </div>
      </details>
    </div>
  );
}
