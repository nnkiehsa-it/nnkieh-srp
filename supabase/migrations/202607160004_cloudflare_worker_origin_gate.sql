create or replace function app_private.signal_outbox_worker()
returns trigger
language plpgsql
security definer
set search_path = app_private, extensions, public
as $$
declare
  worker_url text;
  webhook_secret text;
  origin_secret text;
begin
  if current_setting('app.outbox_worker_signaled', true) = '1' then return null; end if;
  select value into worker_url from app_private.runtime_settings where key = 'outbox_worker_url';
  select value into webhook_secret from app_private.runtime_settings where key = 'webhook_secret';
  select value into origin_secret from app_private.runtime_settings where key = 'edge_origin_secret';
  if worker_url is null or webhook_secret is null or origin_secret is null then return null; end if;
  perform set_config('app.outbox_worker_signaled', '1', true);
  perform net.http_post(
    url := worker_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'x-novae-origin-secret', origin_secret
    ),
    body := jsonb_build_object('signal', 'outbox_insert')
  );
  return null;
end;
$$;

create or replace function app_private.signal_deletion_worker()
returns trigger
language plpgsql
security definer
set search_path = app_private, extensions, public
as $$
declare
  worker_url text;
  webhook_secret text;
  origin_secret text;
begin
  if current_setting('app.deletion_worker_signaled', true) = '1' then return null; end if;
  select value into worker_url from app_private.runtime_settings where key = 'deletion_worker_url';
  select value into webhook_secret from app_private.runtime_settings where key = 'webhook_secret';
  select value into origin_secret from app_private.runtime_settings where key = 'edge_origin_secret';
  if worker_url is null or webhook_secret is null or origin_secret is null then return null; end if;
  perform set_config('app.deletion_worker_signaled', '1', true);
  perform net.http_post(
    url := worker_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'x-novae-origin-secret', origin_secret
    ),
    body := jsonb_build_object('signal', 'deletion_insert')
  );
  return null;
end;
$$;

create or replace function app_api.resignal_background_worker(worker_name text)
returns void
language plpgsql
security definer
set search_path = app_private, app_api, extensions, public
as $$
declare
  has_due_work boolean := false;
  worker_url text;
  webhook_secret text;
  origin_secret text;
begin
  if worker_name = 'outbox' then
    select exists (
      select 1 from app_private.outbox_events
      where attempt_count < 8 and (
        (status in ('pending', 'failed') and next_attempt_at <= now())
        or (status = 'processing' and locked_at < now() - interval '10 minutes')
      )
    ) into has_due_work;
    select value into worker_url from app_private.runtime_settings where key = 'outbox_worker_url';
  elsif worker_name = 'deletion' then
    select exists (
      select 1 from app_private.deletion_jobs
      where attempt_count < 8 and (
        (status in ('pending', 'failed') and next_attempt_at <= now())
        or (status = 'processing' and locked_at < now() - interval '10 minutes')
      )
    ) into has_due_work;
    select value into worker_url from app_private.runtime_settings where key = 'deletion_worker_url';
  else
    raise exception 'unsupported-worker';
  end if;
  if not has_due_work or worker_url is null then return; end if;
  select value into webhook_secret from app_private.runtime_settings where key = 'webhook_secret';
  select value into origin_secret from app_private.runtime_settings where key = 'edge_origin_secret';
  if webhook_secret is null or origin_secret is null then return; end if;
  perform net.http_post(
    url := worker_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'x-novae-origin-secret', origin_secret
    ),
    body := jsonb_build_object('signal', worker_name || '_backlog')
  );
end;
$$;

revoke all on function app_api.resignal_background_worker(text) from public, anon, authenticated;
grant execute on function app_api.resignal_background_worker(text) to service_role;

create or replace function app_private.signal_maintenance_worker()
returns void
language plpgsql
security definer
set search_path = app_private, extensions, public
as $$
declare
  worker_url text;
  webhook_secret text;
  origin_secret text;
begin
  select value into worker_url from app_private.runtime_settings where key = 'maintenance_worker_url';
  select value into webhook_secret from app_private.runtime_settings where key = 'webhook_secret';
  select value into origin_secret from app_private.runtime_settings where key = 'edge_origin_secret';
  if worker_url is null or webhook_secret is null or origin_secret is null then return; end if;
  perform net.http_post(
    url := worker_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || webhook_secret,
      'x-novae-origin-secret', origin_secret
    ),
    body := jsonb_build_object('signal', 'daily_maintenance')
  );
end;
$$;

revoke all on function app_private.signal_maintenance_worker() from public, anon, authenticated;
