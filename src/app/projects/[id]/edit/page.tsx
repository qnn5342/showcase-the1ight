import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "@/app/submit/submit-form";

export const metadata = { title: "Chỉnh sửa dự án — Showcase The1ight" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: project } = await supabase
    .from("projects")
    .select(
      `id, title, tagline, description, live_url, github_url, cover_image_url, cover_focus_position, status, owner_id, cohort_id,
       project_tags ( tags ( name ) )`
    )
    .eq("id", id)
    .single();

  if (!project || project.owner_id !== user.id) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags: string[] = (project.project_tags ?? [])
    .map((pt: any) => {
      const t = pt.tags;
      if (!t) return undefined;
      if (Array.isArray(t)) return t[0]?.name as string | undefined;
      return t.name as string | undefined;
    })
    .filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "#FDF5DA" }}
      >
        Chỉnh sửa dự án
      </h1>
      <SubmitForm
        projectId={id}
        initialValues={{
          title: project.title,
          tagline: project.tagline ?? "",
          description: project.description ?? "",
          live_url: project.live_url ?? "",
          github_url: project.github_url ?? "",
          cover_image_url: project.cover_image_url ?? "",
          cover_focus_position: (project as Record<string, unknown>).cover_focus_position as string ?? "50% 50%",
          cohort_id: project.cohort_id,
          status: project.status as "draft" | "published",
          tags,
        }}
      />
    </div>
  );
}
