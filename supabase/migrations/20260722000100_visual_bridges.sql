-- Optional FAL visual bridges are privately owned by the circle owner.
create table public.visual_bridges (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null unique references public.memory_circles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  request_id text not null unique,
  model text not null,
  status text not null default 'IN_QUEUE',
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger visual_bridges_updated before update on public.visual_bridges for each row execute function public.set_updated_at();

alter table public.visual_bridges enable row level security;

create policy "Members see visual bridges" on public.visual_bridges for select using (public.is_circle_member(circle_id));
create policy "Owners create visual bridges" on public.visual_bridges for insert to authenticated with check (owner_id = auth.uid() and exists (select 1 from public.memory_circles c where c.id = circle_id and c.owner_id = auth.uid()));
create policy "Owners update visual bridges" on public.visual_bridges for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
