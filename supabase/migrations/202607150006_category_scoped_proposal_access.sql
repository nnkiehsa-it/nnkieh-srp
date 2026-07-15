-- Proposal management is scoped per config-driven category. Equipment and
-- announcement roles remain independent, while platform administrators retain
-- full access through their highest-level role.

create table if not exists app_private.user_issue_category_assignments (
  uid text not null,
  category_id text not null,
  granted_by text not null,
  granted_at timestamptz not null default now(),
  primary key (uid, category_id)
);

create index if not exists user_issue_category_assignments_category_uid_idx
  on app_private.user_issue_category_assignments(category_id, uid);

alter table app_private.user_issue_category_assignments enable row level security;
revoke all on app_private.user_issue_category_assignments from public, anon, authenticated;

-- Preserve existing proposal managers by granting every currently configured
-- category. Future categories appear from config and can be assigned normally.
insert into app_private.user_issue_category_assignments(uid, category_id, granted_by)
select assignment.uid, category.id, assignment.granted_by
from app_private.user_role_assignments assignment
cross join (values ('public-issues'), ('rights-maintenance')) as category(id)
where assignment.role_code = 'proposal-manager'
on conflict do nothing;

delete from app_private.user_role_assignments
where role_code = 'proposal-manager';

delete from app_private.role_permissions
where role_code = 'proposal-manager';
