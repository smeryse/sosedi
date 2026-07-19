-- Enable RLS for all core tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.profile_preferences enable row level security;
alter table public.lifestyle_answers enable row level security;
alter table public.compatibility_weights enable row level security;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.chores enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_members enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (is_public = true or auth.uid() = id);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- Profile Preferences Policies
create policy "Users can view any public profile preferences." on public.profile_preferences for select using (
  exists (select 1 from public.profiles where profiles.id = profile_preferences.profile_id and (profiles.is_public = true or profiles.id = auth.uid()))
);
create policy "Users can insert their own preferences." on public.profile_preferences for insert with check (auth.uid() = profile_id);
create policy "Users can update their own preferences." on public.profile_preferences for update using (auth.uid() = profile_id);

-- Lifestyle Answers
create policy "Users can view any public lifestyle answers." on public.lifestyle_answers for select using (
  exists (select 1 from public.profiles where profiles.id = lifestyle_answers.profile_id and (profiles.is_public = true or profiles.id = auth.uid()))
);
create policy "Users can insert their own answers." on public.lifestyle_answers for insert with check (auth.uid() = profile_id);
create policy "Users can update their own answers." on public.lifestyle_answers for update using (auth.uid() = profile_id);
create policy "Users can delete their own answers." on public.lifestyle_answers for delete using (auth.uid() = profile_id);

-- User Roles
create policy "Users can read their own roles." on public.user_roles for select using (auth.uid() = user_id);

-- Groups
create policy "Group members can view their groups." on public.groups for select using (
  exists (select 1 from public.group_members where group_members.group_id = groups.id and group_members.profile_id = auth.uid())
);
create policy "Users can create groups." on public.groups for insert with check (true);
create policy "Group members can update their groups." on public.groups for update using (
  exists (select 1 from public.group_members where group_members.group_id = groups.id and group_members.profile_id = auth.uid())
);

-- Group Members
create policy "Users can view members of their groups." on public.group_members for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.profile_id = auth.uid())
);
create policy "Users can insert themselves into a group." on public.group_members for insert with check (auth.uid() = profile_id);
create policy "Users can update their own membership or group admins can update." on public.group_members for update using (
  auth.uid() = profile_id or 
  exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.profile_id = auth.uid() and gm.role = 'admin')
);
create policy "Users can leave a group or admins can kick." on public.group_members for delete using (
  auth.uid() = profile_id or 
  exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.profile_id = auth.uid() and gm.role = 'admin')
);

-- Chores
create policy "Group members can view chores." on public.chores for select using (
  exists (select 1 from public.group_members gm where gm.group_id = chores.group_id and gm.profile_id = auth.uid())
);
create policy "Group members can insert chores." on public.chores for insert with check (
  exists (select 1 from public.group_members gm where gm.group_id = group_id and gm.profile_id = auth.uid())
);
create policy "Group members can update chores." on public.chores for update using (
  exists (select 1 from public.group_members gm where gm.group_id = chores.group_id and gm.profile_id = auth.uid())
);
create policy "Group members can delete chores." on public.chores for delete using (
  exists (select 1 from public.group_members gm where gm.group_id = chores.group_id and gm.profile_id = auth.uid())
);

-- Expenses
create policy "Group members can view expenses." on public.expenses for select using (
  exists (select 1 from public.group_members gm where gm.group_id = expenses.group_id and gm.profile_id = auth.uid())
);
create policy "Group members can insert expenses." on public.expenses for insert with check (
  exists (select 1 from public.group_members gm where gm.group_id = group_id and gm.profile_id = auth.uid())
);
create policy "Group members can update expenses." on public.expenses for update using (
  exists (select 1 from public.group_members gm where gm.group_id = expenses.group_id and gm.profile_id = auth.uid())
);
create policy "Group members can delete expenses." on public.expenses for delete using (
  exists (select 1 from public.group_members gm where gm.group_id = expenses.group_id and gm.profile_id = auth.uid())
);

-- Expense Members
create policy "Group members can view expense shares." on public.expense_members for select using (
  exists (select 1 from public.expenses e join public.group_members gm on e.group_id = gm.group_id where e.id = expense_members.expense_id and gm.profile_id = auth.uid())
);
create policy "Group members can insert expense shares." on public.expense_members for insert with check (
  exists (select 1 from public.expenses e join public.group_members gm on e.group_id = gm.group_id where e.id = expense_id and gm.profile_id = auth.uid())
);
create policy "Group members can update expense shares." on public.expense_members for update using (
  exists (select 1 from public.expenses e join public.group_members gm on e.group_id = gm.group_id where e.id = expense_members.expense_id and gm.profile_id = auth.uid())
);
create policy "Group members can delete expense shares." on public.expense_members for delete using (
  exists (select 1 from public.expenses e join public.group_members gm on e.group_id = gm.group_id where e.id = expense_members.expense_id and gm.profile_id = auth.uid())
);
