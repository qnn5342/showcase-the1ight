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
