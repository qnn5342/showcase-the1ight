import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CohortsTab } from "@/components/admin/cohorts-tab";
import { VotingTab } from "@/components/admin/voting-tab";
import { CommentsTab } from "@/components/admin/comments-tab";
import { StudentsTab } from "@/components/admin/students-tab";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { data: cohorts },
    { data: sessions },
    { data: comments },
    { data: profiles },
    { data: juryPicks },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("cohorts")
      .select("id, name, slug, status")
      .order("created_at", { ascending: false }),
    supabase
      .from("voting_sessions")
      .select("id, cohort_id, status, opened_at, closed_at, revealed_at"),
    supabase
      .from("comments")
      .select(
        "id, content, created_at, is_hidden, project_id, author_id, profiles:author_id(display_name)"
      )
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, cohort_slug, can_vote, role"),
    supabase
      .from("jury_picks")
      .select("id, cohort_id, project_id, note"),
    supabase
      .from("projects")
      .select("id, title, cohort_id, status")
      .eq("status", "published"),
  ]);

  return (
    <Tabs defaultValue="cohorts">
      <TabsList
        className="mb-6"
        style={{ backgroundColor: "#214C54", borderColor: "#3E5E63" }}
      >
        <TabsTrigger value="cohorts" style={{ color: "#F0F0F0" }}>
          Cohorts
        </TabsTrigger>
        <TabsTrigger value="voting" style={{ color: "#F0F0F0" }}>
          Voting
        </TabsTrigger>
        <TabsTrigger value="comments" style={{ color: "#F0F0F0" }}>
          Comments
        </TabsTrigger>
        <TabsTrigger value="students" style={{ color: "#F0F0F0" }}>
          Students
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cohorts">
        <CohortsTab cohorts={cohorts ?? []} />
      </TabsContent>

      <TabsContent value="voting">
        <VotingTab
          cohorts={cohorts ?? []}
          sessions={sessions ?? []}
          projects={projects ?? []}
          juryPicks={juryPicks ?? []}
        />
      </TabsContent>

      <TabsContent value="comments">
        <CommentsTab comments={comments ?? []} />
      </TabsContent>

      <TabsContent value="students">
        <StudentsTab profiles={profiles ?? []} cohorts={cohorts ?? []} />
      </TabsContent>
    </Tabs>
  );
}
