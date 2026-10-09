create extension if not exists pgcrypto;

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null default '' check (char_length(phone) <= 32),
  country_name text check (char_length(country_name) between 2 and 100),
  audience text check (audience in ('individual','healthcare','organization','partner')),
  organization_name text not null default '' check (char_length(organization_name) <= 160),
  journey_interest text check (journey_interest in ('early-access','healthcare-partnership','institutional-partnership','chw-programme','launch-updates')),
  preferred_contact text check (preferred_contact in ('email','whatsapp','phone')),
  preferred_language text not null default 'en' check (char_length(preferred_language) <= 16),
  message text not null default '' check (char_length(message) <= 1000),
  source text not null default 'website' check (char_length(source) <= 80),
  consent_version text not null,
  consented_at timestamptz not null,
  status text not null default 'new' check (status in ('new','contacted','qualified','invited','archived')),
  internal_note text not null default '' check (char_length(internal_note) <= 2000),
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep older registration details intact while making the shorter signup valid.
alter table public.waitlist_entries alter column country_name drop not null;
alter table public.waitlist_entries alter column audience drop not null;
alter table public.waitlist_entries alter column journey_interest drop not null;
alter table public.waitlist_entries alter column preferred_contact drop not null;
alter table public.waitlist_entries drop constraint if exists waitlist_entries_audience_check;
update public.waitlist_entries set audience = case
  when audience in ('healthcare', 'chw') then 'healthcare'
  when audience in ('institution', 'organization') then 'organization'
  when audience in ('partner') then 'partner'
  else 'individual'
end
where audience is not null;
alter table public.waitlist_entries add constraint waitlist_entries_audience_check
  check (audience in ('individual','healthcare','organization','partner'));

create unique index if not exists waitlist_entries_email_unique_idx
  on public.waitlist_entries (lower(email));
create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);
create index if not exists waitlist_entries_status_idx
  on public.waitlist_entries (status);

create table if not exists public.waitlist_admin_events (
  id bigserial primary key,
  entry_id uuid,
  actor_email text not null,
  event_type text not null check (event_type in ('joined','updated','deleted','exported')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.waitlist_admin_events
  alter column entry_id drop not null;
alter table public.waitlist_admin_events
  drop constraint if exists waitlist_admin_events_event_type_check;
alter table public.waitlist_admin_events
  add constraint waitlist_admin_events_event_type_check
  check (event_type in ('joined','updated','deleted','exported'));

create index if not exists waitlist_admin_events_created_at_idx
  on public.waitlist_admin_events (created_at desc);
create index if not exists waitlist_admin_events_entry_id_idx
  on public.waitlist_admin_events (entry_id, created_at desc);

revoke all on public.waitlist_entries from public;
revoke all on public.waitlist_admin_events from public;
