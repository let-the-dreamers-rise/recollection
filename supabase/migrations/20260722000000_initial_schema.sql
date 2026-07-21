-- Recollection core schema: private age chains, invitations, responses, and storage.
create extension if not exists pgcrypto;

create type public.circle_role as enum ('owner', 'editor', 'viewer');
create type public.response_kind as enum ('audio', 'text');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.memory_circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  source_context text not null default '' check (char_length(source_context) <= 4000),
  prompt text not null check (char_length(prompt) between 1 and 600),
  cover_path text,
  consent_confirmed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.circle_members (
  circle_id uuid not null references public.memory_circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.circle_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.memory_circles(id) on delete cascade,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(18), 'hex'),
  recipient_name text,
  expires_at timestamptz not null default (now() + interval '14 days'),
  revoked_at timestamptz,
  max_responses integer not null default 1 check (max_responses between 1 and 10),
  created_at timestamptz not null default now()
);

create table public.story_responses (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.memory_circles(id) on delete cascade,
  invitation_id uuid references public.invitations(id) on delete set null,
  contributor_name text not null check (char_length(contributor_name) between 1 and 100),
  kind public.response_kind not null,
  text_content text,
  audio_path text,
  transcript text,
  consent_to_store_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((kind = 'text' and text_content is not null and audio_path is null) or (kind = 'audio' and audio_path is not null))
);

create function public.is_circle_member(target_circle uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.memory_circles c where c.id = target_circle and c.owner_id = auth.uid())
or exists (select 1 from public.circle_members m where m.circle_id = target_circle and m.user_id = auth.uid()) $$;

create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger memory_circles_updated before update on public.memory_circles for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id) values (new.id) on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.memory_circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.invitations enable row level security;
alter table public.story_responses enable row level security;

create policy "Users see their profile" on public.profiles for select using (id = auth.uid());
create policy "Users update their profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Members read circles" on public.memory_circles for select using (public.is_circle_member(id));
create policy "Authenticated users create owned circles" on public.memory_circles for insert to authenticated with check (owner_id = auth.uid());
create policy "Owners update their circles" on public.memory_circles for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners delete their circles" on public.memory_circles for delete using (owner_id = auth.uid());
create policy "Members see members" on public.circle_members for select using (public.is_circle_member(circle_id));
create policy "Owners manage members" on public.circle_members for all using (exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid()));
create policy "Owners see invitations" on public.invitations for select using (exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid()));
create policy "Owners create invitations" on public.invitations for insert to authenticated with check (created_by = auth.uid() and exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid()));
create policy "Owners revoke invitations" on public.invitations for update using (exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid()));
create policy "Members see responses" on public.story_responses for select using (public.is_circle_member(circle_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('memory-media', 'memory-media', false, 26214400, array['image/jpeg','image/png','image/webp','audio/webm','audio/mpeg','audio/mp4']) on conflict (id) do nothing;
create policy "Users upload to own folder" on storage.objects for insert to authenticated with check (bucket_id = 'memory-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own uploads" on storage.objects for delete to authenticated using (bucket_id = 'memory-media' and (storage.foldername(name))[1] = auth.uid()::text);
