-- Preserve existing administrators when moving authorization from user_roles to RBAC.

insert into app_private.user_role_assignments(uid, role_code, granted_by)
select uid, 'platform-admin', uid
from app_private.user_roles
where role = 'admin'
on conflict (uid, role_code) do nothing;

insert into app_private.role_assignment_audit(uid, role_code, operation, actor_uid)
select legacy.uid, 'platform-admin', 'grant', legacy.uid
from app_private.user_roles legacy
where legacy.role = 'admin'
  and not exists (
    select 1
    from app_private.role_assignment_audit audit
    where audit.uid = legacy.uid
      and audit.role_code = 'platform-admin'
      and audit.operation = 'grant'
  );
