import type { AuthContext, BackendSupabase, JsonRecord } from "./types.ts";
import { asUuid } from "./utils.ts";
import { asString } from "../_shared/http.ts";
import { canManageIssueCategory } from "./auth.ts";
import { selectIssue } from "./issue-shared.ts";

export async function deleteIssue(payload: JsonRecord, auth: AuthContext, supabase: BackendSupabase) {
  const issueId = asUuid(payload.issueId);
  if (!issueId) return { success: true, issueId: "" };
  const issue = await selectIssue(supabase, issueId);
  const { error } = await supabase.schema("app_api").rpc("backend_delete_issue_with_upload_targets", {
    issue_id: issueId,
    actor_uid: auth.uid,
    actor_is_admin: canManageIssueCategory(auth, asString(issue.category)),
  });
  if (error) throw error;
  return { success: true, issueId };
}
