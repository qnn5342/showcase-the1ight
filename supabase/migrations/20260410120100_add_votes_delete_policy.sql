-- Allow voters to delete (toggle off) their own votes when voting is open
create policy "votes: voter can delete own when open" on votes for delete
  using (auth.uid() = voter_id and voting_is_open(cohort_id));
