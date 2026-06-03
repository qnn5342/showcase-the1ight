import { createClient } from "@/lib/supabase/server";

export type ProjectCardData = {
  id: string;
  title: string;
  tagline: string;
  cover_image_url: string | null;
  live_url: string;
  cohort_id: string;
  created_at: string;
  author: {
    id: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  tags: string[];
};

export type CohortData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  created_at: string;
};

export type CohortSectionData = CohortData & {
  projectCount: number;
  projects: ProjectCardData[];
};

type PublishedProjectsOptions = {
  cohortId?: string;
  tag?: string;
  sort?: string;
  limit?: number;
};

const PROJECT_SELECT = `
  id,
  title,
  tagline,
  cover_image_url,
  live_url,
  cohort_id,
  created_at,
  profiles (
    id,
    display_name,
    avatar_url
  ),
  project_tags (
    tags (
      name
    )
  )
`;

export async function getPublishedProjects({
  cohortId,
  tag,
  sort,
  limit,
}: PublishedProjectsOptions = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: sort === "oldest" });

  if (cohortId) {
    query = query.eq("cohort_id", cohortId);
  }

  if (tag) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tag)
      .single();

    if (!tagRow) return [];

    const { data: taggedIds } = await supabase
      .from("project_tags")
      .select("project_id")
      .eq("tag_id", tagRow.id);

    const ids = (taggedIds ?? []).map((row) => row.project_id);
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return [];

  return (data ?? []).map(normalizeProject);
}

export async function getCohorts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cohorts")
    .select("id, name, slug, description, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as CohortData[];
}

export async function getCohortBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cohorts")
    .select("id, name, slug, description, status, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as CohortData;
}

export async function getHomepageShowcaseData() {
  const supabase = await createClient();

  const [profilesRes, projectsRes, awardsRes, cohorts, projects] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("voting_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "revealed"),
      getCohorts(),
      getPublishedProjects({ sort: "newest" }),
    ]);

  const projectsByCohort = new Map<string, ProjectCardData[]>();
  for (const project of projects) {
    const group = projectsByCohort.get(project.cohort_id) ?? [];
    group.push(project);
    projectsByCohort.set(project.cohort_id, group);
  }

  const cohortSections: CohortSectionData[] = cohorts
    .map((cohort) => {
      const cohortProjects = projectsByCohort.get(cohort.id) ?? [];
      return {
        ...cohort,
        projectCount: cohortProjects.length,
        projects: cohortProjects.slice(0, 3),
      };
    })
    .filter((cohort) => cohort.projectCount > 0);

  return {
    studentCount: profilesRes.count ?? 0,
    projectCount: projectsRes.count ?? 0,
    awardCount: awardsRes.count ?? 0,
    featuredProjects: projects.slice(0, 3),
    cohortSections,
  };
}

function normalizeProject(project: Record<string, unknown>): ProjectCardData {
  const author = Array.isArray(project.profiles)
    ? project.profiles[0]
    : project.profiles;

  const tags = ((project.project_tags as unknown[]) ?? []).flatMap((pt) => {
    const tagsVal = (pt as { tags?: { name?: string } | { name?: string }[] })
      .tags;
    if (!tagsVal) return [];
    if (Array.isArray(tagsVal)) {
      return tagsVal.flatMap((tag) => (tag.name ? [tag.name] : []));
    }
    return tagsVal.name ? [tagsVal.name] : [];
  });

  return {
    id: project.id as string,
    title: project.title as string,
    tagline: (project.tagline as string | null) ?? "",
    cover_image_url: (project.cover_image_url as string | null) ?? null,
    live_url: (project.live_url as string | null) ?? "",
    cohort_id: project.cohort_id as string,
    created_at: project.created_at as string,
    author: {
      id:
        ((author as { id?: string | null } | null | undefined)?.id as
          | string
          | null) ?? null,
      display_name:
        ((author as { display_name?: string | null } | null | undefined)
          ?.display_name as string | null) ?? null,
      avatar_url:
        ((author as { avatar_url?: string | null } | null | undefined)
          ?.avatar_url as string | null) ?? null,
    },
    tags,
  };
}
