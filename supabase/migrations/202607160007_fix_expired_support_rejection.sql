create or replace function app_private.reject_expired_support_issues()
returns integer
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  changed integer;
begin
  with expired as (
    update app_private.issues
    set status = 'auto-rejected'
    where status = 'pending'
      and support_enabled
      and support_met_at is null
      and support_deadline_at is not null
      and support_deadline_at <= now()
      and support_goal is not null
      and support_count < support_goal
    returning 1
  )
  select count(*) into changed from expired;

  return changed;
end;
$$;
