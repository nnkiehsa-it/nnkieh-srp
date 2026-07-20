-- Make facility browsing and management category-scoped, matching proposal
-- category behavior. Existing personalized facility-created notifications were
-- incorrectly classified as admin feed entries; keep their recipients while
-- removing platform-admin visibility.

drop function if exists app_api.backend_list_facilities(
  text, boolean, text, text, text, text, timestamptz, integer, uuid, integer
);

create or replace function app_api.backend_list_facilities(
  actor_uid text,
  actor_is_admin boolean,
  managed_category_ids text[],
  category_filter text,
  bucket text,
  status_filter text,
  search_query text,
  sort_name text,
  cursor_created_at timestamptz,
  cursor_number integer,
  cursor_id uuid,
  page_size integer
)
returns jsonb language plpgsql security definer
set search_path = app_private, app_api, public as $$
declare
  rows_json jsonb;
  fetched integer;
  effective_size integer := least(greatest(page_size, 1), 50);
begin
  if not exists(
    select 1 from app_private.facility_categories category
    where category.id = category_filter and category.is_active
  ) then
    raise exception 'invalid-facility-category';
  end if;

  with candidates as (
    select
      facility.*,
      facility.author_uid = actor_uid or exists(
        select 1 from app_private.facility_report_affected_users affected
        where affected.facility_id = facility.id and affected.uid = actor_uid
      ) as current_user_affected,
      actor_is_admin or facility.category_id = any(coalesce(managed_category_ids, array[]::text[])) as can_manage_facility
    from app_private.facility_reports facility
    where facility.category_id = category_filter
      and (case when bucket = 'closed'
        then facility.status in ('completed', 'unable-to-handle')
        else facility.status in ('pending', 'processing') end)
      and (coalesce(status_filter, '') = '' or facility.status = status_filter)
      and (
        coalesce(search_query, '') = ''
        or facility.title_search like '%' || lower(search_query) || '%'
        or lower(facility.location) like '%' || lower(search_query) || '%'
      )
      and (cursor_id is null or case when sort_name = 'most-affected'
        then (facility.affected_count, facility.id) < (cursor_number, cursor_id)
        else (facility.created_at, facility.id) < (cursor_created_at, cursor_id) end)
    order by
      case when sort_name = 'most-affected' then facility.affected_count end desc,
      case when sort_name <> 'most-affected' then facility.created_at end desc,
      facility.id desc
    limit effective_size + 1
  ), selected as (
    select * from candidates limit effective_size
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'category_id', category_id,
    'title', title,
    'location', location,
    'status', status,
    'affected_count', affected_count,
    'author_uid', author_uid,
    'author_name', author_name,
    'author_photo_url', author_photo_url,
    'created_at', created_at,
    'updated_at', updated_at,
    'isOwnFacility', author_uid = actor_uid,
    'currentUserAffected', current_user_affected,
    'canManageFacility', can_manage_facility
  ) order by
    case when sort_name = 'most-affected' then affected_count end desc,
    case when sort_name <> 'most-affected' then created_at end desc,
    id desc), '[]'::jsonb), (select count(*) from candidates)
  into rows_json, fetched
  from selected;

  return jsonb_build_object('facilities', rows_json, 'hasMore', fetched > effective_size);
end;
$$;

revoke all on function app_api.backend_list_facilities(
  text, boolean, text[], text, text, text, text, text, timestamptz, integer, uuid, integer
) from public, anon, authenticated;
grant execute on function app_api.backend_list_facilities(
  text, boolean, text[], text, text, text, text, text, timestamptz, integer, uuid, integer
) to service_role;

update app_private.notifications
set source = 'user'
where type = 'facility_report_created'
  and source = 'admin'
  and recipient_uid is not null;
