-- Extensions
create extension if not exists "uuid-ossp";

-- Enums
create type cohort_status as enum ('draft', 'submitting', 'voting', 'closed', 'revealed');
create type project_status as enum ('draft', 'published');
create type vote_category as enum ('most_loved', 'most_creative', 'best_execution');
create type voting_session_status as enum ('pending', 'open', 'closed', 'revealed');
create type devlog_entry_type as enum ('text', 'image', 'milestone');
create type user_role as enum ('user', 'admin');

-- Tables
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  bio             text,
  github_url      text,
  linkedin_url    text,
  website_url     text,
  cohort_slug     text,
  can_vote        boolean not null default false,
  role            user_role not null default 'user',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table cohorts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  status      cohort_status not null default 'draft',
  created_at  timestamptz not null default now()
);

create table projects (
  id              uuid primary key default uuid_generate_v4(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  cohort_id       uuid not null references cohorts(id) on delete cascade,
  title           text not null,
  tagline         text,
  description     text,
  live_url        text,
  github_url      text,
  cover_image_url text,
  status          project_status not null default 'draft',
  is_offline      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table tags (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null unique,
  slug  text not null unique
);

create table project_tags (
  project_id  uuid not null references projects(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

create table voting_sessions (
  id          uuid primary key default uuid_generate_v4(),
  cohort_id   uuid not null unique references cohorts(id) on delete cascade,
  status      voting_session_status not null default 'pending',
  opened_at   timestamptz,
  closed_at   timestamptz,
  revealed_at timestamptz
);

create table votes (
  id          uuid primary key default uuid_generate_v4(),
  voter_id    uuid not null references profiles(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  category    vote_category not null,
  cohort_id   uuid not null references cohorts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (voter_id, category, cohort_id)
);

create table jury_picks (
  id          uuid primary key default uuid_generate_v4(),
  cohort_id   uuid not null references cohorts(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now()
);

create table devlog_entries (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  type        devlog_entry_type not null default 'text',
  title       text,
  content     text,
  image_url   text,
  created_at  timestamptz not null default now()
);

create table comments (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references projects(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  content     text not null check (char_length(content) <= 1000),
  is_hidden   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes
create index idx_projects_owner_id   on projects(owner_id);
create index idx_projects_cohort_id  on projects(cohort_id);
create index idx_projects_status     on projects(status);
create index idx_votes_voter_id      on votes(voter_id);
create index idx_votes_project_id    on votes(project_id);
create index idx_votes_cohort_id     on votes(cohort_id);
create index idx_comments_project_id on comments(project_id);
create index idx_devlog_project_id   on devlog_entries(project_id);

-- View: public_vote_counts (only returns data when session = revealed)
create or replace view public_vote_counts as
select v.project_id, v.cohort_id, v.category, count(*)::int as vote_count
from votes v
join voting_sessions vs on vs.cohort_id = v.cohort_id
where vs.status = 'revealed'
group by v.project_id, v.cohort_id, v.category;

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles for each row execute function set_updated_at();
create trigger trg_projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger trg_votes_updated_at before update on votes for each row execute function set_updated_at();
create trigger trg_comments_updated_at before update on comments for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;
alter table cohorts enable row level security;
alter table projects enable row level security;
alter table tags enable row level security;
alter table project_tags enable row level security;
alter table voting_sessions enable row level security;
alter table votes enable row level security;
alter table jury_picks enable row level security;
alter table devlog_entries enable row level security;
alter table comments enable row level security;

-- Helper functions
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function voting_is_open(p_cohort_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from voting_sessions where cohort_id = p_cohort_id and status = 'open');
$$;

create or replace function voting_is_revealed(p_cohort_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from voting_sessions where cohort_id = p_cohort_id and status = 'revealed');
$$;

-- Profiles policies
create policy "profiles: anyone can read" on profiles for select using (true);
create policy "profiles: owner can update own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cohorts policies
create policy "cohorts: anyone can read" on cohorts for select using (true);
create policy "cohorts: admin insert" on cohorts for insert with check (is_admin());
create policy "cohorts: admin update" on cohorts for update using (is_admin());
create policy "cohorts: admin delete" on cohorts for delete using (is_admin());

-- Projects policies
create policy "projects: anyone can read published" on projects for select using (status = 'published' or auth.uid() = owner_id or is_admin());
create policy "projects: owner insert" on projects for insert with check (auth.uid() = owner_id);
create policy "projects: owner update" on projects for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "projects: owner delete" on projects for delete using (auth.uid() = owner_id);

-- Tags policies
create policy "tags: anyone can read" on tags for select using (true);
create policy "tags: admin insert" on tags for insert with check (is_admin());

-- Project_tags policies
create policy "project_tags: anyone can read" on project_tags for select using (true);
create policy "project_tags: project owner can insert" on project_tags for insert with check (exists (select 1 from projects where id = project_id and owner_id = auth.uid()));
create policy "project_tags: project owner can delete" on project_tags for delete using (exists (select 1 from projects where id = project_id and owner_id = auth.uid()));

-- Voting_sessions policies
create policy "voting_sessions: anyone can read" on voting_sessions for select using (true);
create policy "voting_sessions: admin insert" on voting_sessions for insert with check (is_admin());
create policy "voting_sessions: admin update" on voting_sessions for update using (is_admin());

-- Votes policies
create policy "votes: voter can insert when eligible" on votes for insert with check (
  auth.uid() = voter_id
  and voting_is_open(cohort_id)
  and exists (select 1 from profiles where id = auth.uid() and can_vote = true)
  and not exists (select 1 from projects where id = project_id and owner_id = auth.uid())
);
create policy "votes: voter can update own when open" on votes for update using (auth.uid() = voter_id and voting_is_open(cohort_id)) with check (auth.uid() = voter_id and voting_is_open(cohort_id));
create policy "votes: voter can read own" on votes for select using (auth.uid() = voter_id);
create policy "votes: admin can read all" on votes for select using (is_admin());

-- Jury_picks policies
create policy "jury_picks: read when revealed or admin" on jury_picks for select using (voting_is_revealed(cohort_id) or is_admin());
create policy "jury_picks: admin insert" on jury_picks for insert with check (is_admin());
create policy "jury_picks: admin update" on jury_picks for update using (is_admin());
create policy "jury_picks: admin delete" on jury_picks for delete using (is_admin());

-- Devlog_entries policies
create policy "devlog_entries: anyone can read" on devlog_entries for select using (true);
create policy "devlog_entries: owner insert" on devlog_entries for insert with check (auth.uid() = author_id);
create policy "devlog_entries: owner update" on devlog_entries for update using (auth.uid() = author_id);
create policy "devlog_entries: owner delete" on devlog_entries for delete using (auth.uid() = author_id);

-- Comments policies
create policy "comments: anyone reads non-hidden" on comments for select using (is_hidden = false or auth.uid() = author_id or is_admin());
create policy "comments: author insert" on comments for insert with check (auth.uid() = author_id);
create policy "comments: author update own" on comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "comments: admin can hide" on comments for update using (is_admin());
create policy "comments: author delete own" on comments for delete using (auth.uid() = author_id);

-- Seed data
insert into tags (name, slug) values
  ('AI', 'ai'), ('SaaS', 'saas'), ('Tool', 'tool'), ('Game', 'game'),
  ('Education', 'education'), ('Lifestyle', 'lifestyle'), ('Other', 'other');

insert into cohorts (name, slug, description, status) values
  ('Batch 3', 'batch-3', 'Khoá vibe coding thứ 3 của The1ight — sản phẩm từ ý tưởng đến live trong 4 tuần.', 'draft');
