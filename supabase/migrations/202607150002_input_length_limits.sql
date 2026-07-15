-- Enforce the current user-visible input limits without counting managed image
-- references as text. Column-specific triggers leave untouched legacy rows safe.

create or replace function app_private.visible_media_text_length(value text)
returns integer
language sql
immutable
set search_path = app_private, public
as $$
  select char_length(btrim(regexp_replace(
    coalesce(value, ''),
    E'!\\[[^]]*\\]\\(srp-upload://[^)]+\\)',
    '',
    'g'
  )));
$$;

create or replace function app_private.enforce_entry_input_limits()
returns trigger
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  row_data jsonb := to_jsonb(new);
  title_value text := coalesce(row_data ->> 'title', '');
  content_value text := coalesce(row_data ->> 'content', '');
begin
  if tg_table_name in ('issues', 'announcements') then
    if char_length(btrim(title_value)) not between 1 and 30 then
      raise exception using errcode = '23514', message = 'title-too-long';
    end if;
    if app_private.visible_media_text_length(content_value) > 1000 then
      raise exception using errcode = '23514', message = 'content-too-long';
    end if;
  elsif tg_table_name in ('comments', 'announcement_comments')
    and app_private.visible_media_text_length(content_value) > 70 then
    raise exception using errcode = '23514', message = 'comment-too-long';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_issue_input_limits on app_private.issues;
create trigger enforce_issue_input_limits
before insert or update of title, content on app_private.issues
for each row execute function app_private.enforce_entry_input_limits();

drop trigger if exists enforce_announcement_input_limits on app_private.announcements;
create trigger enforce_announcement_input_limits
before insert or update of title, content on app_private.announcements
for each row execute function app_private.enforce_entry_input_limits();

drop trigger if exists enforce_comment_input_limits on app_private.comments;
create trigger enforce_comment_input_limits
before insert or update of content on app_private.comments
for each row execute function app_private.enforce_entry_input_limits();

drop trigger if exists enforce_announcement_comment_input_limits on app_private.announcement_comments;
create trigger enforce_announcement_comment_input_limits
before insert or update of content on app_private.announcement_comments
for each row execute function app_private.enforce_entry_input_limits();

revoke all on function app_private.visible_media_text_length(text)
  from public, anon, authenticated;
revoke all on function app_private.enforce_entry_input_limits()
  from public, anon, authenticated;
