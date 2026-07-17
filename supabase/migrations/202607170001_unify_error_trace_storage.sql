-- Store only typed trace identifiers for operational failures and align database errors with the API contract.

drop function if exists app_api.get_platform_dashboard_snapshot();
drop function if exists app_api.fail_outbox_event(uuid, text);
drop function if exists app_api.fail_deletion_job(uuid, text);

drop trigger if exists minimize_maintenance_insert_error on app_private.maintenance_runs;
drop trigger if exists minimize_maintenance_update_error on app_private.maintenance_runs;
drop function if exists app_private.minimize_maintenance_error();

update app_private.outbox_events
set last_error = null
where last_error is not null
  and last_error !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
update app_private.deletion_jobs
set last_error = null
where last_error is not null
  and last_error !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
update app_private.push_delivery_logs
set error_message = null
where error_message is not null
  and error_message !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
update app_private.maintenance_runs
set error = null
where error is not null
  and error !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

alter table app_private.outbox_events rename column last_error to error_trace_id;
alter table app_private.outbox_events alter column error_trace_id type uuid using error_trace_id::uuid;
alter table app_private.deletion_jobs rename column last_error to error_trace_id;
alter table app_private.deletion_jobs alter column error_trace_id type uuid using error_trace_id::uuid;
alter table app_private.push_delivery_logs rename column error_message to error_trace_id;
alter table app_private.push_delivery_logs alter column error_trace_id type uuid using error_trace_id::uuid;
alter table app_private.maintenance_runs rename column error to error_trace_id;
alter table app_private.maintenance_runs alter column error_trace_id type uuid using error_trace_id::uuid;

create function app_api.fail_outbox_event(event_id uuid, error_trace_id uuid)
returns void
language sql
security definer
set search_path = app_private, public
as $$
  update app_private.outbox_events
  set
    status = 'failed',
    error_trace_id = fail_outbox_event.error_trace_id,
    next_attempt_at = now() + make_interval(mins => least(60, greatest(1, attempt_count * 2))),
    updated_at = now(),
    expires_at = now() + interval '3 days'
  where id = event_id;
$$;

create function app_api.fail_deletion_job(job_id uuid, error_trace_id uuid)
returns void
language sql
security definer
set search_path = app_private, public
as $$
  update app_private.deletion_jobs
  set
    status = 'failed',
    error_trace_id = fail_deletion_job.error_trace_id,
    next_attempt_at = now() + make_interval(mins => least(60, greatest(1, attempt_count * 2))),
    updated_at = now()
  where id = job_id;
$$;

revoke all on function app_api.fail_outbox_event(uuid, uuid) from public, anon, authenticated;
revoke all on function app_api.fail_deletion_job(uuid, uuid) from public, anon, authenticated;
grant execute on function app_api.fail_outbox_event(uuid, uuid) to service_role;
grant execute on function app_api.fail_deletion_job(uuid, uuid) to service_role;

create or replace function app_private.run_maintenance_cleanup(
  valid_issue_categories text[] default null,
  retention_config jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  cleanup_details jsonb := '{}'::jsonb;
  deleted_count integer := 0;
  queued_count integer := 0;
  failed_deletion_jobs integer := 0;
  failure_trace_id uuid;
  run_id uuid;
  run_status text := 'success';
  closed_issue_days integer := greatest(1, least(3650, coalesce((retention_config->>'closedIssuesDays')::integer, 365)));
  closed_facility_days integer := greatest(1, least(3650, coalesce((retention_config->>'closedFacilitiesDays')::integer, 365)));
  notifications_days integer := greatest(1, least(3650, coalesce((retention_config->>'notificationsDays')::integer, 7)));
  realtime_hours integer := greatest(1, least(87600, coalesce((retention_config->>'realtimeEventsHours')::integer, 24)));
  outbox_completed_days integer := greatest(1, least(3650, coalesce((retention_config->>'outboxCompletedDays')::integer, 1)));
  outbox_failed_days integer := greatest(1, least(3650, coalesce((retention_config->>'outboxFailedDays')::integer, 3)));
  push_sent_days integer := greatest(1, least(3650, coalesce((retention_config->>'pushDeliverySentDays')::integer, 1)));
  push_failed_days integer := greatest(1, least(3650, coalesce((retention_config->>'pushDeliveryFailedDays')::integer, 3)));
  idempotency_hours integer := greatest(1, least(87600, coalesce((retention_config->>'idempotencyHours')::integer, 24)));
  inactive_push_token_days integer := greatest(1, least(3650, coalesce((retention_config->>'inactivePushTokensDays')::integer, 90)));
  deletion_completed_days integer := greatest(1, least(3650, coalesce((retention_config->>'deletionJobCompletedDays')::integer, 1)));
  deletion_failed_days integer := greatest(1, least(3650, coalesce((retention_config->>'deletionJobFailedDays')::integer, 3)));
  maintenance_days integer := greatest(1, least(3650, coalesce((retention_config->>'maintenanceRunsDays')::integer, 7)));
  role_audit_days integer := greatest(1, least(3650, coalesce((retention_config->>'roleAssignmentAuditDays')::integer, 365)));
  pending_upload_hours integer := greatest(1, least(87600, coalesce((retention_config->>'pendingUploadHours')::integer, 24)));
  unattached_upload_hours integer := greatest(1, least(87600, coalesce((retention_config->>'unattachedUploadHours')::integer, 48)));
  failed_upload_hours integer := greatest(1, least(87600, coalesce((retention_config->>'failedUploadHours')::integer, 24)));
begin
  insert into app_private.maintenance_runs (task_name, status, started_at)
  values ('maintenance.cleanup', 'running', now())
  returning id into run_id;

  if valid_issue_categories is not null and array_length(valid_issue_categories, 1) > 0 then
    with removed_issues as materialized (
      select id, author_uid, category, title
      from app_private.issues
      where not (category = any(valid_issue_categories))
    ), queued_events as (
      insert into app_private.outbox_events (event_type, target_type, target_id, actor_uid, payload)
      select 'issue.deleted', 'issue', id::text, author_uid,
        jsonb_build_object('author_uid', author_uid, 'issue_category', category, 'issue_id', id, 'title', title)
      from removed_issues
      returning 1
    ), deleted_issues as (
      delete from app_private.issues where id in (select id from removed_issues) returning 1
    )
    select (select count(*) from deleted_issues), (select count(*) from queued_events)
    into deleted_count, queued_count;
    cleanup_details := cleanup_details || jsonb_build_object(
      'removed_category_issues_deleted', deleted_count,
      'removed_category_deletion_events_queued', queued_count
    );
  else
    cleanup_details := cleanup_details || jsonb_build_object(
      'removed_category_issues_deleted', 0,
      'removed_category_deletion_events_queued', 0
    );
  end if;

  with expired_issues as materialized (
    select id, author_uid, category, title
    from app_private.issues
    where status in ('auto-rejected', 'review-rejected', 'infeasible', 'completed')
      and closed_at < now() - make_interval(days => closed_issue_days)
  ), queued_events as (
    insert into app_private.outbox_events (event_type, target_type, target_id, actor_uid, payload)
    select 'issue.deleted', 'issue', expired_issue.id::text, expired_issue.author_uid,
      jsonb_build_object(
        'author_uid', expired_issue.author_uid,
        'issue_category', expired_issue.category,
        'issue_id', expired_issue.id,
        'retention_cleanup', true,
        'title', expired_issue.title
      )
    from expired_issues expired_issue
    where exists (
      select 1 from app_private.notion_pages notion_page
      where notion_page.target_type = 'issue'
        and notion_page.target_id = expired_issue.id::text
    )
    returning 1
  ), deleted_issues as (
    delete from app_private.issues where id in (select id from expired_issues) returning 1
  )
  select (select count(*) from deleted_issues), (select count(*) from queued_events)
  into deleted_count, queued_count;
  cleanup_details := cleanup_details || jsonb_build_object(
    'expired_closed_issues_deleted', deleted_count,
    'expired_closed_issue_notion_deletions_queued', queued_count
  );

  with expired_facilities as materialized (
    select id, author_uid, title
    from app_private.facility_reports
    where status in ('completed', 'unable-to-handle')
      and closed_at < now() - make_interval(days => closed_facility_days)
  ), queued_events as (
    insert into app_private.outbox_events (event_type, target_type, target_id, actor_uid, payload)
    select 'facility.deleted', 'facility', expired_facility.id::text, expired_facility.author_uid,
      jsonb_build_object(
        'author_uid', expired_facility.author_uid,
        'retention_cleanup', true,
        'title', expired_facility.title
      )
    from expired_facilities expired_facility
    where exists (
      select 1 from app_private.notion_pages notion_page
      where notion_page.target_type = 'facility'
        and notion_page.target_id = expired_facility.id::text
    )
    returning 1
  ), deleted_facilities as (
    delete from app_private.facility_reports where id in (select id from expired_facilities) returning 1
  )
  select (select count(*) from deleted_facilities), (select count(*) from queued_events)
  into deleted_count, queued_count;
  cleanup_details := cleanup_details || jsonb_build_object(
    'expired_closed_facilities_deleted', deleted_count,
    'expired_closed_facility_notion_deletions_queued', queued_count
  );

  update app_private.uploads
  set delivery_url = null, delivery_url_expires_at = null
  where delivery_url_expires_at < now();
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('expired_upload_delivery_urls_cleared', deleted_count);

  with stale_uploads as materialized (
    select id, cloudinary_public_id
    from app_private.uploads
    where cloudinary_public_id is not null and (
      (status = 'pending' and created_at < now() - make_interval(hours => pending_upload_hours))
      or (status = 'ready' and attached_target_id is null and updated_at < now() - make_interval(hours => unattached_upload_hours))
      or (status = 'failed' and updated_at < now() - make_interval(hours => failed_upload_hours))
    )
  ), queued_uploads as (
    insert into app_private.deletion_jobs (target_type, target_id, cloudinary_public_id)
    select 'upload', id::text, cloudinary_public_id from stale_uploads
    returning 1
  ), deleted_uploads as (
    delete from app_private.uploads where id in (select id from stale_uploads) returning 1
  )
  select (select count(*) from queued_uploads), (select count(*) from deleted_uploads)
  into queued_count, deleted_count;
  cleanup_details := cleanup_details || jsonb_build_object(
    'uploads_queued_for_deletion', queued_count,
    'uploads_deleted', deleted_count
  );

  update app_private.notifications
  set expires_at = created_at + make_interval(days => notifications_days)
  where expires_at is distinct from created_at + make_interval(days => notifications_days);
  delete from app_private.notifications where expires_at < now();
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('notifications_deleted', deleted_count);

  update app_private.realtime_events
  set expires_at = created_at + make_interval(hours => realtime_hours)
  where expires_at is distinct from created_at + make_interval(hours => realtime_hours);
  delete from app_private.realtime_events where expires_at < now();
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('realtime_events_deleted', deleted_count);

  update app_private.outbox_events
  set expires_at = updated_at + case status
    when 'completed' then make_interval(days => outbox_completed_days)
    else make_interval(days => outbox_failed_days)
  end
  where status in ('completed', 'failed');
  delete from app_private.outbox_events where status in ('completed', 'failed') and expires_at < now();
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('outbox_events_deleted', deleted_count);

  delete from app_private.push_delivery_logs
  where (status = 'sent' and updated_at < now() - make_interval(days => push_sent_days))
    or (status = 'failed' and updated_at < now() - make_interval(days => push_failed_days));
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('push_delivery_logs_deleted', deleted_count);

  update app_private.idempotency_keys
  set expires_at = updated_at + make_interval(hours => idempotency_hours)
  where expires_at is distinct from updated_at + make_interval(hours => idempotency_hours);
  delete from app_private.idempotency_keys where expires_at < now();
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('idempotency_keys_deleted', deleted_count);

  delete from app_private.push_tokens
  where permission <> 'granted'
    or updated_at < now() - make_interval(days => inactive_push_token_days);
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('push_tokens_deleted', deleted_count);

  delete from app_private.deletion_jobs
  where (status = 'completed' and updated_at < now() - make_interval(days => deletion_completed_days))
    or (status = 'failed' and updated_at < now() - make_interval(days => deletion_failed_days));
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('deletion_jobs_deleted', deleted_count);

  delete from app_private.role_assignment_audit
  where created_at < now() - make_interval(days => role_audit_days);
  get diagnostics deleted_count = row_count;
  cleanup_details := cleanup_details || jsonb_build_object('role_assignment_audit_deleted', deleted_count);

  select count(*)::integer into failed_deletion_jobs
  from app_private.deletion_jobs where status = 'failed';
  cleanup_details := cleanup_details || jsonb_build_object('failed_deletion_jobs', failed_deletion_jobs);
  if failed_deletion_jobs > 0 then run_status := 'attention'; end if;

  delete from app_private.maintenance_runs
  where task_name = 'maintenance.cleanup'
    and id <> run_id
    and started_at < now() - make_interval(days => maintenance_days);

  update app_private.maintenance_runs
  set status = run_status, completed_at = now(), details = cleanup_details
  where id = run_id;

  return jsonb_build_object('ok', true, 'run_id', run_id, 'status', run_status, 'details', cleanup_details);
exception
  when others then
    if run_id is not null then
      update app_private.maintenance_runs
      set status = 'failed', completed_at = now(), error_trace_id = gen_random_uuid(), details = cleanup_details
      where id = run_id
      returning error_trace_id into failure_trace_id;
      raise warning 'maintenance failure trace %, error %', failure_trace_id, sqlerrm;
    end if;
    raise;
end;
$$;

create or replace function app_api.get_platform_dashboard_snapshot()
returns jsonb language sql security definer set search_path = app_private, public as $$
with
counters as (
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) value from app_private.platform_counters
),
category_counters as (
  select
    coalesce(jsonb_object_agg(category, issues), '{}'::jsonb) issues,
    coalesce(jsonb_object_agg(category, comments), '{}'::jsonb) comments
  from app_private.platform_category_counters
),
activity as (
  select coalesce((select value::timestamptz from app_private.runtime_settings where key='last_activity_at'), 'epoch'::timestamptz) value
),
outbox_counts as (
  select
    count(*) filter (where status='failed')::bigint failed,
    count(*) filter (where status in ('pending','processing'))::bigint pending,
    count(*) filter (where status='failed' and notion_completed_at is null)::bigint notion_failed,
    count(*) filter (where status in ('pending','processing') and notion_completed_at is null)::bigint notion_pending,
    min(created_at) filter (where status in ('pending','processing') and notion_completed_at is null) oldest_notion
  from app_private.outbox_events
),
operation_counts as (
  select
    (select count(*) from app_private.push_delivery_logs where status='failed')::bigint push_failed,
    (select count(*) from app_private.uploads where status='pending')::bigint upload_pending,
    (select count(*) from app_private.deletion_jobs where status in ('pending','failed','processing'))::bigint deletion_pending,
    (select count(*) from app_private.deletion_jobs where status='failed')::bigint deletion_failed
),
maintenance as (
  select coalesce((select to_jsonb(row) from (
    select status, started_at, completed_at, error_trace_id, details
    from app_private.maintenance_runs where task_name='maintenance.cleanup'
    order by started_at desc limit 1
  ) row), '{}'::jsonb) value
),
recent_failures as (
  select coalesce(jsonb_agg(item order by updated_at desc), '[]'::jsonb) value from (
    select id::text, 'outbox'::text source, status, error_trace_id,
      event_type detail_type, target_type, target_id, attempt_count, next_attempt_at, created_at, updated_at
    from app_private.outbox_events where status='failed'
    union all
    select id::text, 'push'::text, status, error_trace_id, notification_type,
      target_type, target_id, null::integer, null::timestamptz, created_at, updated_at
    from app_private.push_delivery_logs where status='failed'
    union all
    select id::text, 'cleanup'::text, status, error_trace_id, target_type,
      target_type, target_id, attempt_count, next_attempt_at, created_at, updated_at
    from app_private.deletion_jobs where status='failed'
    order by updated_at desc limit 12
  ) item
)
select jsonb_build_object(
  'counters', counters.value,
  'issues_by_category', category_counters.issues,
  'comments_by_category', category_counters.comments,
  'last_activity_at', activity.value,
  'outbox_failed', outbox_counts.failed,
  'outbox_pending', outbox_counts.pending,
  'notion_failed', outbox_counts.notion_failed,
  'notion_pending', outbox_counts.notion_pending,
  'oldest_pending_notion_at', outbox_counts.oldest_notion,
  'push_failed', operation_counts.push_failed,
  'upload_pending', operation_counts.upload_pending,
  'deletion_pending', operation_counts.deletion_pending,
  'deletion_failed', operation_counts.deletion_failed,
  'maintenance', maintenance.value,
  'recent_failures', recent_failures.value,
  'users_seen', coalesce((counters.value->>'users_seen')::bigint, 0)
)
from counters, category_counters, activity, outbox_counts, operation_counts, maintenance, recent_failures;
$$;

create or replace function app_api.claim_idempotency_key(actor_uid text, action_name text, request_id text)
returns table(claimed boolean, completed boolean, response jsonb)
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  existing app_private.idempotency_keys%rowtype;
  inserted_count integer := 0;
begin
  if length(btrim(coalesce(actor_uid,''))) = 0 or length(btrim(coalesce(action_name,''))) = 0
    or length(btrim(coalesce(request_id,''))) = 0 or length(request_id) > 120
  then raise exception 'validation-invalid'; end if;
  insert into app_private.idempotency_keys(uid,action,request_id)
  values(actor_uid,action_name,request_id) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  select * into existing from app_private.idempotency_keys
  where uid=actor_uid and action=action_name and idempotency_keys.request_id=claim_idempotency_key.request_id
  for update;
  if inserted_count = 1 then return query select true,false,null::jsonb; return; end if;
  if existing.status = 'completed' then return query select false,true,existing.response; return; end if;
  if existing.updated_at < now() - interval '10 minutes' then
    update app_private.idempotency_keys set updated_at=now(), expires_at=now()+interval '1 day'
    where uid=actor_uid and action=action_name and idempotency_keys.request_id=claim_idempotency_key.request_id;
    return query select true,false,null::jsonb; return;
  end if;
  return query select false,false,null::jsonb;
end;
$$;

revoke all on function app_api.claim_idempotency_key(text, text, text) from public, anon, authenticated;
grant execute on function app_api.claim_idempotency_key(text, text, text) to service_role;

