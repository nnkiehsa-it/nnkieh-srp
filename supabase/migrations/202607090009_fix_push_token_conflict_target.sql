create or replace function app_api.backend_register_push_token(
  actor_uid text,
  device_id text,
  token text,
  permission text,
  platform text,
  user_agent text
)
returns jsonb
language plpgsql
security definer
set search_path = app_private, app_api, public
as $$
begin
  insert into app_private.push_tokens(uid, device_id, token, permission, platform, user_agent, updated_at)
  values (
    backend_register_push_token.actor_uid,
    backend_register_push_token.device_id,
    backend_register_push_token.token,
    coalesce(backend_register_push_token.permission, 'default'),
    backend_register_push_token.platform,
    backend_register_push_token.user_agent,
    now()
  )
  on conflict on constraint push_tokens_pkey do update
  set token = excluded.token,
      permission = excluded.permission,
      platform = excluded.platform,
      user_agent = excluded.user_agent,
      updated_at = excluded.updated_at;

  return app_api.backend_push_notification_preference(
    backend_register_push_token.actor_uid,
    backend_register_push_token.device_id,
    backend_register_push_token.permission
  );
end;
$$;

grant execute on function app_api.backend_register_push_token(text,text,text,text,text,text) to service_role;
