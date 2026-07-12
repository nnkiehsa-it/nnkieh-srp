update app_private.uploads
set
  delivery_url = null,
  delivery_url_expires_at = null,
  delivery_url_scope = null
where delivery_url_scope is not null;

alter table app_private.uploads
  drop constraint if exists uploads_delivery_url_scope_check;

alter table app_private.uploads
  add constraint uploads_delivery_url_scope_check
  check (delivery_url_scope in ('private-v2', 'public-v2'));
