-- Демо seed запускается после создания Auth-пользователей скриптом
-- scripts/create-demo-users.ts. Пароли и service role key в репозиторий не попадают.
do $$
declare
  user_id uuid;
  profile_ids uuid[] := '{}';
  owner_id uuid;
  group_id uuid;
  property_id uuid;
  application_id uuid;
  i integer;
begin
  for i in 1..25 loop
    select au.id into user_id from auth.users au order by au.created_at, au.id limit 1 offset (i - 1);
    exit when user_id is null;
    insert into public.profiles (id, display_name, age, job_title, bio, budget_min, budget_max, move_in_date, lease_months)
    values (
      user_id,
      (array['Мария','Артём','Екатерина','Илья','Алина','Дмитрий','Юлия','Максим','Лера','Настя','Иван','Ольга','Никита','Софья','Роман','Полина','Михаил','Дарья','Кирилл','Виктория','Тимур','Елена','Павел','Вера','Степан'])[i],
      21 + (i % 10),
      (array['Дизайнер','Разработчик','Маркетолог','Предприниматель','Студент','Архитектор','Продуктовый менеджер'])[1 + (i % 7)],
      'Ищу спокойное и честное совместное проживание в Краснодаре.',
      18000 + (i % 5) * 2000,
      26000 + (i % 6) * 2500,
      current_date + (i % 4) * 7,
      6 + (i % 3) * 6
    ) on conflict (id) do update set display_name = excluded.display_name, updated_at = timezone('utc', now());
    insert into public.user_roles (user_id, role) values (user_id, 'tenant') on conflict do nothing;
    profile_ids := array_append(profile_ids, user_id);
  end loop;

  if coalesce(array_length(profile_ids, 1), 0) < 20 then
    raise notice 'Для полного seed нужно 20 Auth-пользователей; создано профилей: %', coalesce(array_length(profile_ids, 1), 0);
    return;
  end if;

  for i in 1..5 loop
    owner_id := profile_ids[i];
    insert into public.user_roles (user_id, role) values (owner_id, 'owner') on conflict do nothing;
  end loop;

  for i in 1..15 loop
    owner_id := profile_ids[1 + ((i - 1) % 5)];
    insert into public.properties (owner_id, title, description, district, address, monthly_rent, deposit, rooms, area, floor, total_floors, available_from, status, pets_allowed)
    values (
      owner_id,
      (array['Светлая квартира в центре','Квартира рядом с парком','Уютная квартира на Фестивальном','Комната в спокойном районе','Трёхкомнатная у набережной'])[1 + ((i - 1) % 5)],
      'Проверенный объект с хорошим естественным светом, рабочими местами и понятными условиями проживания.',
      (array['Центр','Фестивальный','Юбилейный','Черёмушки','Панорама','Гидростроителей','Энка','Российский','Восточно-Кругликовский'])[1 + ((i - 1) % 9)],
      (array['ул. Красная, 176','ул. Тургенева, 89','ул. Северная, 324','ул. Ставропольская, 210','ул. Восточно-Кругликовская, 42'])[1 + ((i - 1) % 5)],
      20000 + (i % 6) * 4500,
      20000 + (i % 4) * 5000,
      1 + (i % 3),
      38 + (i % 6) * 4,
      2 + (i % 12),
      9 + (i % 8),
      current_date + (i % 5) * 7,
      'published',
      i % 3 = 0
    ) returning id into property_id;
    insert into public.property_amenities values (property_id, 'Wi‑Fi'), (property_id, 'Мебель'), (property_id, 'Рабочее место') on conflict do nothing;
  end loop;

  for i in 1..4 loop
    insert into public.groups (created_by, name, status, target_budget, move_in_date, lease_months)
    values (profile_ids[i], (array['Центр без компромиссов','Квартира у парка','Фестивальная команда','Тихий дом'])[i], (array['ready','forming','application_sent','under_review'])[i], 70000 + i * 5000, current_date + i * 7, 12)
    returning id into group_id;
    insert into public.group_members (group_id, profile_id, role, status, joined_at) values (group_id, profile_ids[i], 'admin', 'active', timezone('utc', now())), (group_id, profile_ids[i+1], 'member', 'active', timezone('utc', now())), (group_id, profile_ids[i+2], 'member', 'active', timezone('utc', now())) on conflict do nothing;
  end loop;

  for i in 1..6 loop
    select g.id into group_id from public.groups g order by g.created_at limit 1 offset ((i - 1) % 4);
    select p.id into property_id from public.properties p order by p.created_at limit 1 offset ((i - 1) % 15);
    select g.created_by into user_id from public.groups g where g.id = group_id;
    insert into public.applications (group_id, property_id, created_by, status, total_budget, move_in_date, lease_months)
    values (group_id, property_id, user_id, (array['submitted','reviewing','needs_response','approved','rejected','contract_agreed'])[i], 75000 + i * 1500, current_date + i * 7, 12)
    returning id into application_id;
    insert into public.application_members (application_id, profile_id, rent_share) select application_id, gm.profile_id, 25000 from public.group_members gm where gm.group_id = (select a.group_id from public.applications a where a.id = application_id) and gm.status = 'active' on conflict do nothing;
    insert into public.application_events (application_id, actor_id, to_status, note) values (application_id, user_id, 'submitted', 'Групповая заявка создана в демо-данных');
  end loop;

  insert into public.notifications (user_id, kind, title, body, href)
  select id, 'match', 'Новое совпадение', 'Нашли кандидата с совместимостью 93%', '/app/roommates' from public.profiles order by created_at limit 20;

  insert into public.expenses (group_id, created_by, category, description, amount)
  select g.id, g.created_by, 'household', 'Бытовые покупки для группы', 5160 from public.groups g order by g.created_at limit 4;

  insert into public.chores (group_id, created_by, assignee_id, title, zone, due_at)
  select g.id, g.created_by, g.created_by, 'Уборка кухни', 'Кухня', timezone('utc', now()) + interval '2 days' from public.groups g order by g.created_at limit 4;
end $$;
