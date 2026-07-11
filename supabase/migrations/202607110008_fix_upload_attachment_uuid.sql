create or replace function app_private.attach_markdown_uploads_from_content()
returns trigger
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  upload_ids uuid[];
  removed_upload_ids uuid[];
  target_type_name text;
  valid_upload_count integer;
begin
  select coalesce(array_agg(distinct captures[1]::uuid), array[]::uuid[])
  into upload_ids
  from regexp_matches(
    coalesce(new.content, ''),
    'srp-upload://([0-9a-fA-F-]{36})',
    'g'
  ) as captures;

  target_type_name := case tg_table_name
    when 'issues' then 'issue'
    when 'comments' then 'comment'
    when 'announcements' then 'announcement'
    when 'announcement_comments' then 'announcement_comment'
    else null
  end;
  if target_type_name is null then
    raise exception 'unsupported-upload-target';
  end if;

  if cardinality(upload_ids) > 0 then
    select count(*)
    into valid_upload_count
    from app_private.uploads
    where id = any(upload_ids)
      and (target_type_name = 'announcement' or owner_uid = new.author_uid)
      and status in ('ready', 'attached')
      and (
        attached_target_id is null
        or (
          attached_target_type = target_type_name
          and attached_target_id = new.id
        )
      );

    if valid_upload_count <> cardinality(upload_ids) then
      raise exception 'upload-attachment-invalid';
    end if;

    update app_private.uploads
    set
      attached_target_id = new.id,
      attached_target_type = target_type_name,
      status = 'attached',
      updated_at = now()
    where id = any(upload_ids)
      and (target_type_name = 'announcement' or owner_uid = new.author_uid);
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(array_agg(id), array[]::uuid[])
    into removed_upload_ids
    from app_private.uploads
    where attached_target_type = target_type_name
      and attached_target_id = new.id
      and not (id = any(upload_ids));

    if cardinality(removed_upload_ids) > 0 then
      insert into app_private.deletion_jobs (target_type, target_id, cloudinary_public_id)
      select 'upload', id::text, cloudinary_public_id
      from app_private.uploads
      where id = any(removed_upload_ids);

      delete from app_private.uploads where id = any(removed_upload_ids);
    end if;
  end if;

  return new;
end;
$$;

create or replace function app_private.queue_deleted_content_uploads()
returns trigger
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  removed_upload_ids uuid[];
  target_type_name text;
begin
  target_type_name := case tg_table_name
    when 'issues' then 'issue'
    when 'comments' then 'comment'
    when 'announcements' then 'announcement'
    when 'announcement_comments' then 'announcement_comment'
    else null
  end;
  if target_type_name is null then
    raise exception 'unsupported-upload-target';
  end if;

  select coalesce(array_agg(id), array[]::uuid[])
  into removed_upload_ids
  from app_private.uploads
  where attached_target_type = target_type_name
    and attached_target_id = old.id;

  if cardinality(removed_upload_ids) > 0 then
    insert into app_private.deletion_jobs (target_type, target_id, cloudinary_public_id)
    select 'upload', id::text, cloudinary_public_id
    from app_private.uploads
    where id = any(removed_upload_ids);

    delete from app_private.uploads where id = any(removed_upload_ids);
  end if;
  return old;
end;
$$;

revoke all on function app_private.attach_markdown_uploads_from_content() from public, anon, authenticated;
revoke all on function app_private.queue_deleted_content_uploads() from public, anon, authenticated;
