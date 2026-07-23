-- Pin every remaining mutable app_private function search path. These functions
-- either use fully-qualified application objects or only PostgreSQL built-ins,
-- so no caller-controlled schema needs to participate in name resolution.

alter function app_private.firebase_project_id()
  set search_path = pg_catalog, app_private;
alter function app_private.firebase_uid()
  set search_path = pg_catalog, app_private;
alter function app_private.issue_list_sort_date(app_private.issues, text, text)
  set search_path = pg_catalog, app_private;
alter function app_private.issue_user_sort_date(app_private.issues, text)
  set search_path = pg_catalog, app_private;
alter function app_private.refresh_announcement_comment_count()
  set search_path = pg_catalog, app_private;
alter function app_private.refresh_announcement_like_count()
  set search_path = pg_catalog, app_private;
alter function app_private.set_issue_derived_fields()
  set search_path = pg_catalog, app_private;
alter function app_private.skip_duplicate_active_deletion_job()
  set search_path = pg_catalog, app_private;
alter function app_private.skip_identical_outbox_update()
  set search_path = pg_catalog, app_private;
alter function app_private.touch_updated_at()
  set search_path = pg_catalog, app_private;
alter function app_private.validate_announcement_comment_parent()
  set search_path = pg_catalog, app_private;
alter function app_private.validate_comment_parent()
  set search_path = pg_catalog, app_private;

-- RLS-without-policy notices on app_private tables are intentional deny-by-default
-- boundaries. Reassert grants here without adding permissive client policies.
revoke all on table
  app_private.access_assignment_audit,
  app_private.announcement_comments,
  app_private.announcement_likes,
  app_private.announcements,
  app_private.category_configuration_audit,
  app_private.content_revisions,
  app_private.deletion_jobs,
  app_private.facility_categories
from public, anon, authenticated;
