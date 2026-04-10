create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _display_name text;
  _avatar_url   text;
begin
  _display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
  _avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, _display_name, _avatar_url)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
