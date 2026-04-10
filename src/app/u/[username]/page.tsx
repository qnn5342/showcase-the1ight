import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProjectCard } from "@/components/gallery/project-card";

interface Props {
  params: Promise<{ username: string }>;
}

async function getProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, github_url, linkedin_url, website_url, cohort_slug");

  if (!profiles) return null;

  return profiles.find(
    (p) => p.display_name && slugify(p.display_name) === username
  ) ?? null;
}

async function getUserProjects(ownerId: string) {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      tagline,
      cover_image_url,
      live_url,
      status,
      project_tags (
        tags (
          name
        )
      )
    `)
    .eq("owner_id", ownerId)
    .eq("status", "published");

  return projects ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return { title: "Profile not found" };
  }

  const projects = await getUserProjects(profile.id);

  return {
    title: `${profile.display_name} — The1ight Showcase`,
    description: profile.bio ?? `Projects by ${profile.display_name} on The1ight Showcase`,
    openGraph: {
      title: `${profile.display_name} — The1ight Showcase`,
      description: profile.bio ?? `Projects by ${profile.display_name} on The1ight Showcase`,
      images: [
        {
          url: `/api/og?type=profile&title=${encodeURIComponent(profile.display_name ?? username)}&avatar=${encodeURIComponent(profile.avatar_url ?? "")}&projectCount=${projects.length}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const projects = await getUserProjects(profile.id);

  return (
    <main className="min-h-screen bg-[#15333B] text-[#F0F0F0]">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <ProfileHeader
          display_name={profile.display_name ?? username}
          avatar_url={profile.avatar_url}
          bio={profile.bio}
          github_url={profile.github_url}
          linkedin_url={profile.linkedin_url}
          website_url={profile.website_url}
        />

        <section>
          <h2 className="text-lg font-semibold text-[#FDF5DA] mb-6">
            Projects
          </h2>

          {projects.length === 0 ? (
            <p className="text-[#F0F0F0]/50 text-sm">No published projects yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => {
                const tags = project.project_tags
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((pt: any) => (Array.isArray(pt.tags) ? pt.tags[0]?.name : pt.tags?.name) as string | undefined)
                  .filter((n): n is string => Boolean(n));

                return (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    tagline={project.tagline ?? ""}
                    cover_image_url={project.cover_image_url}
                    live_url={project.live_url ?? ""}
                    author={{
                      display_name: profile.display_name,
                      avatar_url: profile.avatar_url,
                    }}
                    tags={tags}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
