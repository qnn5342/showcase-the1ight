# Showcase The1ight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a showcase platform where vibe coding students publish projects, peers vote in 3 categories, The Captain reveals winners with highlight cards, and admins can curate project presentation/feedback videos.

**Architecture:** Next.js App Router + Supabase (Postgres, Auth, Storage) fullstack. Server Actions for mutations, RLS for security, SSR for SEO. Dark theme with The1ight brand colors. Admin-curated project media is stored on project rows and rendered only on project detail pages.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, react-hook-form + zod, react-markdown, html2canvas, @vercel/og, Vitest + Playwright

**Project path:** `~/Code/showcase-the1ight/`

**Design references (Stitch):** Project ID `3774569857880708540` — Landing page, Project detail + Vote UI, Results board + Highlight Card

**2026-06-08 PRD Update:** Homepage stays unchanged. Admins can attach one presentation YouTube video and one optional feedback highlight YouTube clip to each existing project. Student owners do not see or edit these fields.

---

## Phase 1: Foundation

### Task 1: Init Next.js + Tailwind + shadcn/ui + Supabase client

**Files:**
- Create: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Create: `src/types/database.ts` (placeholder)
- Create: `.env.local.example`

- [ ] **1.1 — Scaffold Next.js app**

```bash
cd ~/Code
npx create-next-app@latest showcase-the1ight \
  --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
cd showcase-the1ight
```

- [ ] **1.2 — Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
npx shadcn@latest init
```

shadcn init options: Style=Default, Base color=Slate, CSS variables=Yes

- [ ] **1.3 — Configure tailwind.config.ts with brand colors**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        t1: {
          bg: "#15333B",
          card: "#214C54",
          accent: "#FFD94C",
          text: "#F0F0F0",
          heading: "#FDF5DA",
          green: "#4E8770",
          border: "#3E5E63",
        },
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **1.4 — Write globals.css with The1ight CSS variables**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

@layer base {
  :root {
    --background: 193 47% 16%;        /* #15333B */
    --foreground: 0 0% 94%;           /* #F0F0F0 */
    --card: 193 43% 23%;              /* #214C54 */
    --card-foreground: 0 0% 94%;
    --popover: 193 43% 23%;
    --popover-foreground: 0 0% 94%;
    --primary: 46 100% 65%;           /* #FFD94C */
    --primary-foreground: 193 47% 16%;
    --secondary: 159 28% 40%;         /* #4E8770 */
    --secondary-foreground: 0 0% 94%;
    --muted: 193 24% 30%;
    --muted-foreground: 0 0% 70%;
    --accent: 46 100% 65%;
    --accent-foreground: 193 47% 16%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 94%;
    --border: 193 21% 31%;            /* #3E5E63 */
    --input: 193 21% 31%;
    --ring: 46 100% 65%;
    --radius: 0.75rem;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-body antialiased; }
  h1, h2, h3, h4, h5, h6 { @apply font-heading text-t1-heading; }
}
```

- [ ] **1.5 — Create Supabase client utilities**

`src/lib/supabase/client.ts` — browser client
`src/lib/supabase/server.ts` — server client with cookie handling
`src/lib/supabase/middleware.ts` — session refresh middleware

- [ ] **1.6 — Create placeholder Database type, root layout, .env.local.example**

- [ ] **1.7 — Verify build**

```bash
npm run build
```

- [ ] **1.8 — Commit**

```
feat: init Next.js 14 + Tailwind + shadcn/ui + Supabase client utilities
```

---

### Task 2: Supabase Schema — All Tables + Enums + RLS + Views + Seed

**Files:**
- Create: `supabase/migrations/<timestamp>_initial_schema.sql`

- [ ] **2.1 — Init Supabase**

```bash
npx supabase init
npx supabase migration new initial_schema
```

- [ ] **2.2 — Write full migration SQL**

**Enums:** `cohort_status`, `project_status`, `vote_category`, `voting_session_status`, `devlog_entry_type`, `user_role`

**Tables:**
- `profiles` (id FK auth.users, display_name, avatar_url, bio, github_url, linkedin_url, website_url, cohort_slug, can_vote, role, timestamps)
- `cohorts` (id, name, slug unique, description, status, created_at)
- `projects` (id, owner_id FK profiles, cohort_id FK cohorts, title, tagline, description, live_url, github_url, cover_image_url, status, is_offline, timestamps)
- `tags` (id, name unique, slug unique)
- `project_tags` (project_id + tag_id composite PK)
- `voting_sessions` (id, cohort_id unique FK, status, opened_at, closed_at, revealed_at)
- `votes` (id, voter_id FK, project_id FK, category, cohort_id FK, timestamps, UNIQUE voter_id+category+cohort_id)
- `jury_picks` (id, cohort_id FK, project_id FK, note, created_at)
- `devlog_entries` (id, project_id FK, author_id FK, type, title, content, image_url, created_at)
- `comments` (id, project_id FK, author_id FK, content check <=1000, is_hidden, timestamps)

**View:** `public_vote_counts` — aggregates votes only when voting_session.status = 'revealed'

**RLS policies for every table** with helper functions: `is_admin()`, `voting_is_open()`, `voting_is_revealed()`

**Seed:** 7 tags (AI, SaaS, Tool, Game, Education, Lifestyle, Other), 1 cohort "Batch 3" status draft

- [ ] **2.3 — Apply migration**

```bash
npx supabase start
npx supabase db push
```

- [ ] **2.4 — Regenerate types**

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

- [ ] **2.5 — Commit**

```
feat: complete Supabase schema — tables, enums, RLS, views, seed data
```

---

### Task 3: Google OAuth + Auth Middleware + Profile Auto-Create

**Files:**
- Create: `src/app/api/auth/callback/route.ts`
- Create: `src/middleware.ts`
- Create: `supabase/migrations/<timestamp>_profile_autocreate_trigger.sql`
- Create: `src/lib/actions/auth.ts`
- Create: `src/components/auth/AuthButton.tsx`
- Create: `src/app/auth/error/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **3.1 — Enable Google OAuth in Supabase dashboard**
- [ ] **3.2 — Create auth callback route** (PKCE code exchange)
- [ ] **3.3 — Create middleware.ts** (session refresh on every request)
- [ ] **3.4 — Create profile auto-create DB trigger** (pulls display_name + avatar from Google metadata)
- [ ] **3.5 — Create signInWithGoogle + signOut server actions**
- [ ] **3.6 — Create AuthButton component** (login button or avatar + logout)
- [ ] **3.7 — Create auth error page**
- [ ] **3.8 — Wire AuthButton into root layout header**
- [ ] **3.9 — Verify build + commit**

```
feat: Google OAuth + auth middleware + profile auto-create trigger
```

---

## Phase 2: Core CRUD

### Task 4: Submit Project Form `/submit`

**Files:**
- Create: `src/lib/validations/project.ts` (zod schema + PRESET_TAGS)
- Create: `src/app/actions/project.ts` (createProject server action)
- Create: `src/components/submit/cover-upload.tsx` (drag-drop + browser-image-compression)
- Create: `src/components/submit/tag-selector.tsx` (1-3 preset chip selector)
- Create: `src/app/submit/page.tsx` + `src/app/submit/submit-form.tsx`

```bash
npm install browser-image-compression @hookform/resolvers
```

- [ ] **4.1 — Create zod schema** with title, tagline (max 100), live_url (https://), github_url optional, description, cover_url, status (draft/published), tags (1-3)
- [ ] **4.2 — Create createProject server action** — insert project + project_tags, auto-assign to active cohort
- [ ] **4.3 — Create CoverUpload component** — drag-drop, auto-compress to 2MB, upload to Supabase Storage "project-covers"
- [ ] **4.4 — Create TagSelector component** — preset chips, max 3
- [ ] **4.5 — Create submit page** — protected route, react-hook-form, draft/publish toggle
- [ ] **4.6 — Commit**

```
feat: add /submit page with project form, cover upload, tag selector
```

---

### Task 5: Gallery Page

**Files:**
- Create: `src/components/gallery/project-card.tsx`
- Create: `src/components/gallery/project-card-skeleton.tsx`
- Create: `src/components/gallery/gallery-filters.tsx`
- Modify: `src/app/page.tsx` (temporary gallery, will become landing later)

- [ ] **5.1 — Create ProjectCard** — cover 16:9, title, tagline, author avatar+name, tag badges
- [ ] **5.2 — Create ProjectCardSkeleton** — loading state
- [ ] **5.3 — Create GalleryFilters** — tag chip filter + sort dropdown (newest/oldest)
- [ ] **5.4 — Create gallery page** — 3-column responsive grid, Suspense, empty state
- [ ] **5.5 — Commit**

```
feat: gallery page with project grid, tag filter, sort, skeleton loading
```

---

### Task 6: Project Detail Page `/projects/[id]`

**Files:**
- Create: `src/app/projects/[id]/page.tsx`
- Create: `src/app/projects/[id]/project-tabs.tsx`
- Create: `src/app/projects/[id]/about-tab.tsx`

```bash
npm install react-markdown remark-gfm
```

- [ ] **6.1 — Create project detail page** — cover hero, metadata, tags, action buttons, generateMetadata for SEO/OG
- [ ] **6.2 — Create ProjectTabs** — 3 tabs: Gioi thieu, Devlog (N), Binh luan (N)
- [ ] **6.3 — Create AboutTab** — render description as markdown
- [ ] **6.4 — Commit**

```
feat: project detail page with metadata, hero, tabs, markdown about
```

---

## Phase 3: Social Features

### Task 7: Flat Comment System

**Files:**
- Create: `src/app/actions/comment.ts` (addComment, updateComment, deleteComment, hideComment)
- Create: `src/components/comments/comment-card.tsx`
- Create: `src/components/comments/add-comment.tsx` (optimistic UI)
- Create: `src/app/projects/[id]/comments-tab.tsx`

```bash
npm install date-fns
```

- [ ] **7.1 — Create comment server actions** — add, update (owner), delete (owner), hide (admin)
- [ ] **7.2 — Create CommentCard** — avatar, name, content, timestamp, edit/delete buttons
- [ ] **7.3 — Create AddComment** — textarea + optimistic insert with useOptimistic
- [ ] **7.4 — Create CommentsTab** — fetch comments, wire up
- [ ] **7.5 — Commit**

```
feat: flat comment system with optimistic UI, edit/delete, admin hide
```

---

### Task 8: Devlog Entries

**Files:**
- Create: `src/lib/validations/devlog.ts`
- Create: `src/app/actions/devlog.ts` (addDevlogEntry, deleteDevlogEntry)
- Create: `src/components/devlog/devlog-entry.tsx` (timeline with type icons)
- Create: `src/components/devlog/add-devlog-entry.tsx` (owner only, type selector)
- Create: `src/app/projects/[id]/devlog-tab.tsx`

- [ ] **8.1 — Create devlog zod schema** — title, content, entry_type (text/image/milestone), image_url
- [ ] **8.2 — Create server actions** — add (verify ownership), delete
- [ ] **8.3 — Create DevlogEntry** — timeline UI with type-specific rendering (text/image/milestone icons)
- [ ] **8.4 — Create AddDevlogEntry** — form with type selector, image upload for image type
- [ ] **8.5 — Create DevlogTab** — fetch entries, show add button for owner
- [ ] **8.6 — Commit**

```
feat: devlog timeline with text/image/milestone entries, owner-only add/delete
```

---

## Phase 4: Voting System

### Task 9: Peer Voting

**Files:**
- Create: `src/app/actions/votes.ts` (upsertVote, getUserVotesForCohort)
- Create: `src/components/voting/VotePanel.tsx`
- Create: `src/components/voting/VoteBottomBar.tsx`
- Modify: `src/app/projects/[id]/page.tsx` (add sidebar)

- [ ] **9.1 — Create upsertVote server action** — validate can_vote, session open, not self-vote, upsert on (voter_id, category, cohort_id)
- [ ] **9.2 — Create VotePanel** — 3 category buttons with active state (#FFD94C), self-vote disabled + tooltip, swap confirmation
- [ ] **9.3 — Create VoteBottomBar** — persistent "Phieu bau cua ban: X/3 da dung"
- [ ] **9.4 — Integrate into project detail sidebar** — fetch session status, user votes, conditionally show
- [ ] **9.5 — Commit**

```
feat: peer voting — VotePanel, VoteBottomBar, upsertVote server action
```

---

### Task 10: Voting Session Management

**Files:**
- Create: `src/app/actions/voting-session.ts` (advanceVotingSession, upsertJuryPick, toggleStudentVoteAccess, hideComment)

- [ ] **10.1 — Create state machine** — valid transitions: pending->open->closed->revealed
- [ ] **10.2 — Create advanceVotingSession** — admin only, validate transition
- [ ] **10.3 — Create upsertJuryPick** — admin picks project + note
- [ ] **10.4 — Create toggleStudentVoteAccess** — admin toggles can_vote per student
- [ ] **10.5 — Commit**

```
feat: voting session state machine — advance status, jury pick, toggle vote access
```

---

## Phase 5: Admin + Profile

### Task 11: Admin Panel `/admin`

**Files:**
- Create: `src/app/admin/layout.tsx` (admin-only guard)
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/CohortsTab.tsx`
- Create: `src/components/admin/VotingTab.tsx`
- Create: `src/components/admin/CommentsTab.tsx`
- Create: `src/components/admin/StudentsTab.tsx`

- [ ] **11.1 — Create admin layout** — check role=admin, redirect if not
- [ ] **11.2 — Create admin page** — Tabs: Cohorts, Voting, Comments, Students
- [ ] **11.3 — CohortsTab** — list + create cohort
- [ ] **11.4 — VotingTab** — session status control, results preview, jury pick selector, CSV export
- [ ] **11.5 — CommentsTab** — recent comments list, hide button
- [ ] **11.6 — StudentsTab** — grouped by cohort, toggle can_vote switch, assign `user`/`admin` role for trusted assistants
- [ ] **11.7 — Commit**

```
feat: admin panel — cohorts, voting control, comments moderation, student management
```

---

### Task 11B: Admin-Managed Project Videos

**Files:**
- Create: `src/lib/showcase/youtube.ts`
- Create: `src/lib/showcase/youtube.test.mjs`
- Create: `src/lib/validations/project-media.ts`
- Create: `src/lib/actions/project-media.ts`
- Create: `src/components/admin/project-media-tab.tsx`
- Create: `src/components/projects/project-video-section.tsx`
- Create: `supabase/migrations/<timestamp>_add_project_showcase_videos.sql`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/projects/[id]/page.tsx`

**Product Requirements:**
- Homepage must not change.
- Student submit/edit flow must not show video fields.
- Each project can have one presentation YouTube URL.
- Each project can optionally have one feedback highlight YouTube URL.
- Only admins can add, update, or remove these URLs.
- Public project detail page renders videos only when URLs exist.
- Feedback clip is optional social proof, not a required field for every project.

**Accepted YouTube URL formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- Same formats with extra query params, as long as a valid 11-character YouTube video ID can be extracted.

**Data Model:**

Add nullable columns to `projects`:

```sql
alter table projects
  add column if not exists presentation_youtube_url text,
  add column if not exists feedback_youtube_url text;
```

Add database protection because the existing owner update policy allows project owners to update their own project rows. Non-admin users must not be able to change these two fields even if they own the project.

- [ ] **11B.1 — Write YouTube helper tests first**

Create `src/lib/showcase/youtube.test.mjs` using Node's built-in test runner. Cover:
- watch URL extracts video ID
- `youtu.be` URL extracts video ID
- embed URL extracts video ID
- shorts URL extracts video ID
- embed URL normalizes to `https://www.youtube-nocookie.com/embed/VIDEO_ID`
- non-YouTube URL is invalid
- empty value is invalid for parsing but allowed by admin form as "remove video"

Run:

```bash
node --test src/lib/showcase/youtube.test.mjs
```

Expected before implementation: fail because helper does not exist.

- [ ] **11B.2 — Implement YouTube helper**

Create `src/lib/showcase/youtube.ts`:

```typescript
export function getYouTubeVideoId(input: string | null | undefined): string | null;
export function getYouTubeEmbedUrl(input: string | null | undefined): string | null;
export function isValidYouTubeUrl(input: string | null | undefined): boolean;
```

Rules:
- Accept `youtube.com/watch`, `youtu.be`, `youtube.com/embed`, and `youtube.com/shorts`.
- Return `null` for invalid hosts or invalid video IDs.
- Render embeds using `youtube-nocookie.com`.

- [ ] **11B.3 — Add Supabase migration**

Create migration:

```sql
alter table projects
  add column if not exists presentation_youtube_url text,
  add column if not exists feedback_youtube_url text;

create or replace function protect_project_showcase_video_fields()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if (new.presentation_youtube_url is not null or new.feedback_youtube_url is not null)
       and not is_admin() then
      raise exception 'Only admins can set project showcase videos.';
    end if;
    return new;
  end if;

  if (
    old.presentation_youtube_url is distinct from new.presentation_youtube_url
    or old.feedback_youtube_url is distinct from new.feedback_youtube_url
  ) and not is_admin() then
    raise exception 'Only admins can update project showcase videos.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_project_showcase_video_fields on projects;
create trigger trg_project_showcase_video_fields
before insert or update on projects
for each row execute function protect_project_showcase_video_fields();

create policy "projects: admin update"
on projects for update
using (is_admin())
with check (is_admin());
```

- [ ] **11B.4 — Create admin-only server action**

Create `src/lib/validations/project-media.ts` and `src/lib/actions/project-media.ts`.

Behavior:
- Validate `projectId`.
- Validate optional `presentation_youtube_url`.
- Validate optional `feedback_youtube_url`.
- Empty strings become `null`.
- Verify caller has `profiles.role = 'admin'`.
- Update only `presentation_youtube_url` and `feedback_youtube_url`.
- Revalidate `/admin` and `/projects/[id]`.

- [ ] **11B.5 — Add `/admin` Project Media tab**

Modify `src/app/admin/page.tsx`:
- Fetch project id, title, status, cohort label, `presentation_youtube_url`, and `feedback_youtube_url`.
- Add a `Project Media` tab.

Create `src/components/admin/project-media-tab.tsx`:
- Admin selects an existing project.
- Admin pastes presentation URL.
- Admin optionally pastes feedback URL.
- Admin can clear both fields.
- Admin sees preview embeds for valid URLs.
- Invalid URLs show clear toast or inline errors and are not saved.

- [ ] **11B.6 — Render videos on project detail page**

Modify `src/app/projects/[id]/page.tsx`:
- Include `presentation_youtube_url` and `feedback_youtube_url` in the project query.
- Render the video section after existing action buttons and before tabs.

Create `src/components/projects/project-video-section.tsx`:
- Render presentation embed if valid.
- Render optional `Feedback highlight` embed below presentation if valid.
- If both URLs are empty or invalid, render nothing.
- Use responsive 16:9 embeds.

- [ ] **11B.7 — Verify**

Run:

```bash
node --test src/lib/showcase/*.test.mjs
npx tsc --noEmit
npm run build
```

Manual smoke tests:
- Homepage unchanged.
- Student edit form has no video fields.
- Admin saves valid presentation URL.
- Admin saves optional feedback URL.
- Admin clears either URL.
- Invalid YouTube URL is rejected.
- Public project with no videos renders unchanged.
- Public project with presentation only renders one video.
- Public project with presentation plus feedback renders both videos before tabs.

- [ ] **11B.8 — Commit**

```
feat: add admin-managed project presentation and feedback videos
```

---

### Task 12: Public Profile `/u/[username]`

**Files:**
- Create: `src/app/u/[username]/page.tsx`
- Create: `src/components/profile/ProfileHeader.tsx`

- [ ] **12.1 — Create ProfileHeader** — large avatar, display_name, bio, social links (GitHub/LinkedIn/Website icons)
- [ ] **12.2 — Create profile page** — header + projects grid across all seasons + generateMetadata
- [ ] **12.3 — Commit**

```
feat: public profile /u/[username] with avatar, bio, social links, projects grid
```

---

### Task 13: User Dashboard `/me`

**Files:**
- Create: `src/app/me/layout.tsx` (auth guard)
- Create: `src/app/me/page.tsx`
- Create: `src/app/actions/profile.ts` (updateProfile)
- Create: `src/components/me/EditProfileForm.tsx`
- Create: `src/components/me/MyVotesSummary.tsx`

- [ ] **13.1 — Create updateProfile server action** — bio, social URLs, zod validation
- [ ] **13.2 — Create EditProfileForm** — bio textarea, 3 URL inputs, display_name/avatar read-only
- [ ] **13.3 — Create MyVotesSummary** — shows which project voted for each category
- [ ] **13.4 — Create dashboard page** — profile preview, edit form, my projects list, votes summary
- [ ] **13.5 — Commit**

```
feat: user dashboard /me — edit profile, project list, votes summary
```

---

## Phase 6: Results + Highlight Card

### Task 14: Results Board `/results/[cohort]`

**Files:**
- Create: `src/app/results/[cohort]/page.tsx`
- Create: `src/app/results/[cohort]/loading.tsx`
- Create: `src/components/results/WinnerColumn.tsx`
- Create: `src/components/results/JuryPickCard.tsx`
- Create: `src/components/results/RunnerUpCard.tsx`

- [ ] **14.1 — Create RunnerUpCard** — mini card with cover, title, author, vote count
- [ ] **14.2 — Create WinnerColumn** — category header (icon+label), large winner card with colored border (gold/green/blue), runner-up below
- [ ] **14.3 — Create JuryPickCard** — special card with badge, cover, Captain's note blockquote
- [ ] **14.4 — Create loading skeleton**
- [ ] **14.5 — Create results page** — check revealed status, hero, 3 winner columns, jury pick, all participants grid, generateMetadata
- [ ] **14.6 — Commit**

```
feat: results board /results/[cohort] with winner columns and jury pick
```

---

### Task 15: Highlight Card Generation

**Files:**
- Create: `src/components/results/HighlightCard.tsx`
- Create: `src/components/results/DownloadHighlightButton.tsx`

- [ ] **15.1 — Create HighlightCard** — 1080x1080 div with brand header, award badge, cover image, project title + author, footer URL. Gold gradient border for winners, neutral for participants.
- [ ] **15.2 — Create DownloadHighlightButton** — renders HighlightCard off-screen, captures with html2canvas, downloads as PNG
- [ ] **15.3 — Wire into results page** — button per project in participants grid
- [ ] **15.4 — Commit**

```bash
npm install html2canvas
```

```
feat: HighlightCard component and PNG download via html2canvas
```

---

## Phase 7: Landing + Polish

### Task 16: Landing Page `/`

**Files:**
- Create: `src/components/landing/HeroSection.tsx`
- Create: `src/components/landing/StatsBar.tsx`
- Create: `src/components/landing/AnimatedCounter.tsx`
- Create: `src/components/landing/FeaturedProjects.tsx`
- Create: `src/components/landing/CtaSection.tsx`
- Create: `src/components/landing/Footer.tsx`
- Modify: `src/app/page.tsx` (replace gallery with full landing)

- [ ] **16.1 — AnimatedCounter** — IntersectionObserver trigger, ease-out cubic animation
- [ ] **16.2 — HeroSection** — headline, subtitle with stats, glow effect, yellow CTA
- [ ] **16.3 — StatsBar** — 3 animated counters (Hoc vien, San pham, Giai thuong)
- [ ] **16.4 — FeaturedProjects** — top 3 winners or recent projects, large cards with award badges
- [ ] **16.5 — CtaSection** — "Ban muon tao san pham nhu the nay?" + link to The1ight
- [ ] **16.6 — Footer** — logo, nav links, copyright
- [ ] **16.7 — Replace page.tsx** — assemble all sections, fetch data from Supabase
- [ ] **16.8 — Commit**

```
feat: full landing page — hero, stats, featured projects, CTA, footer
```

---

### Task 17: OG Image Generation

**Files:**
- Create: `src/app/api/og/route.tsx`
- Modify: `src/app/projects/[id]/page.tsx` (wire OG URL into generateMetadata)
- Modify: `src/app/u/[username]/page.tsx` (wire OG URL)

```bash
npm install @vercel/og
```

- [ ] **17.1 — Create OG route** — edge runtime, 3 variants: landing (branded), project (cover + title + author), profile (avatar + name + project count)
- [ ] **17.2 — Wire into project detail generateMetadata**
- [ ] **17.3 — Wire into profile generateMetadata**
- [ ] **17.4 — Commit**

```
feat: dynamic OG image generation via @vercel/og for project, profile, landing
```

---

### Task 18: Health Check Cron (Nice-to-have)

**Files:**
- Create: `vercel.json` (cron config)
- Create: `src/app/api/cron/health-check/route.ts`
- Create: `src/components/projects/OfflineBadge.tsx`
- Modify: `src/app/projects/[id]/page.tsx` (show badge)

- [ ] **18.1 — Create vercel.json** — daily cron at 02:00 UTC
- [ ] **18.2 — Create health-check route** — fetch all published live_urls, HEAD request with 10s timeout, update is_offline
- [ ] **18.3 — Create OfflineBadge** — warning badge component
- [ ] **18.4 — Wire badge into project detail page** next to live URL button
- [ ] **18.5 — Add CRON_SECRET to .env.local.example**
- [ ] **18.6 — Commit**

```
feat: daily health check cron for live URLs with offline badge
```

---

## Dependency Map

```
auth.users (Supabase managed)
    └── trigger: on_auth_user_created → profiles
            ├── projects.owner_id
            ├── votes.voter_id
            ├── comments.author_id
            └── devlog_entries.author_id

cohorts
    ├── projects.cohort_id
    ├── votes.cohort_id
    ├── voting_sessions.cohort_id → controls vote visibility
    └── jury_picks.cohort_id

voting_sessions.status = 'revealed'
    └── public_vote_counts VIEW (safe aggregate)
```

## npm Dependencies Summary

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate

# Forms + Validation
npm install @hookform/resolvers react-hook-form zod

# Content
npm install react-markdown remark-gfm date-fns

# Media
npm install browser-image-compression html2canvas @vercel/og

# shadcn components (add as needed)
npx shadcn@latest add button input textarea label switch badge avatar tabs select skeleton dialog alert-dialog tooltip dropdown-menu
```
