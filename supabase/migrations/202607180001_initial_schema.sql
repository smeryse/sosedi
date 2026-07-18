create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  age smallint check (age between 18 and 100),
  job_title text,
  bio text check (char_length(coalesce(bio, '')) <= 2000),
  city text not null default 'Краснодар',
  avatar_path text,
  budget_min integer check (budget_min is null or budget_min >= 0),
  budget_max integer check (budget_max is null or budget_max >= budget_min),
  move_in_date date,
  lease_months smallint check (lease_months is null or lease_months between 1 and 120),
  is_public boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('tenant', 'owner', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role)
);

create table if not exists public.profile_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  districts text[] not null default '{}',
  smoking text not null default 'no' check (smoking in ('no', 'sometimes', 'yes', 'indifferent')),
  pets text not null default 'indifferent' check (pets in ('no', 'cat', 'dog', 'other', 'indifferent')),
  sleep_schedule text not null default 'flexible' check (sleep_schedule in ('early', 'late', 'flexible')),
  noise_tolerance smallint check (noise_tolerance between 1 and 5),
  guests_frequency text not null default 'sometimes' check (guests_frequency in ('never', 'rarely', 'sometimes', 'often')),
  remote_work text not null default 'sometimes' check (remote_work in ('never', 'sometimes', 'often')),
  cleanliness smallint check (cleanliness between 1 and 5),
  sociability smallint check (sociability between 1 and 5),
  private_space smallint check (private_space between 1 and 5),
  cooking smallint check (cooking between 1 and 5),
  shared_products boolean not null default true,
  temperature smallint check (temperature between 1 and 5),
  common_zones smallint check (common_zones between 1 and 5),
  leisure text[] not null default '{}',
  pet_tolerance text not null default 'any' check (pet_tolerance in ('no', 'cat', 'dog', 'any')),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lifestyle_answers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question_key text not null,
  answer jsonb not null,
  importance smallint not null default 3 check (importance between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, question_key)
);

create table if not exists public.compatibility_weights (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  criterion text not null,
  weight numeric(5,2) not null check (weight between 0 and 1),
  primary key (profile_id, criterion)
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 4 and 160),
  description text,
  city text not null default 'Краснодар',
  district text not null,
  address text,
  monthly_rent integer not null check (monthly_rent > 0),
  deposit integer not null default 0 check (deposit >= 0),
  rooms smallint not null check (rooms between 1 and 20),
  area numeric(7,2) not null check (area > 0),
  floor smallint,
  total_floors smallint,
  available_from date,
  lease_months_min smallint not null default 6 check (lease_months_min between 1 and 120),
  pets_allowed boolean not null default false,
  smoking_allowed boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'archived')),
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (property_id, storage_path)
);

create table if not exists public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity text not null,
  primary key (property_id, amenity)
);

create table if not exists public.property_rules (
  property_id uuid not null references public.properties(id) on delete cascade,
  rule_key text not null,
  rule_value text not null,
  primary key (property_id, rule_key)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'property', 'group')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, target_type, target_id)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  status text not null default 'forming' check (status in ('forming', 'ready', 'application_sent', 'under_review', 'needs_response', 'approved', 'rejected', 'settled')),
  target_budget integer check (target_budget is null or target_budget > 0),
  move_in_date date,
  lease_months smallint check (lease_months is null or lease_months between 1 and 120),
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'invited' check (status in ('invited', 'active', 'declined', 'left', 'removed')),
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (group_id, profile_id)
);

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete restrict,
  invitee_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
  created_at timestamptz not null default timezone('utc', now()),
  unique (group_id, invitee_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'reviewing', 'needs_response', 'approved', 'rejected', 'contract_agreed', 'settled')),
  total_budget integer not null check (total_budget > 0),
  move_in_date date,
  lease_months smallint check (lease_months is null or lease_months between 1 and 120),
  owner_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.application_members (
  application_id uuid not null references public.applications(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  rent_share integer not null check (rent_share >= 0),
  confirmed_at timestamptz,
  primary key (application_id, profile_id)
);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group', 'owner_group', 'system')),
  property_id uuid references public.properties(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default timezone('utc', now()),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  system_type text,
  sent_at timestamptz not null default timezone('utc', now()),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  byte_size integer not null check (byte_size between 1 and 10485760),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  category text not null check (category in ('rent', 'utilities', 'deposit', 'household', 'other')),
  description text not null check (char_length(description) between 2 and 200),
  amount integer not null check (amount > 0),
  occurred_on date not null default current_date,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expense_members (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  share integer not null check (share >= 0),
  paid_at timestamptz,
  primary key (expense_id, profile_id)
);

create table if not exists public.chores (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  zone text,
  due_at timestamptz,
  recurrence text,
  status text not null default 'open' check (status in ('open', 'done', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.verification_statuses (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'property')),
  subject_id uuid not null,
  status text not null check (status in ('unverified', 'pending', 'verified', 'rejected')),
  provider text,
  note text,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (subject_type, subject_id)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'mock' check (provider in ('mock', 'groq', 'openrouter')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_public_idx on public.profiles (city, is_public) where archived_at is null;
create index if not exists properties_search_idx on public.properties (city, district, status, monthly_rent) where archived_at is null;
create index if not exists properties_owner_idx on public.properties (owner_id, status);
create index if not exists group_members_profile_idx on public.group_members (profile_id, status);
create index if not exists application_group_idx on public.applications (group_id, status);
create index if not exists application_property_idx on public.applications (property_id, status);
create index if not exists messages_conversation_idx on public.messages (conversation_id, sent_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, read_at, created_at desc);
create index if not exists events_application_idx on public.application_events (application_id, created_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists preferences_updated_at on public.profile_preferences;
create trigger preferences_updated_at before update on public.profile_preferences for each row execute function public.set_updated_at();
drop trigger if exists lifestyle_answers_updated_at on public.lifestyle_answers;
create trigger lifestyle_answers_updated_at before update on public.lifestyle_answers for each row execute function public.set_updated_at();
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties for each row execute function public.set_updated_at();
drop trigger if exists groups_updated_at on public.groups;
create trigger groups_updated_at before update on public.groups for each row execute function public.set_updated_at();
drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at before update on public.applications for each row execute function public.set_updated_at();
drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at before update on public.conversations for each row execute function public.set_updated_at();
drop trigger if exists chores_updated_at on public.chores;
create trigger chores_updated_at before update on public.chores for each row execute function public.set_updated_at();
drop trigger if exists ai_conversations_updated_at on public.ai_conversations;
create trigger ai_conversations_updated_at before update on public.ai_conversations for each row execute function public.set_updated_at();

create or replace function public.is_group_member(target_group uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.group_members where group_id = target_group and profile_id = auth.uid() and status = 'active'); $$;

create or replace function public.is_group_admin(target_group uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.group_members where group_id = target_group and profile_id = auth.uid() and role = 'admin' and status = 'active'); $$;

create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.conversation_members where conversation_id = target_conversation and profile_id = auth.uid()); $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'); $$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.lifestyle_answers enable row level security;
alter table public.compatibility_weights enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_rules enable row level security;
alter table public.favorites enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.applications enable row level security;
alter table public.application_members enable row level security;
alter table public.application_events enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_members enable row level security;
alter table public.chores enable row level security;
alter table public.verification_statuses enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.analytics_events enable row level security;

create policy profiles_public_read on public.profiles for select using ((is_public = true and archived_at is null) or id = auth.uid() or public.is_admin());
create policy profiles_self_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy roles_self_read on public.user_roles for select using (user_id = auth.uid() or public.is_admin());
create policy preferences_self_all on public.profile_preferences for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy answers_self_all on public.lifestyle_answers for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy weights_self_all on public.compatibility_weights for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());

create policy properties_public_read on public.properties for select using ((status = 'published' and archived_at is null) or owner_id = auth.uid() or public.is_admin());
create policy properties_owner_insert on public.properties for insert with check (owner_id = auth.uid() or public.is_admin());
create policy properties_owner_update on public.properties for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy properties_owner_delete on public.properties for delete using (owner_id = auth.uid() or public.is_admin());
create policy property_images_visible on public.property_images for select using (exists(select 1 from public.properties p where p.id = property_id and (p.status = 'published' or p.owner_id = auth.uid() or public.is_admin())));
create policy property_images_owner_write on public.property_images for all using (exists(select 1 from public.properties p where p.id = property_id and (p.owner_id = auth.uid() or public.is_admin()))) with check (exists(select 1 from public.properties p where p.id = property_id and (p.owner_id = auth.uid() or public.is_admin())));
create policy property_amenities_visible on public.property_amenities for select using (exists(select 1 from public.properties p where p.id = property_id and (p.status = 'published' or p.owner_id = auth.uid() or public.is_admin())));
create policy property_rules_visible on public.property_rules for select using (exists(select 1 from public.properties p where p.id = property_id and (p.status = 'published' or p.owner_id = auth.uid() or public.is_admin())));

create policy favorites_self_all on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy groups_member_read on public.groups for select using (public.is_group_member(id) or created_by = auth.uid() or public.is_admin());
create policy groups_creator_write on public.groups for all using (created_by = auth.uid() or public.is_admin()) with check (created_by = auth.uid() or public.is_admin());
create policy group_members_member_read on public.group_members for select using (public.is_group_member(group_id) or profile_id = auth.uid() or public.is_admin());
create policy group_members_admin_write on public.group_members for all using (public.is_group_admin(group_id) or public.is_admin()) with check (public.is_group_admin(group_id) or public.is_admin());
create policy invites_participant_read on public.group_invites for select using (inviter_id = auth.uid() or invitee_id = auth.uid() or public.is_group_member(group_id) or public.is_admin());
create policy invites_participant_write on public.group_invites for all using (inviter_id = auth.uid() or invitee_id = auth.uid() or public.is_admin()) with check (inviter_id = auth.uid() or public.is_admin());

create policy applications_participant_read on public.applications for select using (created_by = auth.uid() or exists(select 1 from public.application_members am where am.application_id = id and am.profile_id = auth.uid()) or exists(select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()) or public.is_admin());
create policy applications_group_write on public.applications for insert with check (created_by = auth.uid() and public.is_group_member(group_id));
create policy applications_participant_update on public.applications for update using (created_by = auth.uid() or exists(select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()) or public.is_admin());
create policy application_members_participant on public.application_members for select using (exists(select 1 from public.applications a where a.id = application_id and (a.created_by = auth.uid() or a.group_id in (select group_id from public.group_members where profile_id = auth.uid()) or exists(select 1 from public.properties p where p.id = a.property_id and p.owner_id = auth.uid()))));
create policy application_events_participant_read on public.application_events for select using (exists(select 1 from public.applications a where a.id = application_id and (a.created_by = auth.uid() or a.group_id in (select group_id from public.group_members where profile_id = auth.uid()) or exists(select 1 from public.properties p where p.id = a.property_id and p.owner_id = auth.uid()))));
create policy application_events_participant_insert on public.application_events for insert with check (actor_id = auth.uid());

create policy conversation_member_read on public.conversations for select using (public.is_conversation_member(id) or created_by = auth.uid() or public.is_admin());
create policy conversation_member_write on public.conversations for all using (created_by = auth.uid() or public.is_conversation_member(id) or public.is_admin()) with check (created_by = auth.uid() or public.is_admin());
create policy conversation_members_member_read on public.conversation_members for select using (public.is_conversation_member(conversation_id) or profile_id = auth.uid() or public.is_admin());
create policy conversation_members_creator_write on public.conversation_members for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy messages_member_read on public.messages for select using (public.is_conversation_member(conversation_id) or public.is_admin());
create policy messages_member_insert on public.messages for insert with check (sender_id = auth.uid() and public.is_conversation_member(conversation_id));
create policy messages_sender_update on public.messages for update using (sender_id = auth.uid() or public.is_admin());
create policy attachments_member_read on public.message_attachments for select using (exists(select 1 from public.messages m where m.id = message_id and public.is_conversation_member(m.conversation_id)));

create policy notifications_self_all on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy expenses_group_read on public.expenses for select using (public.is_group_member(group_id) or created_by = auth.uid() or public.is_admin());
create policy expenses_group_write on public.expenses for all using (created_by = auth.uid() or public.is_group_member(group_id) or public.is_admin()) with check (created_by = auth.uid() or public.is_group_member(group_id) or public.is_admin());
create policy expense_members_group_read on public.expense_members for select using (exists(select 1 from public.expenses e where e.id = expense_id and public.is_group_member(e.group_id)));
create policy chores_group_all on public.chores for all using (public.is_group_member(group_id) or created_by = auth.uid() or public.is_admin()) with check (public.is_group_member(group_id) or created_by = auth.uid() or public.is_admin());
create policy verification_public_read on public.verification_statuses for select using (status = 'verified' or subject_id = auth.uid() or public.is_admin());
create policy verification_subject_write on public.verification_statuses for all using (subject_id = auth.uid() or public.is_admin()) with check (subject_id = auth.uid() or public.is_admin());
create policy ai_conversations_self_all on public.ai_conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ai_messages_owner_all on public.ai_messages for all using (exists(select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())) with check (exists(select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy analytics_insert_authenticated on public.analytics_events for insert with check (user_id = auth.uid() or user_id is null);
create policy analytics_admin_read on public.analytics_events for select using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('property-images', 'property-images', true), ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

create policy avatar_public_read on storage.objects for select using (bucket_id = 'avatars');
create policy avatar_owner_write on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy property_image_public_read on storage.objects for select using (bucket_id = 'property-images');
create policy attachment_member_read on storage.objects for select using (bucket_id = 'message-attachments' and auth.uid() is not null);
