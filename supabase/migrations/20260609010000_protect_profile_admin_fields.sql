create or replace function protect_profile_admin_fields()
returns trigger language plpgsql as $$
begin
  if (
    old.role is distinct from new.role
    or old.can_vote is distinct from new.can_vote
  ) and not is_admin() then
    raise exception 'Only admins can update profile admin fields.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profile_admin_fields on profiles;
create trigger trg_profile_admin_fields
before update on profiles
for each row execute function protect_profile_admin_fields();

create policy "profiles: admin update"
on profiles for update
using (is_admin())
with check (is_admin());
