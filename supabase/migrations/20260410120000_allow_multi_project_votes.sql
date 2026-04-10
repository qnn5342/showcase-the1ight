-- Allow users to vote for multiple projects per category
-- Old: unique (voter_id, category, cohort_id) — 1 project per category
-- New: unique (voter_id, project_id, category, cohort_id) — 1 vote per project per category

alter table votes drop constraint votes_voter_id_category_cohort_id_key;
alter table votes add constraint votes_voter_project_category_cohort_key
  unique (voter_id, project_id, category, cohort_id);
