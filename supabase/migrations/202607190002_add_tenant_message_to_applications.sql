-- Keep the tenant's introductory message with the application instead of
-- showing a message in the form that the owner can never receive.
alter table public.applications
  add column if not exists tenant_message text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_tenant_message_length'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications
      add constraint applications_tenant_message_length
      check (tenant_message is null or char_length(trim(tenant_message)) between 10 and 2000)
      not valid;
  end if;
end $$;

alter table public.applications
  validate constraint applications_tenant_message_length;
