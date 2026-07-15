-- Keep platform administration as the single full-access role and make every
-- other administrator role explicitly domain-scoped.

update app_private.roles
set label = case code
  when 'platform-admin' then '平台管理員'
  when 'proposal-manager' then '提案管理員'
  when 'announcement-manager' then '公告管理員'
  when 'general-affairs' then '設備管理員'
  else label
end
where code in ('platform-admin', 'proposal-manager', 'announcement-manager', 'general-affairs');

delete from app_private.role_permissions
where role_code in ('platform-admin', 'proposal-manager', 'announcement-manager', 'general-affairs');

insert into app_private.role_permissions(role_code, permission_code) values
  ('platform-admin', 'proposal.manage'),
  ('platform-admin', 'announcement.manage'),
  ('platform-admin', 'facility.manage'),
  ('platform-admin', 'role.manage'),
  ('platform-admin', 'dashboard.view'),
  ('proposal-manager', 'proposal.manage'),
  ('announcement-manager', 'announcement.manage'),
  ('general-affairs', 'facility.manage');

-- A platform administrator already receives every permission. Remove redundant
-- scoped assignments so removing the highest role does not leave hidden access.
delete from app_private.user_role_assignments
where role_code <> 'platform-admin'
  and uid in (
    select uid
    from app_private.user_role_assignments
    where role_code = 'platform-admin'
  );
